"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";

interface PendingWorkflow {
  instance_id: string;
  workflow_id: string;
  workflow_name: string;
  current_step_id: string;
  step_name: string;
  initiated_by_email: string;
  created_at: string;
  step_created_at: string;
  status: string;
}

const NEXTJS_API_URL =
  process.env.NEXT_PUBLIC_NEXTJS_API_URL || "http://localhost:3000";

export function WorkflowNotifications() {
  const { user } = useUser();
  const router = useRouter();
  const [pendingWorkflows, setPendingWorkflows] = useState<PendingWorkflow[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingWorkflows = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const userEmail = user.emailAddresses[0].emailAddress;
      const response = await fetch(
        `${NEXTJS_API_URL}/api/workflows/pending?user_email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch pending workflows: ${response.status}`
        );
      }

      const data = await response.json();
      setPendingWorkflows(data.data || []);
    } catch (error) {
      console.error("Error fetching pending workflows:", error);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      fetchPendingWorkflows();

      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingWorkflows, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.emailAddresses]);

  const handleWorkflowClick = (workflow: PendingWorkflow) => {
    setIsOpen(false);
    router.push(
      `/workflow/${workflow.workflow_id}?instance=${workflow.instance_id}&step=${workflow.current_step_id}`
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <LucideIcons.Bell size={20} />
        {pendingWorkflows.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingWorkflows.length > 9 ? "9+" : pendingWorkflows.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Pending Tasks
                </h3>
                <button
                  onClick={fetchPendingWorkflows}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  <LucideIcons.RefreshCw
                    size={16}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading && pendingWorkflows.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <LucideIcons.Loader
                    className="animate-spin mx-auto mb-2"
                    size={20}
                  />
                  Loading...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <LucideIcons.AlertCircle className="mx-auto mb-2" size={20} />
                  {error}
                  <button
                    onClick={fetchPendingWorkflows}
                    className="block mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                </div>
              ) : pendingWorkflows.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <LucideIcons.CheckCircle className="mx-auto mb-2" size={24} />
                  <p>No pending tasks</p>
                  <p className="text-sm text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingWorkflows.map((workflow) => (
                    <div
                      key={workflow.instance_id}
                      onClick={() => handleWorkflowClick(workflow)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <LucideIcons.FileText
                              size={16}
                              className="text-blue-600"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {workflow.workflow_name}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {workflow.step_name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400">
                              From: {workflow.initiated_by_email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatRelativeTime(workflow.step_created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <LucideIcons.ChevronRight
                            size={16}
                            className="text-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingWorkflows.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  {pendingWorkflows.length} pending task
                  {pendingWorkflows.length === 1 ? "" : "s"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
