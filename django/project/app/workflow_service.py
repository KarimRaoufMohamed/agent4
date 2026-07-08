import json
import os
import re
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import WorkflowInstance, StepExecution


class WorkflowService:
    def __init__(self):
        self.workflow_file_path = os.path.join(settings.BASE_DIR, '..', 'workflow.json')
        self._workflows_cache = None
    
    def get_workflows(self) -> Dict[str, Any]:
        """Load and cache workflow definitions from workflow.json"""
        if self._workflows_cache is None:
            try:
                with open(self.workflow_file_path, 'r', encoding='utf-8') as f:
                    self._workflows_cache = json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError("workflow.json file not found in Django project root")
            except json.JSONDecodeError:
                raise ValidationError("Invalid JSON in workflow.json file")
        return self._workflows_cache
    
    def get_workflow_by_id(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get specific workflow definition by ID"""
        print(f"🔍 Searching for workflow with ID: {workflow_id}")
        
        try:
            workflows = self.get_workflows()
            print(f"📊 Total workflows available: {len(workflows.get('workflows', []))}")
            
            for i, workflow in enumerate(workflows.get('workflows', [])):
                workflow_found_id = workflow.get('id')
                print(f"📋 Workflow {i}: ID={workflow_found_id}, Name={workflow.get('name', 'Unknown')}")
                
                if workflow_found_id == workflow_id:
                    print(f"✅ Found matching workflow: {workflow.get('name')}")
                    return workflow
            
            print(f"❌ No workflow found with ID: {workflow_id}")
            return None
            
        except Exception as e:
            print(f"💥 Error in get_workflow_by_id: {e}")
            raise e
    
    def get_step_by_id(self, workflow_id: str, step_id: str) -> Optional[Dict[str, Any]]:
        """Get specific step definition from workflow"""
        workflow = self.get_workflow_by_id(workflow_id)
        if not workflow:
            return None
        
        for step in workflow.get('steps', []):
            if step.get('id') == step_id:
                return step
        return None
    
    def resolve_template_variables(self, value: str, instance: WorkflowInstance) -> str:
        """Resolve template variables like {{step_1.field_name}} in workflow definitions"""
        if not isinstance(value, str) or not value.startswith('{{') or not value.endswith('}}'):
            return value
        
        # Extract variable name (e.g., "step_1.user_email")
        template_match = re.match(r'\{\{(.+)\}\}', value)
        if not template_match:
            return value
        
        variable_path = template_match.group(1).strip()
        parts = variable_path.split('.')
        
        if len(parts) != 2:
            return value
        
        step_id, field_name = parts
        
        # Special handling for user-related fields
        if field_name == 'user_email':
            return instance.initiated_by_email
        elif field_name == 'user_display_name':
            # For now, return email as display name
            # This could be enhanced to query user profiles
            return instance.initiated_by_email.split('@')[0]
        
        # Look up field value from previous step execution
        try:
            step_execution = StepExecution.objects.get(
                workflow_instance=instance,
                step_id=step_id,
                status='completed'
            )
            step_data = step_execution.step_data
            return step_data.get(field_name, value)
        except StepExecution.DoesNotExist:
            return value
    
    def is_user_authorized_for_step(self, workflow_id: str, step_id: str, user_email: str, instance: WorkflowInstance) -> bool:
        """Check if user is authorized to access a specific workflow step"""
        step = self.get_step_by_id(workflow_id, step_id)
        if not step:
            return False
        
        # If no assignedTo field, allow access (first step typically)
        assigned_to = step.get('assignedTo')
        if not assigned_to:
            return True
        
        # Resolve template variables in assignment
        resolved_assigned_to = self.resolve_template_variables(assigned_to, instance)
        
        # Check if current user matches assignment
        return user_email.lower() == resolved_assigned_to.lower()
    
    def get_next_step_id(self, workflow_id: str, current_step_id: str) -> Optional[str]:
        """Get the next step ID in the workflow"""
        step = self.get_step_by_id(workflow_id, current_step_id)
        if not step:
            return None
        return step.get('next_step')
    
    def start_workflow_instance(self, workflow_id: str, user_email: str, user_clerk_id: str) -> WorkflowInstance:
        """Create a new workflow instance"""
        workflow = self.get_workflow_by_id(workflow_id)
        if not workflow:
            raise ValidationError(f"Workflow with ID {workflow_id} not found")
        
        # Find the first step
        first_step = None
        for step in workflow.get('steps', []):
            if not any(s.get('next_step') == step.get('id') for s in workflow.get('steps', [])):
                first_step = step
                break
        
        if not first_step:
            raise ValidationError("No starting step found in workflow")
        
        # Create workflow instance
        instance = WorkflowInstance.objects.create(
            workflow_id=workflow_id,
            workflow_name=workflow.get('name', 'Unnamed Workflow'),
            current_step_id=first_step.get('id'),
            initiated_by_email=user_email,
            initiated_by_clerk_id=user_clerk_id
        )
        
        return instance
    
    def get_workflow_instance(self, instance_id: str) -> Optional[WorkflowInstance]:
        """Get workflow instance by ID"""
        try:
            return WorkflowInstance.objects.get(instance_id=instance_id)
        except WorkflowInstance.DoesNotExist:
            return None
    
    def submit_step_data(self, instance_id: str, step_id: str, step_data: Dict[str, Any], user_email: str) -> StepExecution:
        """Submit data for a workflow step and advance to next step"""
        instance = self.get_workflow_instance(instance_id)
        if not instance:
            raise ValidationError("Workflow instance not found")
        
        if instance.current_step_id != step_id:
            raise ValidationError("Cannot submit data for step that is not current")
        
        if not self.is_user_authorized_for_step(instance.workflow_id, step_id, user_email, instance):
            raise ValidationError("User not authorized for this step")
        
        # Create or update step execution
        step_execution, created = StepExecution.objects.get_or_create(
            workflow_instance=instance,
            step_id=step_id,
            defaults={
                'step_name': self.get_step_by_id(instance.workflow_id, step_id).get('name', step_id),
                'assigned_to_email': user_email,
                'executed_by_email': user_email,
                'step_data': step_data,
                'status': 'completed'
            }
        )
        
        if not created:
            step_execution.step_data = step_data
            step_execution.executed_by_email = user_email
            step_execution.status = 'completed'
            step_execution.save()
        
        # Advance to next step
        next_step_id = self.get_next_step_id(instance.workflow_id, step_id)
        if next_step_id:
            instance.current_step_id = next_step_id
            instance.status = 'in_progress'
            
            # Create pending step execution for the next step
            next_step = self.get_step_by_id(instance.workflow_id, next_step_id)
            if next_step:
                next_step_assigned_to = next_step.get('assignedTo', '')
                
                # Resolve template variables in assignment
                if next_step_assigned_to:
                    resolved_assigned_to = self.resolve_template_variables(next_step_assigned_to, instance)
                    
                    # Create pending step execution for the assigned user
                    StepExecution.objects.get_or_create(
                        workflow_instance=instance,
                        step_id=next_step_id,
                        defaults={
                            'step_name': next_step.get('name', next_step_id),
                            'assigned_to_email': resolved_assigned_to,
                            'status': 'pending'
                        }
                    )
        else:
            instance.current_step_id = None
            instance.status = 'completed'
        
        instance.save()
        
        return step_execution


# Global service instance
workflow_service = WorkflowService()