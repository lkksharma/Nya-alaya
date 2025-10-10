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
        self.cases = list(Case.objects.filter(assigned_judge__isnull = True))
        self.judges = list(Judge.objects.all())
        self.policies = retrieve_policies("court scheduling and fairness policies")
        print(f"Observed {len(self.cases)} cases, {len(self.judges)} judges, {len(self.policies)} policy refs.")
    
    def _normalize_json(self, text: str):
        # Strip code fences if any
        if text.strip().startswith("```"):
            lines = text.strip().split("\n")
            text = "\n".join(lines[1:-1])
            text = text.replace("```json", "").replace("```", "").strip()
        # Extract JSON substring
        start, end = text.find("{"), text.rfind("}") + 1
        if start != -1 and end > start:
            text = text[start:end]
        # Parse JSON
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"priorities": [], "policy_summary": text}
    
    def think_with_llm(self):
        policy_context = "\n".join([f"- {p.content}" for p, _ in self.policies])
        case_summaries = "\n".join([f"- {c.case_number}: type={c.case_type}, urgency={c.urgency}, filed_on={c.filed_in}" for c in self.cases])
        
        prompt = f"""
You are an AI court scheduling assistant.
Today is {self.target_day}.
The following policies apply:
{policy_context}

The following cases are pending:
{case_summaries}

Judges available: {', '.join([j.name for j in self.judges])}

Using these rules, decide a fair daily scheduling plan outline:
- Which cases to prioritize (old/urgent/etc.)
- Max cases per judge
- Any buffer recommendations

Return ONLY a valid JSON object with two keys:
"priorities" (a list of case numbers) and "policy_summary" (a string).
"""

        # 1) Try local Ollama first
        try:
            import ollama
            ollama_model = os.getenv("OLLAMA_MODEL", "mistral:7b-instruct")
            print(f"Using Ollama model: {ollama_model}")
            resp = ollama.chat(
                model=ollama_model,
                messages=[
                    {"role": "system", "content": "Respond only with valid JSON (no markdown)."},
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.2},
            )
            text = resp["message"]["content"].strip()
            plan = self._normalize_json(text)
            print("=-=-=-=LLM Reasoning (Ollama)=-=-=-=")
            print(text)
            self.llm_plan = plan
            self.policy_summary = plan.get("policy_summary", "")
            return plan
        except Exception as e:
            print(f"Ollama unavailable or failed: {e}. Falling back to Gemini...")

        # 2) Fallback to Gemini if available
        try:
            import google.generativeai as genai
            GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if not GEMINI_KEY:
                raise RuntimeError("No GEMINI_API_KEY/GOOGLE_API_KEY set")
            genai.configure(api_key=GEMINI_KEY)
            gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            model = genai.GenerativeModel(gemini_model_name)
            generation_config = genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=300,
                response_mime_type="application/json",
            )
            response = model.generate_content(prompt, generation_config=generation_config)
            text = response.text.strip()
            plan = self._normalize_json(text)
            print("=-=-=-=LLM Reasoning (Gemini)=-=-=-=")
            print(text)
            self.llm_plan = plan
            self.policy_summary = plan.get("policy_summary", "")
            return plan
        except Exception as e:
            print(f"Gemini unavailable or failed: {e}. Using empty plan.")
            plan = {"priorities": [], "policy_summary": ""}
            self.llm_plan = plan
            self.policy_summary = ""
            return plan

    def compute_case_scores(self):
        for c in self.cases:
            c.estimated_duration = get_duration(c)
            c.priority = compute_priority(c)
            c.save()

    def optimize_with_ortools(self):
        from ortools.sat.python import cp_model
        model = cp_model.CpModel()
        judges, cases = self.judges, self.cases
        
        print(f"Optimizing: {len(cases)} cases, {len(judges)} judges")
        
        if not cases:
            print("No cases to optimize!")
            self.assignments = []
            return
            
        if not judges:
            print("No judges available!")
            self.assignments = []
            return

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
            print(f"Solution found! Status: {status}")
            for i, c in enumerate(cases):
                for j, judge in enumerate(judges):
                    if solver.BooleanValue(x[(i,j)]):
                        assignments.append((c, judge))
                        print(f"Assigned {c.case_number} to {judge.name}")
        else:
            print(f"No feasible schedule found. Status: {status}")
        self.assignments = assignments
    
    def act(self):
        Schedule.objects.all().delete()
        start_base = datetime.combine(self.target_day, datetime.strptime("10:00", "%H:%M").time())
        
        for idx, (case, judge) in enumerate(self.assignments):
            start = start_base + timedelta(minutes=90* (idx%8))
            end = start + timedelta(minutes=case.estimated_duration)
            
            # Create schedule
            Schedule.objects.create(
                case=case,
                judge=judge,
                start_time=start,
                end_time=end,
                room="Courtroom 1",
                version=2,
            )
            
            # Assign judge to case
            case.assigned_judge = judge
            case.save()
            
            # Assign lawyer based on specialization match
            lawyer = self._find_best_lawyer(case)
            if lawyer:
                case.lawyers.add(lawyer)
                print(f"Assigned lawyer {lawyer.name} ({lawyer.specialization}) to {case.case_number}")
            
        print(f"Saved {len(self.assignments)} optimized schedules to DB.")

    def _find_best_lawyer(self, case):
        """Find best lawyer for a case based on specialization"""
        from scheduler.models import Lawyer, Case as CaseModel
        
        # Get all lawyers
        lawyers = list(Lawyer.objects.all())
        if not lawyers:
            return None
        
        # Find lawyers matching case type
        matching_lawyers = [l for l in lawyers if l.specialization == case.case_type]
        
        # If no exact match, try general practice lawyers
        if not matching_lawyers:
            matching_lawyers = [l for l in lawyers if l.specialization == "general"]
        
        # If still none, use any available lawyer
        if not matching_lawyers:
            matching_lawyers = lawyers
        
        # Choose lawyer with fewest current cases
        best_lawyer = None
        min_cases = float('inf')
        
        for lawyer in matching_lawyers:
            current_cases = CaseModel.objects.filter(lawyers=lawyer).count()
            if current_cases < min_cases and current_cases < lawyer.max_cases:
                min_cases = current_cases
                best_lawyer = lawyer
        
        return best_lawyer

    def run(self):
        print(f"-=-=-=-=-= Hybrid-Planning for {self.target_day} =-=-=-=-=-")
        self.observe()
        self.think_with_llm()
        self.compute_case_scores()
        self.optimize_with_ortools()
        self.act()
        print(f"-=-=-=-=-= Hybrid-Planning complete =-=-=-=-=-")