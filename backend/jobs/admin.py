from django.contrib import admin
from .models import Student, Job, WorkSchedule, Application, Evaluation

admin.site.register(Student)
admin.site.register(Job)
admin.site.register(WorkSchedule)
admin.site.register(Application)
admin.site.register(Evaluation)