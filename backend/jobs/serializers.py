from rest_framework import serializers
from .models import Job, Student, Application, WorkSchedule

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = ['date', 'start_time', 'end_time']

class JobSerializer(serializers.ModelSerializer):
    schedules = WorkScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'organization_name', 'description', 
            'location_type', 'job_type', 'compensation_amount', 
            'required_amount', 'status', 'poster_image_url', 'schedules',
            'academic_term', 'academic_year' # <--- ADD THESE
        ]

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'