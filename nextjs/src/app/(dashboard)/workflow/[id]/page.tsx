import { WorkflowAuthGuard } from "@/components/workflow/workflow-auth-guard";
import { WorkflowRunner } from "@/components/workflow/workflow-runner";
import { notFound } from "next/navigation";

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    instance?: string;
    step?: string;
    completed?: string;
  }>;
}

async function getWorkflowInfo(id: string) {
  try {
    const API_URL = process.env.API_URL;
    const response = await fetch(`${API_URL}/app/workflows/${id}/`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading workflow:", error);
    return null;
  }
}

export default async function WorkflowPage({
  params,
  searchParams,
}: WorkflowPageProps) {
  const { id } = await params;
  const urlSearchParams = await searchParams;

  // Extract search parameters
  const instanceId = urlSearchParams.instance;
  const stepId = urlSearchParams.step;
  const completed = urlSearchParams.completed;

  const workflowInfo = await getWorkflowInfo(id);

  if (!workflowInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🚀 {workflowInfo.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {workflowInfo.description}
          </p>
        </div>

        <WorkflowAuthGuard
          workflowId={id}
          instanceId={instanceId}
          stepId={stepId}
        >
          <WorkflowRunner
            workflowId={id}
            instanceId={instanceId}
            stepId={stepId}
            completed={completed}
          />
        </WorkflowAuthGuard>
      </div>
    </div>
  );
}
