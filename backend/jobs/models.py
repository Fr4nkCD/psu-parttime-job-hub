from django.db import models
from django.contrib.auth.models import User

# Choices for Role-Based Access and Statuses
class UserRole(models.TextChoices):
    STUDENT = 'STUDENT', 'Student'
    ADMIN = 'ADMIN', 'Admin'

class JobType(models.TextChoices):
    INTERNAL = 'INTERNAL', 'Internal'
    EXTERNAL = 'EXTERNAL', 'External'

class JobStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    CLOSED = 'CLOSED', 'Closed'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'

class ApplicationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

# 1. Student Profile linked to Django's built-in User
class Student(models.Model):
    user = models.OneToOneField(User, related_name='student_profile', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=10, unique=True) # e.g., 6630613009
    faculty = models.CharField(max_length=100)
    major = models.CharField(max_length=100)
    religion = models.CharField(max_length=50, blank=True)
    allergies = models.TextField(blank=True)
    student_card_image = models.ImageField(upload_to='student_cards/', null=True, blank=True)

    def __str__(self):
        return f"{self.student_id} - {self.first_name}"

# 2. Job Model
class Job(models.Model):
    title = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255)
    description = models.TextField()
    location_type = models.CharField(max_length=100)
    job_type = models.CharField(max_length=10, choices=JobType.choices)
    compensation_amount = models.DecimalField(max_digits=10, decimal_places=2)
    required_amount = models.IntegerField()
    status = models.CharField(max_length=15, choices=JobStatus.choices, default=JobStatus.OPEN)
    academic_term = models.IntegerField()
    academic_year = models.IntegerField()
    poster_image_url = models.URLField(max_length=500, null=True, blank=True)
    line_group_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# 3. Work Schedule for Jobs
class WorkSchedule(models.Model):
    job = models.ForeignKey(Job, related_name='schedules', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

# 4. Job Application logic
class Application(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.PROTECT)
    application_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=ApplicationStatus.choices, default=ApplicationStatus.APPROVED)

# 5. Performance Evaluation
class Evaluation(models.Model):
    application = models.OneToOneField(
        'Application', 
        db_index=True, 
        related_name='evaluation', 
        on_delete=models.CASCADE
    )
    # The following fields correctly implement your performance tracking goals [cite: 23, 548-550]
    punctuality_rating = models.IntegerField(default=5)
    responsibility_rating = models.IntegerField(default=5)
    grooming_rating = models.IntegerField(default=5)
    quality_rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    result_status = models.CharField(max_length=10, choices=[('PASS', 'Pass'), ('FAIL', 'Fail')])
    evaluation_date = models.DateTimeField(auto_now_add=True)