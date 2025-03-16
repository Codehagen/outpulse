"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Play,
  Phone,
  Settings as SettingsIcon,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import ConversationFlowDesigner from "@/components/agent-studio/conversation-flow-designer";
import { getAgent } from "@/actions/agents/get-agent";
import { updateAgent } from "@/actions/agents/update-agent";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "@/components/ui/language-selector";
import { MultiLanguageSelector } from "@/components/ui/multi-language-selector";
import { TestCall } from "@/components/agent-studio/test-call";

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  voiceId: string;
  personalityTrait: string[];
  energyLevel: number;
  speakingStyle?: string | null;
  updatedAt: string | Date;
  language?: string;
  additionalLanguages?: string[];
}

type Tab = "agent" | "flow" | "testing";

export default function AgentDetail() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [activeTab, setActiveTab] = useState<Tab>("flow");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      try {
        setIsLoading(true);
        const agentData = await getAgent(agentId);
        setAgent(agentData);
        setError(null);
      } catch (err) {
        console.error("Failed to load agent:", err);
        setError("Failed to load agent data");
        setAgent(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAgent();
  }, [agentId]);

  const handleSaveChanges = async () => {
    if (!agent) return;

    setIsSaving(true);
    try {
      const result = await updateAgent({
        id: agent.id,
        name: agent.name,
        description: agent.description || undefined,
        voiceId: agent.voiceId,
        personalityTrait: agent.personalityTrait,
        energyLevel: agent.energyLevel,
        speakingStyle: agent.speakingStyle || undefined,
        language: agent.language || "en",
        additionalLanguages: agent.additionalLanguages || [],
      });

      if (result.success) {
        toast.success("Agent updated successfully");
      } else {
        toast.error(result.error || "Failed to update agent");
      }
    } catch (err) {
      console.error("Failed to update agent:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // If loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10">
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="flex border-b">
          {["Agent", "Conversation Flow", "Test & Preview"].map((tab, i) => (
            <Skeleton key={i} className="h-10 w-28 mx-2" />
          ))}
        </div>

        <div className="h-[850px]">
          <Skeleton className="h-full w-full rounded-md" />
        </div>

        {/* Agent Settings Skeleton */}
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-4 rounded-lg border p-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-9 w-28" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // If agent not found or error
  if (!agent || error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Agent Not Found</h1>
          <p className="text-muted-foreground">
            The agent you are looking for does not exist.
          </p>
          <Link href="/pulse/studio" className="mt-4 inline-block">
            <Button>Go back to Agent Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pulse/studio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          <p className="text-muted-foreground">
            {agent.description || "No description provided"}
          </p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="flex border-b">
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeTab === "agent"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("agent")}
        >
          Agent
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeTab === "flow"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("flow")}
        >
          Conversation Flow
        </button>

        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeTab === "testing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("testing")}
        >
          Test & Preview
        </button>
      </div>

      {activeTab === "flow" && (
        <div className="h-[850px]">
          <div className="h-full rounded-md border">
            <ConversationFlowDesigner agentId={agentId} />
          </div>
        </div>
      )}

      {activeTab === "agent" && (
        <div className="space-y-8">
          {/* Language Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Language Section */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">Agent Language</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the default language the agent will communicate in.
                </p>

                <div className="flex items-center gap-2">
                  <LanguageSelector
                    value={agent.language || "en"}
                    onValueChange={(lang) =>
                      setAgent({ ...agent, language: lang })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Additional Languages */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">Additional Languages</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Specify additional languages that the caller will be able to
                  choose from.
                </p>

                <MultiLanguageSelector
                  values={agent.additionalLanguages || []}
                  onValuesChange={(langs) =>
                    setAgent({ ...agent, additionalLanguages: langs })
                  }
                  excludeLanguage={agent.language}
                />
              </div>
            </div>
          </div>

          {/* Messages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Message */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">First message</h3>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  The first message the agent will say. If empty, the agent will
                  wait for the user to start the conversation.
                </p>

                <Textarea
                  placeholder="Hello, this is [Agent Name]. How can I help you today?"
                  className="min-h-[120px] resize-y"
                  value={agent.speakingStyle || ""}
                  onChange={(e) =>
                    setAgent({ ...agent, speakingStyle: e.target.value })
                  }
                />
              </div>
            </div>

            {/* System Prompt */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">System prompt</h3>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  The system prompt is used to determine the persona of the
                  agent and the context of the conversation.
                </p>

                <Textarea
                  placeholder="You are a helpful assistant..."
                  className="min-h-[120px] resize-y"
                  value={agent.description || ""}
                  onChange={(e) =>
                    setAgent({ ...agent, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Basic Settings & Advanced Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Agent Settings */}
            <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">Basic Settings</h3>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Agent Name</Label>
                      <Input
                        id="name"
                        value={agent.name}
                        onChange={(e) =>
                          setAgent({ ...agent, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="energyLevel">Energy Level (1-10)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="energyLevel"
                          min={1}
                          max={10}
                          step={1}
                          value={[agent.energyLevel]}
                          onValueChange={(values) =>
                            setAgent({ ...agent, energyLevel: values[0] })
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">
                          {agent.energyLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="voiceType">Voice Type</Label>
                      <Select
                        value={agent.voiceId}
                        onValueChange={(value) =>
                          setAgent({ ...agent, voiceId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy</SelectItem>
                          <SelectItem value="echo">Echo</SelectItem>
                          <SelectItem value="fable">Fable</SelectItem>
                          <SelectItem value="nova">Nova</SelectItem>
                          <SelectItem value="shimmer">Shimmer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="personalityTraits">
                        Personality Traits
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {agent.personalityTrait.map((trait, index) => (
                          <div
                            key={index}
                            className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings Panel */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                  <Button variant="outline" size="sm">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Advanced settings include API integrations, compliance
                  settings, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "testing" && (
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Your Agent</h2>

            <div className="rounded-lg border p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Preview how your agent will sound and interact during calls.
              </p>

              <TestCall agentId={agentId} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Call History</h2>

            <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
              No test calls have been made yet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
