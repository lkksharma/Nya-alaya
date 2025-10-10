from rest_framework import serializers
from .models import Judge, Lawyer, Case, Schedule

class JudgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Judge
        fields = "__all__"

class LawyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lawyer
        fields = "__all__"

class CaseSerializer(serializers.ModelSerializer):
    filed_in = serializers.DateField(input_formats=["%Y%m%d"], format="%Y-%m-%d")
    class Meta:
        model = Case
        fields = "__all__"

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"

