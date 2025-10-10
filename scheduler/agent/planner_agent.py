from datetime import datetime, timedelta
import random
from scheduler.models import Case, Judge, Lawyer, Schedule
from scheduler.tools.policy_retriever import retrieve_policies
from scheduler.tools.duration_model import get_duration
from scheduler.tools.priority_model import compute_priority
from scheduler.tools.constraint_solver import check_conflicts

class PlannerAgent:
    def __init__(self, target_day = None):
        self.target_day = target_day or datetime.now().date() + timedelta(days=1)

    def observe(self):
        self.cases = list(Case.objects.filter(assigned_judge__isnull = False))
        self.judges = list(Judge.objects.all())
        self.lawyers = list(Lawyer.objects.all())
        self.policies = retrieve_policies("scheduling rules")
        print(f"Observed {len(self.cases)} cases, {len(self.judges)} judges.")

    def think(self):
        for c in self.cases:
            c.estimated_duration = get_duration(c)
            c.priority = compute_priority(c)
            c.save()
        self.cases.sort(key=lambda x: x.priority, reverse=True)
        print(f"Prioritized cases: {[c.case_number for c in self.cases[:5]]}")

    def propose(self):
        assignments = []
        start_base = datetime.combine(self.target_day, datetime.strptime("10:00", "%H:%M").time())

        for i, c in enumerate(self.cases):
            judge = c.assigned_judge or random.choice(self.judges)
            start_time = start_base + timedelta(minutes=90* (i%8))
            end_time = start_time + timedelta(minutes=c.estimated_duration)
            assignments.append({
                "case": c.case_number,
                "judge": judge.name,
                "start":start_time,
                "end": end_time,
            })
        self.draft = assignments
        print(f"Proposed {len(assignments)} assignments.")
        return assignments

    def verify(self):
        feasible, conflicts = check_conflicts(self.draft)
        if feasible:
            print("No conflicts found.")
        else:
            print("Conflicts found:", conflicts)
        self.feasible = feasible
        self.conflicts = conflicts

    def act(self):
        if not self.feasible:
            print("Not saving due to found conflicts.")
            return
        Schedule.objects.all().delete()
        for a in self.draft:
            case = Case.objects.get(case_number=a["case"])
            judge = Judge.objects.get(name=a["judge"])
            Schedule.objects.create(
                case=case,
                judge=judge,
                start_time=a["start"],
                end_time=a["end"],
                room="Courtroom 1",
                version=1,
            )
        print(f"Saved {len(self.draft)} schedules to DB.")

    def run(self):
        print(f"-=-=-=-=-= Planning for {self.target_day} =-=-=-=-=-")
        self.observe()
        self.think()
        self.propose()
        self.verify()
        self.act()
        print(f"-=-=-=-=-= Planning complete =-=-=-=-=-")