from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets
from .models import Judge, Lawyer, Case, Schedule
from .serializers import JudgeSerializer, LawyerSerializer, CaseSerializer, ScheduleSerializer

@api_view(['GET'])
def health_check(request):
    return Response({"status":"ok", "message":"Backend is running"})

class JudgeViewSet(viewsets.ModelViewSet):
    queryset = Judge.objects.all()
    serializer_class = JudgeSerializer

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all()
    serializer_class = LawyerSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

