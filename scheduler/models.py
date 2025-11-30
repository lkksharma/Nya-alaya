from django.db import models

# Create your models here.
class Judge(models.Model):
    SPECIALIZATIONS = [
        ("criminal", "Criminal Law"),
        ("civil", "Civil Law"),
        ("family", "Family Law"),
        ("commercial", "Commercial Law"),
        ("general", "General Practice"),
    ]
    
    name = models.CharField(max_length=255)
    court = models.CharField(max_length=255)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS, default="general")
    experience_years = models.IntegerField(default=0)
    max_daily_cases = models.IntegerField(default=8)
    availability = models.JSONField(default=list)
    working_hours = models.JSONField(default=dict)  # 3:30 PM to 7:00 PM
    phone_number = models.CharField(max_length=20, blank=True, null=True)  # NEW: Phone number

    def __str__(self):
        return f"{self.name} ({self.court} - {self.specialization})"

class Lawyer(models.Model):
    SPECIALIZATIONS = [
        ("criminal", "Criminal Law"),
        ("civil", "Civil Law"),
        ("family", "Family Law"),
        ("corporate", "Corporate Law"),
        ("general", "General Practice"),
    ]
    
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS, default="general")
    experience_years = models.IntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    busy_slots = models.JSONField(default=list)
    max_cases = models.IntegerField(default=10)  # Max concurrent cases
    phone_number = models.CharField(max_length=20, blank=True, null=True)  # NEW: Phone number

    def __str__(self):
        return f"{self.name} ({self.specialization})"

class Case(models.Model):
    CASE_TYPES = [
        ("civil", "Civil"),
        ("criminal", "Criminal"),
        ("family", "Family"),
        ("other", "Other"),
    ]

    case_number = models.CharField(max_length=50, unique=True)
    case_type = models.CharField(max_length=50, choices=CASE_TYPES)
    description = models.TextField(blank=True, default='')  # NEW: Case description
    filed_in = models.DateField()
    urgency = models.FloatField(default=0.5)
    estimated_duration = models.IntegerField(default=60)
    priority = models.FloatField(default=0.0)
    ai_analysis = models.JSONField(default=dict, blank=True)  # Store TinyLlama's complete analysis
    assigned_judge = models.ForeignKey(Judge, on_delete=models.SET_NULL, null=True, blank=True)
    lawyers = models.ManyToManyField(Lawyer, blank=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return self.case_number

class Schedule(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    judge = models.ForeignKey(Judge, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time =  models.DateTimeField()
    room = models.CharField(max_length=50, default = "Courtroom 1")
    version = models.IntegerField(default =1) # what is this for?


    def __str__(self):
        return f"{self.case.case_number} -> {self.judge.name}"

class Policy(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    embedding = models.JSONField(default = list)
    source = models.CharField(max_length=100, default = "internal")

    def __str__(self):
        return self.title