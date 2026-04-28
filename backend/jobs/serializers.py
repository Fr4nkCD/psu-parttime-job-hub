from rest_framework import serializers
from .models import Job, Student, WorkSchedule, Application, Evaluation

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = ['id', 'date', 'start_time', 'end_time']

class JobSerializer(serializers.ModelSerializer):
    schedules = WorkScheduleSerializer(many=True, required=False)
    applicants_count = serializers.SerializerMethodField()

    def get_applicants_count(self, obj):
        return obj.application_set.count()

    class Meta:
        model = Job
        fields = '__all__'

    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules', [])
        job = Job.objects.create(**validated_data)
        for item in schedules_data:
            WorkSchedule.objects.create(job=job, **item)
        return job

    def update(self, instance, validated_data):
        schedules_data = validated_data.pop('schedules', None)
        
        instance = super().update(instance, validated_data)

        if schedules_data is not None:
            if hasattr(instance, 'schedules'):
                instance.schedules.all().delete()
            else:
                instance.workschedule_set.all().delete()

            for item in schedules_data:
                # IMPORTANT: Remove the 'id' if it exists in the item 
                # to prevent primary key conflicts in some databases
                item.pop('id', None)
                WorkSchedule.objects.create(job=instance, **item)
        
        return instance

class StudentSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'student_id', 
            'email',
            'faculty', 'major', 'religion', 'allergies', 
            'student_card_image', 'user'
        ]

class EvaluationSerializer(serializers.ModelSerializer):
    job_title = serializers.SerializerMethodField()
    
    def get_job_title(self, obj):
        return obj.application.job.title

    class Meta:
        model = Evaluation
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    faculty = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    evaluation = EvaluationSerializer(read_only=True)

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
        read_only_fields = ['student', 'application_date']