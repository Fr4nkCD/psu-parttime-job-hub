from rest_framework import viewsets
from .models import Job, Student
from .serializers import JobSerializer, StudentSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    
    # Simple search logic for your search bar
    def get_queryset(self):
        queryset = Job.objects.all()
        job_type = self.request.query_params.get('type')
        if job_type and job_type != 'all':
            queryset = queryset.filter(job_type=job_type.upper())
        return queryset.order_by('-created_at')

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer