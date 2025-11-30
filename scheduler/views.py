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

@api_view(['GET', 'POST'])
def regenerate(request):
    try:
        agent = HybridPlannerAgent()
        agent.run()
        return Response({
            "status": "success",
            "message": "Schedule regenerated successfully"
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

class JudgeViewSet(viewsets.ModelViewSet):
    queryset = Judge.objects.all()
    serializer_class = JudgeSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

    def perform_create(self, serializer):
        import json
        from datetime import datetime
        
        case = serializer.save()
        use_ai = self.request.data.get('use_ai', True)  # Default to True (30s timeout)
        
        # use_ai True = 30s timeout, False = no timeout
        timeout = 30 if use_ai else None
        
        ai_analysis = analyze_case_with_ai(
            case_number=case.case_number,
            case_type=case.case_type,
            description=case.description,
            filed_date=case.filed_in,
            timeout=timeout
        )
        
        case.urgency = ai_analysis['urgency']
        case.estimated_duration = ai_analysis['estimated_duration']
        case.priority = calculate_ai_priority(case, ai_analysis)
        case.ai_analysis = ai_analysis  # Save the full AI analysis
        case.save()
        
        # Log to file for debugging
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'case_number': case.case_number,
            'case_type': case.case_type,
            'description': case.description,
            'used_ai': use_ai,
            'ai_analysis': ai_analysis,
            'final_values': {
                'urgency': case.urgency,
                'duration': case.estimated_duration,
                'priority': case.priority
            }
        }
        
        with open('/tmp/case_ai_analysis.log', 'a') as f:
            f.write(json.dumps(log_entry, indent=2) + '\n---\n')
        
        print(f"  {'AI' if use_ai else 'Rule-based'} Analysis for {case.case_number}:")
        print(f"  Urgency: {case.urgency}")
        print(f"  Duration: {case.estimated_duration} min")
        print(f"  Priority: {case.priority}")
        print(f"  Reasoning: {ai_analysis.get('reasoning', 'N/A')}")
    
    def perform_update(self, serializer):
        import json
        from datetime import datetime

        case = serializer.save()
        use_ai = self.request.data.get('use_ai', True)  # Default to True (30s timeout)
        
        # use_ai True = 30s timeout, False = no timeout
        timeout = 30 if use_ai else None
        
        ai_analysis = analyze_case_with_ai(
            case_number=case.case_number,
            case_type=case.case_type,
            description=case.description,
            filed_date=case.filed_in,
            timeout=timeout
        )

        case.urgency = ai_analysis['urgency']
        case.estimated_duration = ai_analysis['estimated_duration']
        case.priority = calculate_ai_priority(case, ai_analysis)
        case.ai_analysis = ai_analysis  # Save the full AI analysis
        
        case.save()
        
        # Log to file for debugging
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'operation': 'update',
            'case_number': case.case_number,
            'case_type': case.case_type,
            'description': case.description,
            'used_ai': use_ai,
            'ai_analysis': ai_analysis,
            'final_values': {
                'urgency': case.urgency,
                'duration': case.estimated_duration,
                'priority': case.priority
            }
        }
        
        with open('/tmp/case_ai_analysis.log', 'a') as f:
            f.write(json.dumps(log_entry, indent=2) + '\n---\n')
        
        print(f"  {'AI' if use_ai else 'Rule-based'} Analysis (UPDATE) for {case.case_number}:")
        print(f"  Urgency: {case.urgency}")
        print(f"  Duration: {case.estimated_duration} min")
        print(f"  Priority: {case.priority}")
        print(f"  Reasoning: {ai_analysis.get('reasoning', 'N/A')}")

class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all()
    serializer_class = LawyerSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@api_view(['POST'])
def register_view(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, password=password, email=email)
        login(request, user)
        return Response({'message': 'User registered and logged in successfully', 'user': {'username': user.username, 'email': user.email}})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({'message': 'Login successful', 'user': {'username': user.username, 'email': user.email}})
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
def check_auth_view(request):
    if request.user.is_authenticated:
        return Response({'isAuthenticated': True, 'user': {'username': request.user.username, 'email': request.user.email}})
    else:
        return Response({'isAuthenticated': False})


