from datetime import date

def compute_priority(case):
    age_days = (date.today() - case.filed_in).days
    age_score = min(age_days/365, 1)

    type_weight = {
        "criminal": 0.9,
        "civil": 0.7,
        "family": 0.8,
        "other": 0.6
    }.get(case.case_type, 0.7)

    priority = 0.5 * case.urgency + 0.3 * age_score + 0.2 * type_weight
    return round(min(priority, 1.0), 3)
