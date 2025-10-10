import random

def get_duration(case):
    base = {
        "civil": 60,
        "criminal": 90,
        "family": 45,
        "other": 50,
    }.get(case.case_type, 60)

    urgency_factor = 0.8 if case.urgency > 0.7 else 1.2
    noise = random.uniform(-10, 10)

    return max(30, int(base*urgency_factor + noise))
