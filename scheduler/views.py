from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets
from scheduler.agent.planner_agent_v2 import HybridPlannerAgent
from datetime import date
from .models import Judge, Lawyer, Case, Schedule
from .serializers import JudgeSerializer, LawyerSerializer, CaseSerializer, ScheduleSerializer
from case_analyzer import analyze_case_with_ai, calculate_ai_priority 

@api_view(['GET'])
def health_check(request):
    return Response({"status":"ok", "message":"Backend is running"})

def dashboard(request):
    today = date.today()
    schedules = Schedule.objects.filter(start_time__date=today).order_by("judge__name", "start_time")
    return render(request, "scheduler/dashboard.html", {"schedules": schedules, "today": today})

def regenerate(request):
    agent = HybridPlannerAgent()
    agent.run()
    return redirect("dashboard")

class JudgeViewSet(viewsets.ModelViewSet):
    queryset = Judge.objects.all()
    serializer_class = JudgeSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

    def perform_create(self, serializer):
        case = serializer.save()
        
        ai_analysis = analyze_case_with_ai(
            case_number=case.case_number,
            case_type=case.case_type,
            description=case.description,
            filed_date=case.filed_in
        )
        

        case.urgency = ai_analysis['urgency']
        case.estimated_duration = ai_analysis['estimated_duration']
        case.priority = calculate_ai_priority(case, ai_analysis)

        case.save()
        
        print(f"  AI Analysis for {case.case_number}:")
        print(f"  Urgency: {case.urgency}")
        print(f"  Duration: {case.estimated_duration} min")
        print(f"  Priority: {case.priority}")
        print(f"  Reasoning: {ai_analysis.get('reasoning', 'N/A')}")
    
    def perform_update(self, serializer):

        case = serializer.save()
        

        ai_analysis = analyze_case_with_ai(
            case_number=case.case_number,
            case_type=case.case_type,
            description=case.description,
            filed_date=case.filed_in
        )
        

        case.urgency = ai_analysis['urgency']
        case.estimated_duration = ai_analysis['estimated_duration']
        case.priority = calculate_ai_priority(case, ai_analysis)
        
        case.save()

class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all()
    serializer_class = LawyerSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

