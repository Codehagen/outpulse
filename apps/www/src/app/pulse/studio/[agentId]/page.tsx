"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAgent } from "@/actions/agents/get-agent";
import { updateAgent } from "@/actions/agents/update-agent";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent-studio/AgentHeader";
import { AgentDetailTabs } from "@/components/agent-studio/AgentDetailTabs";
import { AgentDetailLoading } from "@/components/agent-studio/AgentDetailLoading";
import { AgentDetailError } from "@/components/agent-studio/AgentDetailError";
import { Agent } from "@/components/agent-studio/types";

export default function AgentDetail() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [activeTab, setActiveTab] = useState("agent");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      try {
        setIsLoading(true);
        const agentData = await getAgent(agentId);
        setAgent(agentData);
        setError(null);
        setIsDirty(false);
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

  const updateAgentField = (
    field: string,
    value: string | number | string[]
  ) => {
    if (!agent) return;
    setAgent({ ...agent, [field]: value });
    setIsDirty(true);
  };

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
        setIsDirty(false);
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

  // Loading state
  if (isLoading) {
    return <AgentDetailLoading />;
  }

  // Error state
  if (!agent || error) {
    return <AgentDetailError message={error || undefined} />;
  }

  return (
    <div className="container max-w-screen-2xl space-y-6 px-4 py-6">
      {/* Header Section */}
      <AgentHeader
        agent={agent}
        isSaving={isSaving}
        isDirty={isDirty}
        onSave={handleSaveChanges}
      />

      {/* Tabs Navigation and Content */}
      <AgentDetailTabs
        agent={agent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUpdateField={updateAgentField}
      />
    </div>
  );
}
