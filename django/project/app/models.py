from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django_ckeditor_5.fields import CKEditor5Field # type: ignore
import uuid
import json

# Create your models here.


class WorkflowInstance(models.Model):
    WORKFLOW_STATES = [
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    instance_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_id = models.CharField(max_length=255)
    workflow_name = models.CharField(max_length=255)
    current_step_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, choices=WORKFLOW_STATES, default='started')
    initiated_by_email = models.EmailField(max_length=254)
    initiated_by_clerk_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"WorkflowInstance {self.instance_id} - {self.workflow_name} ({self.status})"


class StepExecution(models.Model):
    STEP_STATES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    execution_id = models.AutoField(primary_key=True)
    workflow_instance = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='step_executions')
    step_id = models.CharField(max_length=255)
    step_name = models.CharField(max_length=255)
    status = models.CharField(max_length=255, choices=STEP_STATES, default='pending')
    assigned_to_email = models.EmailField(max_length=254, null=True, blank=True)
    executed_by_email = models.EmailField(max_length=254, null=True, blank=True)
    step_data = models.JSONField(default=dict, help_text="JSON data containing the step form submission")
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['workflow_instance', 'step_id']
    
    def __str__(self):
        return f"StepExecution {self.step_id} for {self.workflow_instance.instance_id} ({self.status})"


# models.py
from django.db import models

class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Users'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email


class AI_Agents(models.Model):
    agent_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, db_column='user_id', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Needs Setup', choices=[
        ('Active', 'Active'),
        ('Needs Setup', 'Needs Setup'),
        ('Paused', 'Paused'),
    ])
    task_count = models.IntegerField(default=0)
    tool_count = models.IntegerField(default=0)
    last_active = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'AI_Agents'
        verbose_name_plural = 'AI Agents'

    def __str__(self):
        return self.name


class Capabilities(models.Model):
    capability_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'Capabilities'
        verbose_name_plural = 'Capabilities'

    def __str__(self):
        return self.name


class Agent_Capabilities(models.Model):
    agent_capability_id = models.AutoField(primary_key=True)
    agent = models.ForeignKey(AI_Agents, db_column='agent_id', on_delete=models.CASCADE)
    capability = models.ForeignKey(Capabilities, db_column='capability_id', on_delete=models.CASCADE)
    enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'Agent_Capabilities'
        verbose_name_plural = 'Agent Capabilities'

    def __str__(self):
        return f"{self.agent.name} - {self.capability.name}"


class Tools(models.Model):
    tool_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    connection_status = models.CharField(max_length=20, default='Disconnected', choices=[
        ('Connected', 'Connected'),
        ('Disconnected', 'Disconnected'),
    ])
    access_level = models.CharField(max_length=20, default='Read-only', choices=[
        ('Read & Write', 'Read & Write'),
        ('Read-only', 'Read-only'),
        ('Draft only', 'Draft only'),
    ])
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'Tools'
        verbose_name_plural = 'Tools'

    def __str__(self):
        return self.name


class Agent_Tools(models.Model):
    agent_tool_id = models.AutoField(primary_key=True)
    agent = models.ForeignKey(AI_Agents, db_column='agent_id', on_delete=models.CASCADE)
    tool = models.ForeignKey(Tools, db_column='tool_id', on_delete=models.CASCADE)

    class Meta:
        db_table = 'Agent_Tools'
        verbose_name_plural = 'Agent Tools'

    def __str__(self):
        return f"{self.agent.name} - {self.tool.name}"


class Knowledge_Sources(models.Model):
    source_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Missing', choices=[
        ('Connected', 'Connected'),
        ('Missing', 'Missing'),
        ('Recommended', 'Recommended'),
    ])

    class Meta:
        db_table = 'Knowledge_Sources'
        verbose_name_plural = 'Knowledge Sources'

    def __str__(self):
        return self.name


class Agent_Knowledge(models.Model):
    agent_knowledge_id = models.AutoField(primary_key=True)
    agent = models.ForeignKey(AI_Agents, db_column='agent_id', on_delete=models.CASCADE)
    source = models.ForeignKey(Knowledge_Sources, db_column='source_id', on_delete=models.CASCADE)

    class Meta:
        db_table = 'Agent_Knowledge'
        verbose_name_plural = 'Agent Knowledge'

    def __str__(self):
        return f"{self.agent.name} - {self.source.name}"


class Memory(models.Model):
    memory_id = models.AutoField(primary_key=True)
    agent = models.ForeignKey(AI_Agents, db_column='agent_id', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255, null=True, blank=True)
    memory_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Memory'
        verbose_name_plural = 'Memory'

    def __str__(self):
        return self.title


class Activity_Logs(models.Model):
    log_id = models.AutoField(primary_key=True)
    agent = models.ForeignKey(AI_Agents, db_column='agent_id', on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending', choices=[
        ('Success', 'Success'),
        ('Warning', 'Warning'),
        ('Error', 'Error'),
        ('Pending', 'Pending'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Activity_Logs'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f"{self.agent.name} - {self.description[:20]}"