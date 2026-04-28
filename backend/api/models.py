from django.db import models
from django.conrib.auth.models import User

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    duration = models.IntegerField(help_text="Duration in minutes")
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class FocusSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True)
    start_time = models.DateTimeField()
    subject = models.CharField(max_length=200)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_planned = models.IntegerField()
    duration_actual = models.IntegerField(null=True, blank=True)

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        INTERRUPTED = 'interrupted', 'Interrupted'

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )