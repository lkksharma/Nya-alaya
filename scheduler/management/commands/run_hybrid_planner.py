from django.core.management.base import BaseCommand
from scheduler.agent.planner_agent_v2 import HybridPlannerAgent

class Command(BaseCommand):
    help = "Run the hybrid LLM + OR-Tools planner agent"

    def handle(self, *args, **options):
        agent = HybridPlannerAgent()
        agent.run()
