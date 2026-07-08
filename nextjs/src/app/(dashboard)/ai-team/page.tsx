import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, PauseCircle, Settings } from "lucide-react";

interface Agent {
  agent_id: number;
  name: string;
  description: string;
  status: string;
  task_count: number;
  tool_count: number;
  last_active: string | null;
}

async function getAgents(email: string): Promise<Agent[]> {
  try {
    const API_URL = process.env.API_URL;
    const response = await fetch(
      `${API_URL}/app/agents/by-email/?user_email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  }
  if (status === "Paused") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
        <PauseCircle className="w-3 h-3" />
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" />
      Needs Setup
    </span>
  );
}

export default async function AITeamPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const agents = await getAgents(email);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">AI Team</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI employees
            </p>
          </div>
          <Link href="/onboarding">
            <Button>Add AI Employee</Button>
          </Link>
        </div>

        {/* Empty State */}
        {agents.length === 0 ? (
          <div className="text-center py-24 border rounded-xl">
            <p className="text-xl font-medium mb-2">
              You don&apos;t have any AI Employees yet
            </p>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first AI employee
            </p>
            <Link href="/onboarding">
              <Button>Add AI Employee</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.agent_id}
                className="p-6 rounded-xl border bg-card shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <StatusBadge status={agent.status} />
                </div>

                {agent.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {agent.description}
                  </p>
                )}

                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <span>{agent.task_count} tasks</span>
                  <span>{agent.tool_count} tools</span>
                  {agent.last_active && (
                    <span>
                      Active{" "}
                      {new Date(agent.last_active).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" className="flex-1">
                    Assign Task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
