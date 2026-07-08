/* eslint-disable @typescript-eslint/no-explicit-any */
// Workflow Type Definitions

export interface Field {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "date";
  required: boolean;
  options?: string[];
  value?: string;
  readonly?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: Field[];
  submitAction?: {
    type: string;
    message?: string;
  };
}

export interface WorkflowStep {
  id: string;
  type: "start" | "form" | "action" | "condition" | "end";
  name: string;
  form?: Form;
  action?: {
    type: string;
    [key: string]: any;
  };
  logic?: {
    variable: string;
    cases: Array<{ value: string; targetStepId: string }>;
    default: string;
  };
}

export interface WorkflowTransition {
  from: string;
  to: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}

export interface WorkflowContext {
  workflowId: string;
  stepId: string;
  formData: Record<string, any>;
  data: Record<string, any>;
  userId?: string;
  userEmail?: string;
}

export type WorkflowStatus =
  | "RUNNING"
  | "WAITING_FOR_INPUT"
  | "COMPLETED"
  | "ERROR";

export interface WorkflowState {
  id: string;
  currentStepId: string;
  status: WorkflowStatus;
  data: Record<string, any>;
  formData?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActionHandler = (
  context: WorkflowContext,
  config: any
) => Promise<any>;

// Workflow Instance Types (from API responses)
export interface WorkflowInstanceStep {
  step_id: string;
  step_name: string;
  status: 'pending' | 'completed' | 'skipped';
  assigned_to_email: string | null;
  executed_by_email: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WorkflowInstance {
  instance_id: string;
  workflow_id: string;
  workflow_name: string;
  current_step_id: string | null;
  current_step: {
    step_id: string;
    step_name: string;
    status: string;
    assigned_to_email: string | null;
  } | null;
  status: 'started' | 'in_progress' | 'completed' | 'cancelled';
  initiated_by_email: string;
  initiated_by_clerk_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  steps: WorkflowInstanceStep[];
  steps_count: number;
}

export interface WorkflowInstancesResponse {
  success: boolean;
  data: WorkflowInstance[];
  pagination: {
    total_count: number;
    count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface WorkflowInstancesSearchParams {
  status?: string;
  assigned_to?: string;
  initiated_by?: string;
  assigned_to_me?: string;
  limit?: string;
  offset?: string;
}
