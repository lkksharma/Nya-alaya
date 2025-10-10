from django.contrib import admin
from .models import Judge, Lawyer, Case, Schedule
# Register your models here.

admin.site.register(Judge)
admin.site.register(Lawyer)
admin.site.register(Case)
admin.site.register(Schedule)
