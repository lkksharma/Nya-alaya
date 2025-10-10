from django.core.management.base import BaseCommand
from scheduler.tools.policy_retriever import retrieve_policies

class Command(BaseCommand):
    help = "Test retrieval of court policies."

    def handle(self, *args, **options):
        query = "How many cases can a judge handle per day?"
        results = retrieve_policies(query)
        for p, score in results:
            self.stdout.write(f"[{score:.3f}] {p.title} → {p.content[:70]}...")
