from datetime import datetime, timedelta

def get_available_slots(entity, day):
    """
    Returns available slots for a judge or lawyer on a given day.
    entity.availability or busy_slots is a list of dicts:
      { 'day': 'Monday', 'start': '10:00', 'end': '17:00' }
    """
    weekday = day.strftime("%A")
    slots = [s for s in getattr(entity, "availability", []) if s.get("day") == weekday]

    formatted = []
    for s in slots:
        start = datetime.combine(day, datetime.strptime(s['start'], "%H:%M").time())
        end = datetime.combine(day, datetime.strptime(s['end'], "%H:%M").time())
        formatted.append((start, end))

    return formatted