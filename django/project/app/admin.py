# admin.py
from django.contrib import admin
from .models import *

from unfold.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import User, Group

from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm


admin.site.unregister(User)
admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    # Forms loaded from `unfold.forms`
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass

@admin.register(WorkflowInstance)
class WorkflowInstanceAdmin(ModelAdmin):
    list_display = ('instance_id', 'workflow_name', 'status', 'initiated_by_email', 'current_step_id', 'created_at', 'updated_at')
    search_fields = ('workflow_id', 'workflow_name', 'initiated_by_email', 'initiated_by_clerk_id')
    list_filter = ('status', 'created_at', 'updated_at')
    readonly_fields = ('instance_id', 'created_at', 'updated_at')


@admin.register(StepExecution)
class StepExecutionAdmin(ModelAdmin):
    list_display = ('execution_id', 'workflow_instance', 'step_name', 'status', 'assigned_to_email', 'executed_by_email', 'created_at')
    search_fields = ('step_id', 'step_name', 'assigned_to_email', 'executed_by_email')
    list_filter = ('status', 'created_at', 'completed_at')
    readonly_fields = ('execution_id', 'created_at', 'updated_at')
    raw_id_fields = ('workflow_instance',)

# Register your models here.

# admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Users, AI_Agents, Capabilities, Agent_Capabilities, Tools, Agent_Tools, Knowledge_Sources, Agent_Knowledge, Memory, Activity_Logs

admin.site.site_title = "AI Management Admin"
admin.site.site_header = "AI Management Administration"

@admin.register(Users)
class UsersAdmin(ModelAdmin):
    list_display = ('user_id', 'email', 'created_at')
    search_fields = ('email',)
    list_filter = ('created_at',)


@admin.register(AI_Agents)
class AI_AgentsAdmin(ModelAdmin):
    list_display = ('agent_id', 'name', 'status', 'task_count', 'tool_count', 'last_active')
    search_fields = ('name',)
    list_filter = ('status',)


@admin.register(Capabilities)
class CapabilitiesAdmin(ModelAdmin):
    list_display = ('capability_id', 'name')
    search_fields = ('name',)


@admin.register(Agent_Capabilities)
class Agent_CapabilitiesAdmin(ModelAdmin):
    list_display = ('agent_capability_id', 'agent', 'capability', 'enabled')
    list_filter = ('enabled',)


@admin.register(Tools)
class ToolsAdmin(ModelAdmin):
    list_display = ('tool_id', 'name', 'connection_status', 'access_level')
    search_fields = ('name',)
    list_filter = ('connection_status',)


@admin.register(Agent_Tools)
class Agent_ToolsAdmin(ModelAdmin):
    list_display = ('agent_tool_id', 'agent', 'tool')


@admin.register(Knowledge_Sources)
class Knowledge_SourcesAdmin(ModelAdmin):
    list_display = ('source_id', 'name', 'status')
    search_fields = ('name',)
    list_filter = ('status',)


@admin.register(Agent_Knowledge)
class Agent_KnowledgeAdmin(ModelAdmin):
    list_display = ('agent_knowledge_id', 'agent', 'source')


@admin.register(Memory)
class MemoryAdmin(ModelAdmin):
    list_display = ('memory_id', 'agent', 'title', 'created_at')
    search_fields = ('title',)


@admin.register(Activity_Logs)
class Activity_LogsAdmin(ModelAdmin):
    list_display = ('log_id', 'agent', 'status', 'created_at')
    search_fields = ('description',)
    list_filter = ('status',)