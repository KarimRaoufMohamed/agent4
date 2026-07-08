"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import type { WorkflowInstancesSearchParams } from "@/types/workflow";

interface FiltersProps {
  searchParams: WorkflowInstancesSearchParams;
}

export default function WorkflowInstancesFilters({
  searchParams,
}: FiltersProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    status: searchParams.status || "all",
    assigned_to: searchParams.assigned_to || "",

    initiated_by: searchParams.initiated_by || "",
    show_assigned_to_me: searchParams.assigned_to_me === "true",
  });

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();

    if (newFilters.status && newFilters.status !== "all")
      params.set("status", newFilters.status);
    if (newFilters.initiated_by)
      params.set("initiated_by", newFilters.initiated_by);

    if (
      newFilters.show_assigned_to_me &&
      user?.emailAddresses?.[0]?.emailAddress
    ) {
      params.set("assigned_to", user.emailAddresses[0].emailAddress);
      params.set("assigned_to_me", "true");
    } else if (newFilters.assigned_to && !newFilters.show_assigned_to_me) {
      params.set("assigned_to", newFilters.assigned_to);
    }

    const newUrl = `/workflow/instances?${params.toString()}`;
    console.log("🔄 Navigating to:", newUrl);
    console.log("📊 Filters:", newFilters);
    console.log("📝 URL Params:", params.toString());

    startTransition(() => {
      router.push(newUrl);
    });
  };

  // Debounce URL updates for text inputs
  const debouncedUpdateURL = useCallback(
    debounce(
      (newFilters: {
        status: string;
        assigned_to: string;
        initiated_by: string;
        show_assigned_to_me: boolean;
      }) => updateURL(newFilters),
      700
    ),
    [user, router]
  );

  // Debounce function
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };

    // Reset assigned_to when toggling show_assigned_to_me
    if (key === "show_assigned_to_me" && value) {
      newFilters.assigned_to = "";
    }

    setFilters(newFilters);

    // Use debounced update for text inputs, immediate update for others
    if (key === "initiated_by" || key === "assigned_to") {
      debouncedUpdateURL(newFilters);
    } else {
      updateURL(newFilters);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "all",
      assigned_to: "",

      initiated_by: "",
      show_assigned_to_me: false,
    };
    setFilters(resetFilters);
    startTransition(() => {
      router.push("/workflow/instances");
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter workflow instances by status, assignment, and other
              criteria
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            onClick={resetFilters}
            size="sm"
            disabled={isPending}
          >
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Initiated By</label>
            <Input
              placeholder="Filter by email"
              value={filters.initiated_by}
              onChange={(e) =>
                handleFilterChange("initiated_by", e.target.value)
              }
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <Input
              placeholder="Filter by email"
              value={filters.assigned_to}
              onChange={(e) =>
                handleFilterChange("assigned_to", e.target.value)
              }
              disabled={filters.show_assigned_to_me || isPending}
            />
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <Button
              variant={filters.show_assigned_to_me ? "default" : "outline"}
              onClick={() =>
                handleFilterChange(
                  "show_assigned_to_me",
                  !filters.show_assigned_to_me
                )
              }
              className="w-full"
              disabled={isPending}
            >
              {filters.show_assigned_to_me ? "✓" : ""} Assigned to Me
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
