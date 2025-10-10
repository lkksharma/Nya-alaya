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
    filed_in = serializers.DateField(input_formats=['%Y-%m-%d'], format='%Y-%m-%d')
    description = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Case
        fields = "__all__"
        extra_kwargs = {
            'urgency': {'required': False, 'read_only': True},
            'estimated_duration': {'required': False, 'read_only': True},
            'priority': {'required': False, 'read_only': True},
            'description': {'required': False},
        }

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"

