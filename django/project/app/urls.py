from django.urls import path
from . import views

from .views import users_view, ai_agents_view, capabilities_view, agent_capabilities_view, tools_view, agent_tools_view, knowledge_sources_view, agent_knowledge_view, memory_view, activity_logs_view

urlpatterns = [
    path('userCreated', views.user_created, name='user_created'),
    # Workflow Management Endpoints
    path('workflows/', views.get_workflow_definitions, name='get_workflow_definitions'),
    path('workflows/pending/', views.get_pending_workflows_for_user, name='get_pending_workflows_for_user'),
    path('workflows/instances/', views.get_workflow_instances, name='get_workflow_instances'),
    path('workflows/instances/start/', views.start_workflow, name='start_workflow'),
    path('workflows/instances/<str:instance_id>/', views.get_workflow_instance, name='get_workflow_instance'),
    path('workflows/<str:workflow_id>/', views.get_workflow_definition, name='get_workflow_definition'),
    path('workflows/instances/<str:instance_id>/steps/<str:step_id>/validate/', views.validate_step_access, name='validate_step_access'),
    path('workflows/instances/<str:instance_id>/steps/<str:step_id>/submit/', views.submit_step_data, name='submit_step_data'),
    path('check_user_exists/<str:email>', views.check_user_exists, name='check_user_exists'),

    # Onboarding Endpoints
    path('onboarding/create-agents/', views.create_agents_from_onboarding, name='create_agents_from_onboarding'),
    path('agents/by-email/', views.get_agents_by_email, name='get_agents_by_email'),

         path('users/', users_view),
    path('users/<int:id>/', users_view),
    path('ai_agents/', ai_agents_view),
    path('ai_agents/<int:id>/', ai_agents_view),
    path('capabilities/', capabilities_view),
    path('capabilities/<int:id>/', capabilities_view),
    path('agent_capabilities/', agent_capabilities_view),
    path('agent_capabilities/<int:id>/', agent_capabilities_view),
    path('tools/', tools_view),
    path('tools/<int:id>/', tools_view),
    path('agent_tools/', agent_tools_view),
    path('agent_tools/<int:id>/', agent_tools_view),
    path('knowledge_sources/', knowledge_sources_view),
    path('knowledge_sources/<int:id>/', knowledge_sources_view),
    path('agent_knowledge/', agent_knowledge_view),
    path('agent_knowledge/<int:id>/', agent_knowledge_view),
    path('memory/', memory_view),
    path('memory/<int:id>/', memory_view),
    path('activity_logs/', activity_logs_view),
    path('activity_logs/<int:id>/', activity_logs_view),
]
