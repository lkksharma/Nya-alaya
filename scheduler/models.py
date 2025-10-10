from django.db import models

# Create your models here.
class Judge(models.Model):
    name = models.CharField(max_length=255)
    court = models.CharField(max_length=255)
    availability = models.JSONField(default = list)

    def __str__(self):
        return f"{self.name} ( {self.court} )"

class Lawyer(models.Model):
    name = models.CharField(max_length=255)
    busy_slots = models.JSONField(default = list)

    def __str__(self):
        return self.name

class Case(models.Model):
    CASE_TYPES = [
        ("civil", "Civil"),
        ("criminal", "Criminal"),
        ("family", "Family"),
        ("other", "Other"),
    ]

    case_number = models.CharField(max_length=50, unique=True)
    case_type = models.CharField(max_length=50, choices = CASE_TYPES)
    filed_in = models.DateField()
    urgency = models.FloatField(default = 0.5)
    estimated_duration = models.IntegerField(default = 60)
    priority = models.FloatField(default = 0.0)
    assigned_judge = models.ForeignKey(Judge, on_delete=models.SET_NULL, null=True, blank=True)
    lawyers = models.ManyToManyField(Lawyer, blank=True)

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