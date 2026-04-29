from rest_framework import serializers
from .models import Task, FocusSession


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'duration', 'completed', 'created_at']
        read_only_fields = ['id', 'created_at']


class FocusSessionSerializer(serializers.ModelSerializer):
    task_title = serializers.ReadOnlyField(source='task.title')

    class Meta:
        model = FocusSession
        fields = ['id', 'task', 'task_title', 'start_time', 'end_time',
                  'duration_planned', 'duration_actual', 'status']