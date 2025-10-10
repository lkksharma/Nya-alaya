def check_conflicts(assignments):
    conflicts = []
    for i in range(len(assignments)):
        for j in range(i + 1, len(assignments)):
            a, b = assignments[i], assignments[j]
            if a['judge'] == b['judge']:
                if (a['start'] < b['end']) and (b['start'] < a['end']):
                    conflicts.append(f"Judge {a['judge']} double-booked for {a['case']} and {b['case']}")

    for a in assignments:
        if (a['end'] - a['start']).total_seconds() < 1800:
            conflicts.append(f"Case {a['case']} has too short duration (<30 min)")

    feasible = len(conflicts) == 0
    return feasible, conflicts
