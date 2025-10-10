from django.core.management.base import BaseCommand
from scheduler.agent.planner_agent import PlannerAgent

class Command(BaseCommand):
    help = "Run the Planner Agent to create next-day court schedules."

    def handle(self, *args, **options):
        agent = PlannerAgent()
        agent.run()
