"use client";

import { WorkflowState, WorkflowStep } from "@/types/workflow";

interface WorkflowStatusProps {
  workflowState: WorkflowState;
  currentStep?: WorkflowStep;
}

export function WorkflowStatus({
  workflowState,
  currentStep,
}: WorkflowStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-blue-100 text-blue-800";
      case "WAITING_FOR_INPUT":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "⚡";
      case "WAITING_FOR_INPUT":
        return "⏳";
      case "COMPLETED":
        return "✅";
      case "ERROR":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Workflow Status
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">ID:</span>
          <span className="text-sm text-gray-800 font-mono">
            {workflowState.id}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              workflowState.status
            )}`}
          >
            {getStatusIcon(workflowState.status)} {workflowState.status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Current Step:
          </span>
          <span className="text-sm text-gray-800">
            {workflowState.currentStepId}
          </span>
        </div>

        {currentStep && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Step Name:
            </span>
            <span className="text-sm text-gray-800">{currentStep.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Created:</span>
          <span className="text-sm text-gray-800">
            {new Date(workflowState.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Updated:</span>
          <span className="text-sm text-gray-800">
            {new Date(workflowState.updatedAt).toLocaleString()}
          </span>
        </div>

        {workflowState.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <span className="text-sm font-medium text-red-800">Error:</span>
            <p className="text-sm text-red-700 mt-1">{workflowState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
