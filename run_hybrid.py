"""
run_hybrid.py — Standalone runner for Hybrid Planner Agent (Gemini + OR-Tools)
"""

import os
import django

# ----------------------------
# 1. Setup Django environment
# ----------------------------
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'court_agent.settings')
django.setup()

from scheduler.agent.planner_agent_v2 import HybridPlannerAgent

# ----------------------------
# 2. Check Gemini API Key
# ----------------------------
if not os.getenv("GOOGLE_API_KEY"):
    print("GOOGLE_API_KEY not found. Please set it with:")
    print('   export GOOGLE_API_KEY="your_gemini_api_key"')
    exit(1)

# ----------------------------
# 3. Run the Planner Agent
# ----------------------------
if __name__ == "__main__":
    print("\n-=-=-=-=-= Hybrid-Planning (Gemini + OR-Tools) =-=-=-=-=")
    agent = HybridPlannerAgent()

    try:
        agent.run()
        print("\nPlanner completed successfully.")
        print(f"Policy Summary:\n{agent.policy_summary}\n")

        if hasattr(agent, 'assignments'):
            print(f"Generated {len(agent.assignments)} case assignments:")
            for (case, judge) in agent.assignments:
                print(f"  • {case.case_number} → {judge.name}")
        else:
            print("No assignments generated — check constraints or data.")

    except Exception as e:
        print("\nError during planning:", str(e))
        raise
