"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Plus, Settings } from "lucide-react";

const CAPABILITIES = [
  "Invoicing",
  "Expense tracking",
  "Reporting",
  "Client follow-up",
  "Scheduling",
  "Customer support",
  "Sales outreach",
  "HR & payroll",
  "Inventory management",
  "Contract management",
];

const PREDEFINED_AGENTS = [
  {
    name: "Accountant Agent",
    description: "Manages accounting, invoicing, and financial reports",
  },
  {
    name: "Operations Agent",
    description: "Handles day-to-day operations and scheduling",
  },
  {
    name: "Sales Agent",
    description: "Manages sales outreach and customer acquisition",
  },
  {
    name: "Customer Support Agent",
    description: "Handles customer inquiries and support tickets",
  },
  {
    name: "HR Agent",
    description: "Manages HR tasks and employee onboarding",
  },
  {
    name: "Marketing Agent",
    description: "Handles marketing campaigns and content",
  },
];

interface CustomAgent {
  name: string;
  description: string;
}

interface CreatedAgent {
  agent_id: number;
  name: string;
  description: string;
  status: string;
  task_count: number;
  tool_count: number;
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div
      className="flex items-center gap-2 mb-12"
      aria-label={`Step ${step} of 4`}
    >
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === s
                ? "bg-primary text-primary-foreground"
                : step > s
                ? "bg-primary/80 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            aria-current={step === s ? "step" : undefined}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 4 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-1",
                step > s ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1
  const [workDescription, setWorkDescription] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Step 2
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(
    []
  );

  // Step 3
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAgentName, setCustomAgentName] = useState("");
  const [customAgentDescription, setCustomAgentDescription] = useState("");
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  // Step 4
  const [createdAgents, setCreatedAgents] = useState<CreatedAgent[]>([]);

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const toggleAgent = (agentName: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentName)
        ? prev.filter((a) => a !== agentName)
        : [...prev, agentName]
    );
  };

  const handleAddCustomAgent = () => {
    if (!customAgentName.trim()) return;
    setCustomAgents((prev) => [
      ...prev,
      {
        name: customAgentName.trim(),
        description: customAgentDescription.trim(),
      },
    ]);
    setCustomAgentName("");
    setCustomAgentDescription("");
    setShowCustomForm(false);
  };

  const handleStep1Next = () => {
    if (!workDescription.trim()) {
      setStep1Error("Please describe your business to continue");
      return;
    }
    setStep1Error("");
    setStep(2);
  };

  const handleCreateAgents = async () => {
    setIsLoading(true);
    setSubmitError(null);

    const agentsToCreate = [
      ...PREDEFINED_AGENTS.filter((a) => selectedAgents.includes(a.name)).map(
        (a) => ({ name: a.name, description: a.description })
      ),
      ...customAgents.map((a) => ({
        name: a.name,
        description: a.description,
      })),
    ];

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user?.emailAddresses?.[0]?.emailAddress ?? "",
          work_description: workDescription,
          capabilities: selectedCapabilities,
          agents: agentsToCreate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create agents");
      }

      setCreatedAgents(data.data?.agents ?? []);
      setStep(4);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create agents"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <ProgressBar step={step} />

      <div className="w-full max-w-2xl">
        {/* Step 1 – Business Description */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Let&apos;s build your AI team
              </h1>
              <p className="text-muted-foreground">
                Tell us about your business so we can suggest the right AI
                employees
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe your business and what you need help with
              </label>
              <Textarea
                placeholder="e.g. Acme Plumbing Services: residential plumbing, invoicing, and monthly reporting"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="min-h-[120px]"
              />
              {step1Error && (
                <p className="text-destructive text-sm">{step1Error}</p>
              )}
            </div>

            <Button onClick={handleStep1Next} className="w-full">
              Next
            </Button>
          </div>
        )}

        {/* Step 2 – Capabilities */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                What do you need help with?
              </h1>
              <p className="text-muted-foreground">
                Select the capabilities you want your AI team to have
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                    selectedCapabilities.includes(cap)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  )}
                >
                  {cap}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 – Agent Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Pick your AI employees
              </h1>
              <p className="text-muted-foreground">
                Select the agents you want to add to your team
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {PREDEFINED_AGENTS.map((agent) => (
                <button
                  key={agent.name}
                  onClick={() => toggleAgent(agent.name)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-colors",
                    selectedAgents.includes(agent.name)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {agent.description}
                      </p>
                    </div>
                    {selectedAgents.includes(agent.name) && (
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}

              {/* Already-added custom agents */}
              {customAgents.map((agent, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-primary bg-primary/5 text-left"
                >
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 ml-auto" />
                  </div>
                </div>
              ))}

              {/* Add your own role */}
              {!showCustomForm ? (
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[80px]"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Add your own role
                  </span>
                </button>
              ) : (
                <div className="p-4 rounded-xl border-2 border-dashed border-primary bg-primary/5 space-y-2 col-span-2">
                  <p className="text-sm font-medium">Custom role</p>
                  <Input
                    placeholder="Name (e.g. Contractor Liaison)"
                    value={customAgentName}
                    onChange={(e) => setCustomAgentName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Description (e.g. Coordinates subcontractor invoices)"
                    value={customAgentDescription}
                    onChange={(e) => setCustomAgentDescription(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCustomAgent}
                      disabled={!customAgentName.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowCustomForm(false);
                        setCustomAgentName("");
                        setCustomAgentDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <p className="text-destructive text-sm">{submitError}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateAgents}
                className="flex-1"
                disabled={
                  isLoading ||
                  (selectedAgents.length === 0 && customAgents.length === 0)
                }
              >
                {isLoading ? "Creating…" : "Create your Agents"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 – Confirmation */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Your AI team is ready</h1>
              <p className="text-muted-foreground">
                Your AI employees have been created and are ready to be
                configured
              </p>
            </div>

            <div className="text-left space-y-3">
              {createdAgents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.status}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => router.push("/ai-team")}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
