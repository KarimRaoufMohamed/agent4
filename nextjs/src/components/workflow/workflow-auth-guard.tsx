"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WorkflowAuthGuardProps {
  workflowId: string;
  instanceId?: string;
  stepId?: string;
  children: React.ReactNode;
}

const NEXTJS_API_URL =
  process.env.NEXT_PUBLIC_NEXTJS_API_URL || "http://localhost:3000";

export function WorkflowAuthGuard({
  workflowId,
  instanceId,
  stepId,
  children,
}: WorkflowAuthGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    // If no specific step is being accessed, allow access (user can start workflow)
    if (!instanceId || !stepId) {
      setIsLoading(false);
      return;
    }

    // If user is not logged in, deny access
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      setIsLoading(false);
      return;
    }

    validateStepAccess();
  }, [isLoaded, user, instanceId, stepId, workflowId]);

  const validateStepAccess = async () => {
    if (!instanceId || !stepId || !user?.emailAddresses?.[0]?.emailAddress) {
      return;
    }

    try {
      setIsLoading(true);
      const userEmail = user.emailAddresses[0].emailAddress;
      const response = await fetch(
        `${NEXTJS_API_URL}/api/workflows/instances/${instanceId}/steps/${stepId}/validate?user_email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (response.status === 403) {
        toast.success("Workflow step has been assigned to another user");
        router.push("/workflows");
        return;
      }

      if (response.status === 404) {
        router.push("/workflows");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to validate step access");
      }

      // If validation passes, user is authorized
    } catch (error) {
      console.error("Error validating step access:", error);
      router.push("/workflows");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authorization
  if (isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Checking permissions...</span>
      </div>
    );
  }
  return <>{children}</>;
}
