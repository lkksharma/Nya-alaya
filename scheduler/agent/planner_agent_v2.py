from datetime import datetime, timedelta
from scheduler.models import Case, Judge, Schedule, Lawyer
from scheduler.tools.priority_model import compute_priority
from scheduler.tools.duration_model import get_duration
from scheduler.tools.policy_retriever import retrieve_policies
import json, os

class HybridPlannerAgent:
    def __init__(self, target_day=None):
        self.target_day = target_day or datetime.now().date() + timedelta(days=1)
        self.llm_plan = {"priorities": [], "policy_summary": ""}
        self.full_plan = [] 
    
    def observe(self):
        self.cases = list(Case.objects.all())
        self.judges = list(Judge.objects.all())
        self.lawyers = list(Lawyer.objects.all())
        self.policies = retrieve_policies("court scheduling and fairness policies")
        print(f"Observed {len(self.cases)} cases, {len(self.judges)} judges, {len(self.lawyers)} lawyers.")

    # ... [JSON normalization and LLM logic remains the same] ...
    def _normalize_json(self, text: str):
        # (Same as previous)
        if text.strip().startswith("```"):
            lines = text.strip().split("\n")
            text = "\n".join(lines[1:-1])
            text = text.replace("```json", "").replace("```", "").strip()
        start, end = text.find("{"), text.rfind("}") + 1
        if start != -1 and end > start: text = text[start:end]
        try: return json.loads(text)
        except json.JSONDecodeError: return {"priorities": [], "policy_summary": text}

    def think_with_llm(self):
        # (Same as previous)
        return {"priorities": [], "policy_summary": ""}

    def compute_case_scores(self):
        for c in self.cases:
            c.estimated_duration = get_duration(c)
            c.priority = compute_priority(c)
            if c.case_number in self.llm_plan.get("priorities", []):
                c.priority *= 1.2
            c.save()

    def _get_urgency_multiplier(self, case):
        """
        Converts case urgency into a mathematical multiplier.
        Assumes urgency is 1-10, or maps strings to ints.
        """
        # If urgency is an integer 1-10
        u_val = getattr(case, 'urgency', 1)
        
        # If urgency is a string (Example mapping)
        if isinstance(u_val, str):
            u_map = {"High": 3, "Medium": 1.5, "Low": 1}
            return u_map.get(u_val, 1)
            
        # If already numeric, normalize it so standard is ~1.0 and High is ~3.0
        # Assuming raw urgency is 1 to 5:
        return max(1, float(u_val or 1))

    def optimize_judges(self):
        """Stage 1: Assign Judges (Urgency-Weighted Specialization)"""
        from ortools.sat.python import cp_model
        model = cp_model.CpModel()
        judges, cases = self.judges, self.cases
        
        if not cases or not judges: return
        print(f"--- Stage 1: Optimizing Judges ({len(cases)} cases) ---")

        x = {} 
        for i, c in enumerate(cases):
            for j, judge in enumerate(judges):
                x[(i,j)] = model.NewBoolVar(f"x_judge_{i}_{j}")

        # Constraints
        for i in range(len(cases)):
            model.Add(sum(x[(i,j)] for j in range(len(judges))) == 1)
        
        judge_load = [model.NewIntVar(0, 8, f'j_load_{j}') for j in range(len(judges))]
        for j in range(len(judges)):
            model.Add(judge_load[j] == sum(x[(i,j)] for i in range(len(cases))))

        # --- Objective with URGENCY SCALING ---
        obj_terms = []
        for i, c in enumerate(cases):
            urgency_mult = self._get_urgency_multiplier(c)
            
            for j, judge in enumerate(judges):
                # 1. Base Score (Priority)
                base_score = int(c.priority * 100)
                
                # 2. Specialization Score
                spec_score = 0
                if judge.specialization == c.case_type:
                    spec_score = 50
                elif judge.specialization == "general":
                    spec_score = 10
                else:
                    spec_score = -30
                
                # 3. APPLY MULTIPLIER
                # If Urgent (mult=3): Match becomes +150, Mismatch becomes -90
                # If Low (mult=1): Match stays +50, Mismatch stays -30
                weighted_spec_score = int(spec_score * urgency_mult)
                
                total_score = base_score + weighted_spec_score
                obj_terms.append(total_score * x[(i,j)])

        # Quadratic Load Penalty
        sq_loads = []
        for j, load in enumerate(judge_load):
            sq = model.NewIntVar(0, 64, f"sq_load_{j}")
            model.AddMultiplicationEquality(sq, [load, load])
            sq_loads.append(sq)
        
        model.Maximize(sum(obj_terms) - sum(sq_loads) * 10)

        solver = cp_model.CpSolver()
        status = solver.Solve(model)

        self.full_plan = []
        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            judge_counters = {j.id: 0 for j in judges}
            for i, c in enumerate(cases):
                for j, judge in enumerate(judges):
                    if solver.BooleanValue(x[(i,j)]):
                        slot = judge_counters[judge.id]
                        judge_counters[judge.id] += 1
                        self.full_plan.append({
                            "case": c,
                            "judge": judge,
                            "slot": slot,
                            "lawyer": None
                        })
            print(f"Judge assignment complete. Assigned {len(self.full_plan)} cases.")

    def optimize_lawyers(self):
        """Stage 2: Assign Lawyers (Urgency-Weighted Specialization)"""
        from ortools.sat.python import cp_model
        model = cp_model.CpModel()
        lawyers = self.lawyers
        plan = self.full_plan
        
        if not plan or not lawyers: return
        print(f"--- Stage 2: Optimizing Lawyers ({len(lawyers)} available) ---")

        y = {}
        for p_idx, item in enumerate(plan):
            for l_idx, lawyer in enumerate(lawyers):
                y[(p_idx, l_idx)] = model.NewBoolVar(f"y_lawyer_{p_idx}_{l_idx}")

        # Constraints (Coverage, Conflict, Capacity)
        for p_idx in range(len(plan)):
            model.Add(sum(y[(p_idx, l_idx)] for l_idx in range(len(lawyers))) == 1)

        cases_by_slot = {}
        for p_idx, item in enumerate(plan):
            slot = item['slot']
            if slot not in cases_by_slot: cases_by_slot[slot] = []
            cases_by_slot[slot].append(p_idx)
        
        for slot, p_indices in cases_by_slot.items():
            if len(p_indices) > 1:
                for l_idx in range(len(lawyers)):
                    model.Add(sum(y[(p, l_idx)] for p in p_indices) <= 1)

        lawyer_load = [model.NewIntVar(0, 5, f'l_load_{l}') for l in range(len(lawyers))]
        for l_idx in range(len(lawyers)):
            model.Add(lawyer_load[l_idx] == sum(y[(p, l_idx)] for p in range(len(plan))))

        # --- Objective with URGENCY SCALING ---
        obj_terms = []
        for p_idx, item in enumerate(plan):
            case = item['case']
            urgency_mult = self._get_urgency_multiplier(case)
            
            for l_idx, lawyer in enumerate(lawyers):
                # Calculate Base Spec Score
                spec_score = 0
                if lawyer.specialization == case.case_type:
                    spec_score = 50
                elif lawyer.specialization == "general":
                    spec_score = 10
                else:
                    spec_score = -20 
                
                # Apply Multiplier
                # High urgency forces the solver to pick the specialist
                weighted_score = int(spec_score * urgency_mult)
                
                obj_terms.append(weighted_score * y[(p_idx, l_idx)])

        # Quadratic Load Penalty
        sq_loads = []
        for l_idx, load in enumerate(lawyer_load):
            sq = model.NewIntVar(0, 25, f"sq_l_load_{l_idx}")
            model.AddMultiplicationEquality(sq, [load, load])
            sq_loads.append(sq)

        model.Maximize(sum(obj_terms) - sum(sq_loads) * 10)

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5
        status = solver.Solve(model)

        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            print(f"Lawyer assignment success! Status: {status}")
            for p_idx, item in enumerate(plan):
                for l_idx, lawyer in enumerate(lawyers):
                    if solver.BooleanValue(y[(p_idx, l_idx)]):
                        item['lawyer'] = lawyer
        else:
            print("CRITICAL: Could not find valid lawyer schedule.")

    def act(self):
        # (Same as previous)
        Schedule.objects.all().delete()
        base_time = datetime.combine(self.target_day, datetime.strptime("10:00", "%H:%M").time())
        
        saved_count = 0
        for item in self.full_plan:
            case = item['case']
            judge = item['judge']
            lawyer = item['lawyer']
            slot = item['slot']
            
            start_time = base_time + timedelta(minutes=90 * slot)
            end_time = start_time + timedelta(minutes=case.estimated_duration or 60)
            
            if not lawyer: continue

            Schedule.objects.create(
                case=case,
                judge=judge,
                start_time=start_time,
                end_time=end_time,
                room=f"Room-{judge.id}",
                version=4
            )
            
            case.assigned_judge = judge
            case.lawyers.clear()
            case.lawyers.add(lawyer)
            case.save()
            saved_count += 1
            
        print(f"Finalized and saved {saved_count} schedules.")

    def run(self):
        print(f"-=-=- Hybrid-Planning for {self.target_day} -=-=-")
        self.observe()
        self.think_with_llm()
        self.compute_case_scores()
        self.optimize_judges()
        self.optimize_lawyers()
        self.act()
        print(f"-=-=- Planning Complete -=-=-")