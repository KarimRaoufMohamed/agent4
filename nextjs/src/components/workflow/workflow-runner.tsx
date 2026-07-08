/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormRenderer } from "./form-renderer";
import { Button } from "../ui/button";

interface WorkflowRunnerProps {
  workflowId: string;
  instanceId?: string;
  stepId?: string;
  completed?: string;
}

interface WorkflowInstance {
  instance_id: string;
  workflow_id: string;
  workflow_name: string;
  current_step_id: string | null;
  status: string;
  initiated_by_email: string;
  created_at: string;
  updated_at: string;
}

interface StepDefinition {
  id: string;
  type: string;
  name: string;
  next_step?: string;
  assignedTo?: string;
  form?: {
    id: string;
    title: string;
    description: string;
    fields: any[];
    submitAction?: {
      type: string;
      message: string;
    };
  };
}

const NEXTJS_API_URL =
  process.env.NEXT_PUBLIC_NEXTJS_API_URL || "http://localhost:3000";

export function WorkflowRunner({
  workflowId,
  instanceId,
  stepId,
  completed,
}: WorkflowRunnerProps) {
  const { user } = useUser();
  const router = useRouter();

  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [currentStep, setCurrentStep] = useState<StepDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    console.log("WorkflowRunner useEffect:", { instanceId, stepId, userEmail });

    if (instanceId && stepId && userEmail) {
      console.log("Loading step data...");
      loadStepData();
    } else if (instanceId) {
      console.log("Loading instance...");
      loadInstance();
    } else {
      console.log("No instance or step ID provided");
    }
  }, [instanceId, stepId, user?.emailAddresses?.[0]?.emailAddress]);

  const loadInstance = async () => {
    if (!instanceId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${NEXTJS_API_URL}/api/workflows/instances/${instanceId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load workflow instance");
      }

      const data = await response.json();
      setInstance(data.data);
    } catch (error) {
      console.error("Error loading instance:", error);
      setError("Failed to load workflow instance");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStepData = async () => {
    if (!instanceId || !stepId || !user?.emailAddresses?.[0]?.emailAddress)
      return;

    console.log("loadStepData called:", {
      instanceId,
      stepId,
      userEmail: user.emailAddresses[0].emailAddress,
    });

    try {
      setIsLoading(true);
      const userEmail = user.emailAddresses[0].emailAddress;
      const url = `${NEXTJS_API_URL}/api/workflows/instances/${instanceId}/steps/${stepId}/validate?user_email=${encodeURIComponent(
        userEmail
      )}`;
      console.log("Fetching step data from:", url);

      const response = await fetch(url);

      // If access is denied, the auth guard will handle the redirect
      if (response.status === 403) {
        console.log("Access denied - auth guard will handle redirect");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to validate step access");
      }

      const data = await response.json();
      console.log("Step data loaded:", data);
      setCurrentStep(data.data.step);
      setInstance(data.data.instance);
      setError(null);
    } catch (error) {
      console.error("Error loading step:", error);
      setError("Failed to load workflow step");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewWorkflow = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress || !user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${NEXTJS_API_URL}/api/workflows/instances/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflow_id: workflowId,
            user_email: user.emailAddresses[0].emailAddress,
            user_clerk_id: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start workflow");
      }

      const data = await response.json();
      const newInstanceId = data.data.instance_id;
      const firstStepId = data.data.current_step_id;

      // Navigate to the first step
      router.push(`?instance=${newInstanceId}&step=${firstStepId}`);
    } catch (error) {
      console.error("Error starting workflow:", error);
      setError("Failed to start workflow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!instanceId || !stepId || !user?.emailAddresses?.[0]?.emailAddress)
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${NEXTJS_API_URL}/api/workflows/instances/${instanceId}/steps/${stepId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.emailAddresses[0].emailAddress,
            step_data: formData,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit step data");
      }

      const data = await response.json();
      const updatedInstance = data.data.instance;

      // Check if workflow is completed
      if (updatedInstance.status === "completed") {
        router.push(`?instance=${instanceId}&completed=true`);
      } else if (updatedInstance.current_step_id) {
        // Navigate to next step
        router.push(
          `?instance=${instanceId}&step=${updatedInstance.current_step_id}`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit form"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Redirect already handled in loadStepData, no need to show unauthorized UI

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => {
              setError(null);
              if (instanceId && stepId) {
                loadStepData();
              }
            }}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show workflow completed state
  if (completed === "true" && instance) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Workflow Completed!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                {instance.workflow_name} has been completed successfully.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push("?")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start New Workflow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show current step form
  if (currentStep?.form && instance) {
    console.log("Rendering step form:", { currentStep, instance });
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {instance.workflow_name}
          </h1>
          <p className="text-gray-600">Step: {currentStep.name}</p>
        </div>
        <FormRenderer
          form={currentStep.form}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // Show start workflow screen
  console.log("Rendering start workflow screen:", {
    instanceId,
    stepId,
    currentStep,
    instance,
    isLoading,
  });
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          📋 Start New Workflow
        </h2>
        <div className="text-center">
          <Button
            onClick={startNewWorkflow}
            disabled={!user?.emailAddresses?.[0]?.emailAddress}
          >
            🚀 Start Workflow
          </Button>
          {!user?.emailAddresses?.[0]?.emailAddress && (
            <p className="mt-2 text-sm text-red-600">
              Please log in to start a workflow
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
