from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobViewSet, StudentViewSet,
    ApplicationViewSet, EvaluationViewSet,
    AuthViewSet
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'students', StudentViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'evaluations', EvaluationViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]