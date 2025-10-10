from django.core.management.base import BaseCommand
from scheduler.models import Case, Judge
from scheduler.tools.duration_model import get_duration
from scheduler.tools.priority_model import compute_priority
from scheduler.tools.constraint_solver import check_conflicts
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = "Test core tools integration"

    def handle(self, *args, **options):
        case = Case.objects.first()
        if not case:
            self.stdout.write("Add at least one case first.")
            return

        dur = get_duration(case)
        pri = compute_priority(case)
        self.stdout.write(f"Duration: {dur} mins, Priority: {pri}")

        assignments = [
            {"case": "C1", "judge": "J1", "start": datetime.now(), "end": datetime.now() + timedelta(minutes=60)},
            {"case": "C2", "judge": "J1", "start": datetime.now() + timedelta(minutes=30), "end": datetime.now() + timedelta(minutes=90)}
        ]
        ok, conf = check_conflicts(assignments)
        self.stdout.write(f"Feasible: {ok}, Conflicts: {conf}")


