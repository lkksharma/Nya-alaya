from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"judges", JudgeViewSet)
router.register(r"cases", CaseViewSet)
router.register(r"lawyers", LawyerViewSet)
router.register(r"schedules", ScheduleViewSet)

urlpatterns = [
    path("health/", health_check),
    path('', include(router.urls)),
    path("dashboard/", dashboard, name="dashboard"),
    path("regenerate/", regenerate, name="regenerate"),
    path("auth/register/", register_view, name="register"),
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/check/", check_auth_view, name="check_auth"),
]