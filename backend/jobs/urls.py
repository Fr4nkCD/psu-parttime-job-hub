from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, StudentViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]