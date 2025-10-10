from datetime import datetime, timedelta
from scheduler.models import Case, Judge, Schedule
from scheduler.tools.priority_model import compute_priority
from scheduler.tools.constraint_solver import check_conflicts
from scheduler.tools.duration_model import get_duration
from scheduler.tools.policy_retriever import retrieve_policies
import json, os



class HybridPlannerAgent:
    def __init__(self, target_day=None):
        self.target_day = target_day or datetime.now().date() + timedelta(days=1)
    
    def observe(self):
        self.cases = list(Case.objects.filter(assigned_judge__isnull = False))
        self.judges = list(Judge.objects.all())
        self.policies = retrieve_policies("court scheduling and fairness policies")
        print(f"Observed {len(self.cases)} cases, {len(self.judges)} judges, {len(self.policies)} policy refs.")
    
    def think_with_llm(self):
        import google.generativeai as genai
        import os
        import json

        # 1. Configure the Gemini client
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=GOOGLE_API_KEY)

        policy_context = "\n".join([f"- {p.content}" for p, _ in self.policies])
        case_summaries = "\n".join([f"- {c.case_number}: type={c.case_type}, urgency={c.urgency}, filed_on={c.filed_in}" for c in self.cases])
        
        prompt = f"""
        You are an AI court scheduling assistant.
        Today is {self.target_day}.
        The following policies apply:\n{policy_context}
        The following cases are pending:\n{case_summaries}
        Judges available: {', '.join([j.name for j in self.judges])}

        Using these rules, decide a fair daily scheduling plan outline:
        - Which cases to prioritize (old/urgent/etc.)
        - Max cases per judge
        - Any buffer recommendations
        Return ONLY a valid JSON object with two keys: "priorities" (a list of case numbers) and "policy_summary" (a string summarizing the plan).
        """
        
        # 2. Select the model and set generation config for JSON output
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        generation_config = genai.types.GenerationConfig(response_mime_type="application/json")

        # 3. Call the API
        response = model.generate_content(prompt, generation_config=generation_config)

        # 4. Parse the response
        reasoning = response.text
        print("=-=-=-=LLM Reasoning=-=-=-=")
        print(reasoning)

        try:
            plan = json.loads(reasoning)
        except json.JSONDecodeError:
            print("LLM did not return valid JSON. Handling as text.")
            plan  = {"priorities": [], "policy_summary": reasoning}
        
        self.llm_plan = plan
        self.policy_summary = plan.get("policy_summary", "")
        return plan

    def compute_case_scores(self):
        for c in self.cases:
            c.estimated_duration = get_duration(c)
            c.priority = compute_priority(c)
            c.save()

    def optimize_with_ortools(self):
        from ortools.sat.python import cp_model  # moved inside
        model = cp_model.CpModel()
        judges, cases = self.judges, self.cases

        x = {}
        for i, c in enumerate(cases):
            for j, judge in enumerate(judges):
                x[(i,j)] = model.NewBoolVar(f"x_{i}_{j}")

        for i in range(len(cases)):
            model.Add(sum(x[(i,j)] for j in range(len(judges))) == 1)
        
        for j in range(len(judges)):
            model.Add(sum(x[(i,j)] for i in range(len(cases))) <= 8)

        model.Maximize(sum(c.priority * x[(i,j)] for i,c in enumerate(cases) for j in range(len(judges))))
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5
        status = solver.Solve(model)

        assignments = []

        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            for i, c in enumerate(cases):
                for j, judge in enumerate(judges):
                    if solver.BooleanValue(x[(i,j)]):
                        assignments.append((c, judge))
                        
        else:
            print("No feasible schedule found.")
        self.assignments = assignments
    
    def act(self):
        Schedule.objects.all().delete()
        start_base = datetime.combine(self.target_day, datetime.strptime("10:00", "%H:%M").time())
        for idx, (case, judge) in enumerate(self.assignments):
            start = start_base + timedelta(minutes=90* (idx%8))

            end = start + timedelta(minutes=case.estimated_duration)
            Schedule.objects.create(
                case=case,
                judge=judge,
                start_time=start,
                end_time=end,
                room="Courtroom 1",
                version=2,
            )
        print(f"Saved {len(self.assignments)} optimized schedules to DB.")

    def run(self):
        print(f"-=-=-=-=-= Hybrid-Planning for {self.target_day} =-=-=-=-=-")
        self.observe()
        self.think_with_llm()
        self.compute_case_scores()
        self.optimize_with_ortools()
        self.act()
        print(f"-=-=-=-=-= Hybrid-Planning complete =-=-=-=-=-")