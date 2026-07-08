from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.utils.timezone import now, timedelta
from .models import *
from .workflow_service import workflow_service
from django.apps import apps
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict
from django.db.models import Count, Q, Prefetch
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.core.exceptions import ValidationError
from urllib.parse import unquote
import json
import random


# Workflow Management Endpoints

@api_view(['GET'])
@csrf_exempt
def get_workflow_definitions(request):
    """Get all workflow definitions from workflow.json"""
    try:
        workflows = workflow_service.get_workflows()
        return JsonResponse({
            "success": True,
            "data": workflows
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "error": f"Failed to load workflows: {str(e)}"
        }, status=500)


@api_view(['GET'])
@csrf_exempt 
def get_workflow_definition(request, workflow_id):
    """Get specific workflow definition by ID"""
    try:
        workflow = workflow_service.get_workflow_by_id(workflow_id)
        if not workflow:
            return JsonResponse({
                "error": "Workflow not found"
            }, status=404)
        
        return JsonResponse({
            "success": True,
            "data": workflow
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "error": f"Failed to load workflow: {str(e)}"
        }, status=500)


@api_view(['POST'])
@csrf_exempt
def start_workflow(request):
    """
    Start a new workflow instance
    Expected JSON payload:
    {
        "workflow_id": "string",
        "user_email": "email@example.com",
        "user_clerk_id": "string"
    }
    """
    try:
        data = json.loads(request.body) if request.body else {}
        
        # Validate required fields
        required_fields = ['workflow_id', 'user_email', 'user_clerk_id']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=400)
        
        # Start workflow instance
        instance = workflow_service.start_workflow_instance(
            workflow_id=data['workflow_id'],
            user_email=data['user_email'],
            user_clerk_id=data['user_clerk_id']
        )
        
        return JsonResponse({
            "success": True,
            "message": "Workflow instance started successfully",
            "data": {
                "instance_id": str(instance.instance_id),
                "workflow_id": instance.workflow_id,
                "workflow_name": instance.workflow_name,
                "current_step_id": instance.current_step_id,
                "status": instance.status,
                "created_at": instance.created_at.isoformat()
            }
        }, status=201)
        
    except ValidationError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['GET'])
@csrf_exempt
def get_workflow_instance(request, instance_id):
    """Get workflow instance details"""
    try:
        instance = workflow_service.get_workflow_instance(instance_id)
        if not instance:
            return JsonResponse({
                "error": "Workflow instance not found"
            }, status=404)
        
        return JsonResponse({
            "success": True,
            "data": {
                "instance_id": str(instance.instance_id),
                "workflow_id": instance.workflow_id,
                "workflow_name": instance.workflow_name,
                "current_step_id": instance.current_step_id,
                "status": instance.status,
                "initiated_by_email": instance.initiated_by_email,
                "created_at": instance.created_at.isoformat(),
                "updated_at": instance.updated_at.isoformat()
            }
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['GET'])
@csrf_exempt
def validate_step_access(request, instance_id, step_id):
    """
    Validate if current user can access the specified step
    Requires user_email in query params
    """
    try:
        user_email = request.GET.get('user_email')
        if not user_email:
            return JsonResponse({
                "error": "user_email query parameter required"
            }, status=400)
        
        instance = workflow_service.get_workflow_instance(instance_id)
        if not instance:
            return JsonResponse({
                "error": "Workflow instance not found"
            }, status=404)
        
        is_authorized = workflow_service.is_user_authorized_for_step(
            workflow_id=instance.workflow_id,
            step_id=step_id,
            user_email=user_email,
            instance=instance
        )
        
        if not is_authorized:
            return JsonResponse({
                "error": "Not authorized to access this step",
                "authorized": False
            }, status=403)
        
        # Get step definition with resolved template variables
        step = workflow_service.get_step_by_id(instance.workflow_id, step_id)
        if not step:
            return JsonResponse({
                "error": "Step not found"
            }, status=404)
        
        # Resolve template variables in form fields
        if step.get('form') and step['form'].get('fields'):
            for field in step['form']['fields']:
                if field.get('value'):
                    field['value'] = workflow_service.resolve_template_variables(
                        field['value'], instance
                    )
        
        return JsonResponse({
            "success": True,
            "authorized": True,
            "data": {
                "step": step,
                "instance": {
                    "instance_id": str(instance.instance_id),
                    "current_step_id": instance.current_step_id,
                    "status": instance.status
                }
            }
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['POST'])
@csrf_exempt
def submit_step_data(request, instance_id, step_id):
    """
    Submit data for a workflow step
    Expected JSON payload:
    {
        "user_email": "email@example.com",
        "step_data": {...}
    }
    """
    try:
        data = json.loads(request.body) if request.body else {}
        
        # Validate required fields
        if not data.get('user_email'):
            return JsonResponse({
                "error": "user_email is required"
            }, status=400)
        
        if 'step_data' not in data:
            return JsonResponse({
                "error": "step_data is required"
            }, status=400)
        
        # Submit step data
        step_execution = workflow_service.submit_step_data(
            instance_id=instance_id,
            step_id=step_id,
            step_data=data['step_data'],
            user_email=data['user_email']
        )
        
        # Get updated instance
        instance = workflow_service.get_workflow_instance(instance_id)
        
        return JsonResponse({
            "success": True,
            "message": "Step data submitted successfully",
            "data": {
                "step_execution_id": step_execution.execution_id,
                "instance": {
                    "instance_id": str(instance.instance_id),
                    "current_step_id": instance.current_step_id,
                    "status": instance.status,
                    "updated_at": instance.updated_at.isoformat()
                }
            }
        }, status=200)
        
    except ValidationError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['GET'])
@csrf_exempt
def get_pending_workflows_for_user(request):
    """Get all workflows with pending steps assigned to the current user"""
    try:
        from urllib.parse import unquote
        
        user_email = request.GET.get('user_email')
        if not user_email:
            return JsonResponse({
                "error": "user_email parameter is required"
            }, status=400)
        
        # URL decode the email parameter (handle %40 -> @)
        user_email = unquote(user_email)
        print(f"🔍 Looking for pending workflows for user: {user_email}")
        
        # Get all workflow instances with pending steps assigned to the user
        pending_step_executions = StepExecution.objects.filter(
            assigned_to_email=user_email,
            status='pending'
        ).select_related('workflow_instance')
        
        print(f"📊 Found {pending_step_executions.count()} pending step executions")
        
        # Group by workflow instance and prepare response data
        pending_workflows = []
        for step_execution in pending_step_executions:
            instance = step_execution.workflow_instance
            
            print(f"📋 Processing step: {step_execution.step_name} for workflow {instance.workflow_name}")
            
            # Get workflow definition to get workflow name
            try:
                workflow_definition = workflow_service.get_workflow_by_id(instance.workflow_id)
                workflow_name = workflow_definition['name']
            except:
                workflow_name = instance.workflow_name
            
            pending_workflows.append({
                "instance_id": str(instance.instance_id),
                "workflow_id": instance.workflow_id,
                "workflow_name": workflow_name,
                "current_step_id": step_execution.step_id,
                "step_name": step_execution.step_name,
                "initiated_by_email": instance.initiated_by_email,
                "created_at": instance.created_at.isoformat(),
                "step_created_at": step_execution.created_at.isoformat(),
                "status": instance.status
            })
        
        
        print(f"✅ Returning {len(pending_workflows)} pending workflows")
        
        return JsonResponse({
            "success": True,
            "data": pending_workflows,
            "count": len(pending_workflows)
        }, status=200)
        
    except Exception as e:
        print(f"❌ Error in get_pending_workflows_for_user: {str(e)}")
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['GET'])
def get_workflow_instances(request):
    """
    Get all workflow instances with filtering options
    Query parameters:
    - status: Filter by workflow status (started, in_progress, completed, cancelled)
    - assigned_to: Filter by user email who has pending assignments
    - created_after: Filter by creation date (ISO format)
    - created_before: Filter by creation date (ISO format)
    - initiated_by: Filter by user who initiated the workflow
    - limit: Limit number of results (default: 100)
    - offset: Pagination offset (default: 0)
    """
    try:
        # Parse query parameters
        status = request.GET.get('status')
        assigned_to = request.GET.get('assigned_to')
        created_after = request.GET.get('created_after')
        created_before = request.GET.get('created_before')
        initiated_by = request.GET.get('initiated_by')
        limit = min(int(request.GET.get('limit', 100)), 500)  # Cap at 500
        offset = int(request.GET.get('offset', 0))
        
        print(f"🔍 Filtering workflow instances with params: status={status}, assigned_to={assigned_to}, initiated_by={initiated_by}")
        
        # Start with all instances
        queryset = WorkflowInstance.objects.all()
        
        # Apply filters
        if status:
            queryset = queryset.filter(status=status)
            
        if initiated_by:
            initiated_by = unquote(initiated_by)
            queryset = queryset.filter(initiated_by_email=initiated_by)
            
        if created_after:
            try:
                created_after_dt = parse_datetime(created_after)
                if created_after_dt:
                    queryset = queryset.filter(created_at__gte=created_after_dt)
            except:
                pass
                
        if created_before:
            try:
                created_before_dt = parse_datetime(created_before)
                if created_before_dt:
                    queryset = queryset.filter(created_at__lte=created_before_dt)
            except:
                pass
        
        # Filter by assignment - only current pending steps assigned to user
        if assigned_to:
            assigned_to = unquote(assigned_to)
            # Find instances where the current step is pending and assigned to this user
            assigned_instance_ids = []
            for instance in WorkflowInstance.objects.all():
                if instance.current_step_id:
                    current_step = instance.step_executions.filter(
                        step_id=instance.current_step_id,
                        status='pending',
                        assigned_to_email=assigned_to
                    ).first()
                    if current_step:
                        assigned_instance_ids.append(instance.instance_id)
            
            queryset = queryset.filter(instance_id__in=assigned_instance_ids)
        
        # Order by creation date (newest first)
        queryset = queryset.order_by('-created_at')
        
        # Get total count before pagination
        total_count = queryset.count()
        
        # Apply pagination
        instances = queryset[offset:offset + limit]
        
        # Prefetch related step executions for each instance
        instances = instances.prefetch_related(
            Prefetch(
                'step_executions',
                queryset=StepExecution.objects.order_by('created_at')
            )
        )
        
        # Prepare response data
        instances_data = []
        for instance in instances:
            # Get current step info
            current_step = None
            if instance.current_step_id:
                current_step_execution = instance.step_executions.filter(
                    step_id=instance.current_step_id
                ).first()
                if current_step_execution:
                    current_step = {
                        "step_id": current_step_execution.step_id,
                        "step_name": current_step_execution.step_name,
                        "status": current_step_execution.status,
                        "assigned_to_email": current_step_execution.assigned_to_email,
                        "executed_by_email": current_step_execution.executed_by_email,
                        "started_at": current_step_execution.started_at.isoformat() if current_step_execution.started_at else None,
                        "completed_at": current_step_execution.completed_at.isoformat() if current_step_execution.completed_at else None
                    }
            
            # Get all step executions for progress tracking
            steps = []
            for step_exec in instance.step_executions.all():
                steps.append({
                    "step_id": step_exec.step_id,
                    "step_name": step_exec.step_name,
                    "status": step_exec.status,
                    "assigned_to_email": step_exec.assigned_to_email,
                    "executed_by_email": step_exec.executed_by_email,
                    "started_at": step_exec.started_at.isoformat() if step_exec.started_at else None,
                    "completed_at": step_exec.completed_at.isoformat() if step_exec.completed_at else None,
                    "created_at": step_exec.created_at.isoformat()
                })
            
            # Try to get workflow name and total steps count from service
            workflow_name = instance.workflow_name
            total_steps_count = len(steps)  # fallback to actual steps
            try:
                workflow_definition = workflow_service.get_workflow_by_id(instance.workflow_id)
                workflow_name = workflow_definition['name']
                # Get total steps count from workflow definition
                if 'steps' in workflow_definition:
                    total_steps_count = len(workflow_definition['steps'])
            except:
                pass
            
            instances_data.append({
                "instance_id": str(instance.instance_id),
                "workflow_id": instance.workflow_id,
                "workflow_name": workflow_name,
                "current_step_id": instance.current_step_id,
                "current_step": current_step,
                "status": instance.status,
                "initiated_by_email": instance.initiated_by_email,
                "initiated_by_clerk_id": instance.initiated_by_clerk_id,
                "created_at": instance.created_at.isoformat(),
                "updated_at": instance.updated_at.isoformat(),
                "completed_at": instance.completed_at.isoformat() if instance.completed_at else None,
                "steps": steps,
                "steps_count": total_steps_count
            })
        
        print(f"✅ Returning {len(instances_data)} workflow instances (total: {total_count})")
        
        return JsonResponse({
            "success": True,
            "data": instances_data,
            "pagination": {
                "total_count": total_count,
                "count": len(instances_data),
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_count
            }
        }, status=200)
        
    except Exception as e:
        print(f"❌ Error in get_workflow_instances: {str(e)}")
        return JsonResponse({
            "error": f"An error occurred: {str(e)}"
        }, status=500)


@api_view(['POST'])
@csrf_exempt
def user_created(request):
    """
    Handle user creation from Clerk webhook
    Expected JSON payload:
    {
        "email": "user@example.com"
    }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({
                'error': 'Email is required'
            }, status=400)
        
        # Check if user already exists
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'is_active': True,
                'is_staff': False
            }
        )
        
        if created:
            # Set unusable password since auth is handled by Clerk
            user.set_unusable_password()
            user.save()
            
            # Assign to default User group
            user_group, _ = Group.objects.get_or_create(name='User')
            user.groups.add(user_group)
            
            return JsonResponse({
                'message': 'User created successfully',
                'user_id': user.id,
                'email': user.email,
                'created': True
            }, status=201)
        else:
            return JsonResponse({
                'message': 'User already exists',
                'user_id': user.id,
                'email': user.email,
                'created': False
            }, status=200)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON payload'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': f'Internal server error: {str(e)}'
        }, status=500)


@api_view(['GET'])
def check_user_exists(request, email):
    try:
        Users = apps.get_model(app_label='app', model_name='Users')  # Adjust 'app' to your actual app name
        
        email = email.strip()
        if not email:
            return JsonResponse({"success": False, "error": "Email parameter is required."}, status=400)

        user_exists = Users.objects.filter(Email=email).exists()

        return JsonResponse({"success": True, "data": user_exists})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Users, AI_Agents, Capabilities, Agent_Capabilities, Tools, Agent_Tools, Knowledge_Sources, Agent_Knowledge, Memory, Activity_Logs

# Users endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def users_view(request, id=None):
    if request.method == 'POST':
        user = Users.objects.create(**request.data)
        return Response({"id": user.user_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            user = Users.objects.get(user_id=id)
            return Response({"email": user.email}, status=status.HTTP_200_OK)
        users = Users.objects.all()
        return Response([{"id": user.user_id, "email": user.email} for user in users], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        user = Users.objects.get(user_id=id)
        for attr, value in request.data.items():
            setattr(user, attr, value)
        user.save()
        return Response({"id": user.user_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Users.objects.get(user_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# AI Agents endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def ai_agents_view(request, id=None):
    if request.method == 'POST':
        agent = AI_Agents.objects.create(**request.data)
        return Response({"id": agent.agent_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            agent = AI_Agents.objects.get(agent_id=id)
            return Response({"name": agent.name}, status=status.HTTP_200_OK)
        agents = AI_Agents.objects.all()
        return Response([{"id": agent.agent_id, "name": agent.name} for agent in agents], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        agent = AI_Agents.objects.get(agent_id=id)
        for attr, value in request.data.items():
            setattr(agent, attr, value)
        agent.save()
        return Response({"id": agent.agent_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        AI_Agents.objects.get(agent_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Capabilities endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def capabilities_view(request, id=None):
    if request.method == 'POST':
        capability = Capabilities.objects.create(**request.data)
        return Response({"id": capability.capability_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            capability = Capabilities.objects.get(capability_id=id)
            return Response({"name": capability.name}, status=status.HTTP_200_OK)
        capabilities = Capabilities.objects.all()
        return Response([{"id": capability.capability_id, "name": capability.name} for capability in capabilities], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        capability = Capabilities.objects.get(capability_id=id)
        for attr, value in request.data.items():
            setattr(capability, attr, value)
        capability.save()
        return Response({"id": capability.capability_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Capabilities.objects.get(capability_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Agent Capabilities endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def agent_capabilities_view(request, id=None):
    if request.method == 'POST':
        agent_capability = Agent_Capabilities.objects.create(**request.data)
        return Response({"id": agent_capability.agent_capability_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            agent_capability = Agent_Capabilities.objects.get(agent_capability_id=id)
            return Response({"agent": agent_capability.agent.name, "capability": agent_capability.capability.name}, status=status.HTTP_200_OK)
        agent_capabilities = Agent_Capabilities.objects.all()
        return Response([{"id": ac.agent_capability_id, "agent": ac.agent.name, "capability": ac.capability.name} for ac in agent_capabilities], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        agent_capability = Agent_Capabilities.objects.get(agent_capability_id=id)
        for attr, value in request.data.items():
            setattr(agent_capability, attr, value)
        agent_capability.save()
        return Response({"id": agent_capability.agent_capability_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Agent_Capabilities.objects.get(agent_capability_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Tools endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def tools_view(request, id=None):
    if request.method == 'POST':
        tool = Tools.objects.create(**request.data)
        return Response({"id": tool.tool_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            tool = Tools.objects.get(tool_id=id)
            return Response({"name": tool.name}, status=status.HTTP_200_OK)
        tools = Tools.objects.all()
        return Response([{"id": tool.tool_id, "name": tool.name} for tool in tools], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        tool = Tools.objects.get(tool_id=id)
        for attr, value in request.data.items():
            setattr(tool, attr, value)
        tool.save()
        return Response({"id": tool.tool_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Tools.objects.get(tool_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Agent Tools endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def agent_tools_view(request, id=None):
    if request.method == 'POST':
        agent_tool = Agent_Tools.objects.create(**request.data)
        return Response({"id": agent_tool.agent_tool_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            agent_tool = Agent_Tools.objects.get(agent_tool_id=id)
            return Response({"agent": agent_tool.agent.name, "tool": agent_tool.tool.name}, status=status.HTTP_200_OK)
        agent_tools = Agent_Tools.objects.all()
        return Response([{"id": at.agent_tool_id, "agent": at.agent.name, "tool": at.tool.name} for at in agent_tools], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        agent_tool = Agent_Tools.objects.get(agent_tool_id=id)
        for attr, value in request.data.items():
            setattr(agent_tool, attr, value)
        agent_tool.save()
        return Response({"id": agent_tool.agent_tool_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Agent_Tools.objects.get(agent_tool_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Knowledge Sources endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def knowledge_sources_view(request, id=None):
    if request.method == 'POST':
        knowledge_source = Knowledge_Sources.objects.create(**request.data)
        return Response({"id": knowledge_source.source_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            knowledge_source = Knowledge_Sources.objects.get(source_id=id)
            return Response({"name": knowledge_source.name}, status=status.HTTP_200_OK)
        knowledge_sources = Knowledge_Sources.objects.all()
        return Response([{"id": ks.source_id, "name": ks.name} for ks in knowledge_sources], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        knowledge_source = Knowledge_Sources.objects.get(source_id=id)
        for attr, value in request.data.items():
            setattr(knowledge_source, attr, value)
        knowledge_source.save()
        return Response({"id": knowledge_source.source_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Knowledge_Sources.objects.get(source_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Agent Knowledge endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def agent_knowledge_view(request, id=None):
    if request.method == 'POST':
        agent_knowledge = Agent_Knowledge.objects.create(**request.data)
        return Response({"id": agent_knowledge.agent_knowledge_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            agent_knowledge = Agent_Knowledge.objects.get(agent_knowledge_id=id)
            return Response({"agent": agent_knowledge.agent.name, "source": agent_knowledge.source.name}, status=status.HTTP_200_OK)
        agent_knowledges = Agent_Knowledge.objects.all()
        return Response([{"id": ak.agent_knowledge_id, "agent": ak.agent.name, "source": ak.source.name} for ak in agent_knowledges], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        agent_knowledge = Agent_Knowledge.objects.get(agent_knowledge_id=id)
        for attr, value in request.data.items():
            setattr(agent_knowledge, attr, value)
        agent_knowledge.save()
        return Response({"id": agent_knowledge.agent_knowledge_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Agent_Knowledge.objects.get(agent_knowledge_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Memory endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def memory_view(request, id=None):
    if request.method == 'POST':
        memory = Memory.objects.create(**request.data)
        return Response({"id": memory.memory_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            memory = Memory.objects.get(memory_id=id)
            return Response({"title": memory.title}, status=status.HTTP_200_OK)
        memories = Memory.objects.all()
        return Response([{"id": memory.memory_id, "title": memory.title} for memory in memories], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        memory = Memory.objects.get(memory_id=id)
        for attr, value in request.data.items():
            setattr(memory, attr, value)
        memory.save()
        return Response({"id": memory.memory_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Memory.objects.get(memory_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Activity Logs endpoints
@api_view(['POST', 'GET', 'PUT', 'DELETE'])
def activity_logs_view(request, id=None):
    if request.method == 'POST':
        activity_log = Activity_Logs.objects.create(**request.data)
        return Response({"id": activity_log.log_id}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        if id:
            activity_log = Activity_Logs.objects.get(log_id=id)
            return Response({"description": activity_log.description}, status=status.HTTP_200_OK)
        activity_logs = Activity_Logs.objects.all()
        return Response([{"id": log.log_id, "description": log.description} for log in activity_logs], status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        activity_log = Activity_Logs.objects.get(log_id=id)
        for attr, value in request.data.items():
            setattr(activity_log, attr, value)
        activity_log.save()
        return Response({"id": activity_log.log_id}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        Activity_Logs.objects.get(log_id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)