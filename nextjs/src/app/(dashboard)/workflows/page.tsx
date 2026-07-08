import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
}

async function getWorkflows() {
  try {
    const API_URL = process.env.API_URL;
    const response = await fetch(`${API_URL}/app/workflows/`, {
      cache: "no-store", // Disable caching to always get fresh data
    });

    if (!response.ok) {
      console.error("Failed to fetch workflows:", response.status);
      return [];
    }

    const result = await response.json();
    // Backend returns { success: true, data: { workflows: [...] } }
    return result.data?.workflows || [];
  } catch (error) {
    console.error("Error loading workflows:", error);
    return [];
  }
}

export default async function WorkflowsPage() {
  const data = await getWorkflows();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workflows</h1>
          <p className="text-lg text-muted-foreground">
            Browse and start available workflows
          </p>
        </div>

        {/* Workflows Grid */}
        {data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No workflows available
            </h3>
            <p className="text-muted-foreground">
              There are currently no workflows configured.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((workflow: Workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {workflow.name}
                  </CardTitle>
                  <CardDescription>Version {workflow.version}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {workflow.description}
                  </p>
                  <Link href={`/workflow/${workflow.id}`}>
                    <Button className="w-full group">
                      Start Workflow
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
