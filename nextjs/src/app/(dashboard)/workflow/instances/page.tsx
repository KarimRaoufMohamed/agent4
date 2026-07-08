import { Suspense } from "react";
import WorkflowInstancesFilters from "@/components/workflow/instances-filters";
import WorkflowInstancesTable from "@/components/workflow/instances-table";
import type {
  WorkflowInstancesResponse,
  WorkflowInstancesSearchParams,
} from "@/types/workflow";
import WorkflowInstancesLoading from "@/components/workflow/workflow-instances-loading";

interface PageProps {
  searchParams: Promise<WorkflowInstancesSearchParams>;
}

const DJANGO_API_BASE = process.env.API_URL || "http://localhost:8000";

async function fetchWorkflowInstances(
  searchParams: WorkflowInstancesSearchParams
): Promise<WorkflowInstancesResponse> {
  try {
    const params = new URLSearchParams();

    // Apply filters from URL
    if (searchParams.status) params.set("status", searchParams.status);
    if (searchParams.initiated_by)
      params.set("initiated_by", searchParams.initiated_by);
    if (searchParams.assigned_to)
      params.set("assigned_to", searchParams.assigned_to);

    const limit = searchParams.limit ? parseInt(searchParams.limit) : 100;
    const offset = searchParams.offset ? parseInt(searchParams.offset) : 0;

    params.set("limit", limit.toString());
    params.set("offset", offset.toString());

    const url = `${DJANGO_API_BASE}/app/workflows/instances/?${params.toString()}`;
    console.log("🔍 Server-side fetching:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch instances: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("API returned error response");
    }

    return data;
  } catch (error) {
    console.error("❌ Error fetching workflow instances:", error);
    return {
      success: false,
      data: [],
      pagination: {
        total_count: 0,
        count: 0,
        limit: 100,
        offset: 0,
        has_more: false,
      },
    };
  }
}

export default async function WorkflowInstancesPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  console.log("🔍 Page received searchParams:", resolvedSearchParams);
  const data = await fetchWorkflowInstances(resolvedSearchParams);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workflow Instances
          </h1>
          <p className="text-muted-foreground">
            View and manage all workflow instances across your organization
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <WorkflowInstancesFilters searchParams={resolvedSearchParams} />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total_count} workflow
          instances
        </div>
        <div className="text-sm text-muted-foreground">
          {data.data.length > 0 && (
            <>
              Results {data.pagination.offset + 1} -{" "}
              {data.pagination.offset + data.data.length}
            </>
          )}
        </div>
      </div>

      {/* Results Table */}
      <Suspense
        key={JSON.stringify(resolvedSearchParams)}
        fallback={<WorkflowInstancesLoading />}
      >
        <WorkflowInstancesTable
          instances={data.data}
          pagination={data.pagination}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </div>
  );
}
