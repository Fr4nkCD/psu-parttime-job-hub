from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, StudentViewSet, ApplicationViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'students', StudentViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]