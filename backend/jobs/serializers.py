from rest_framework import serializers
from .models import Job, Student, WorkSchedule, Application, Evaluation

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    schedules = WorkScheduleSerializer(many=True, read_only=True)
    applicants_count = serializers.SerializerMethodField()

    def get_applicants_count(self, obj):
        return obj.application_set.count()

    class Meta:
        model = Job
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    faculty = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_id(self, obj):
        return obj.student.student_id

    def get_faculty(self, obj):
        return obj.student.faculty

    def get_job_title(self, obj):
        return obj.job.title

    class Meta:
        model = Application
        fields = '__all__'

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'