"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  WorkflowInstance,
  WorkflowInstancesSearchParams,
} from "@/types/workflow";
import {
  TableHeader,
  ShadcnTable,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/shadcn-table";

interface TableProps {
  instances: WorkflowInstance[];
  pagination: {
    total_count: number;
    count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  searchParams: WorkflowInstancesSearchParams;
}

const statusColors = {
  started: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const stepStatusColors = {
  pending: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-gray-100 text-gray-800",
};

// Utility functions for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
};

export default function WorkflowInstancesTable({
  instances,
  pagination,
  searchParams,
}: TableProps) {
  const router = useRouter();

  const loadMore = () => {
    const params = new URLSearchParams();

    // Preserve existing filters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "offset") {
        params.set(key, value);
      }
    });

    // Update offset for pagination
    const newOffset = pagination.offset + pagination.limit;
    params.set("offset", newOffset.toString());

    router.push(`/workflow/instances?${params.toString()}`);
  };

  if (instances.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              No workflow instances found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ShadcnTable>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Initiated By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.instance_id}>
                    <TableCell>{instance.workflow_name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[instance.status]}>
                        {instance.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {instance.current_step ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {instance.current_step.step_name}
                          </div>
                          {instance.current_step.assigned_to_email && (
                            <div className="text-xs text-muted-foreground">
                              Assigned to:{" "}
                              {instance.current_step.assigned_to_email}
                            </div>
                          )}
                          <Badge
                            className={
                              stepStatusColors[
                                instance.current_step
                                  .status as keyof typeof stepStatusColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {instance.current_step.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No current step
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {instance.initiated_by_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatDate(instance.created_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(instance.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {
                            instance.steps.filter(
                              (step) => step.status === "completed"
                            ).length
                          }{" "}
                          / {instance.steps_count} steps
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${
                                (instance.steps.filter(
                                  (step) => step.status === "completed"
                                ).length /
                                  instance.steps_count) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ShadcnTable>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.has_more && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline">
            Load More (
            {pagination.total_count - pagination.offset - pagination.count}{" "}
            remaining)
          </Button>
        </div>
      )}
    </>
  );
}
