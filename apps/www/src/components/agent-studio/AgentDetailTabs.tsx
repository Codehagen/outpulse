import { UserCircle, Code, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentSettingsTab } from "./AgentSettingsTab";
import { ConversationFlowTab } from "./ConversationFlowTab";
import { TestingTabContent } from "./TestingTabContent";

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

interface AgentDetailTabsProps {
  agent: Agent;
  activeTab: string;
  onTabChange: (value: string) => void;
  onUpdateField: (field: string, value: string | number | string[]) => void;
}

export function AgentDetailTabs({
  agent,
  activeTab,
  onTabChange,
  onUpdateField,
}: AgentDetailTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <div className="border-b">
        <div className="flex overflow-x-auto">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger
              value="agent"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <UserCircle className="h-4 w-4" />
              Agent Settings
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Code className="h-4 w-4" />
              Conversation Flow
            </TabsTrigger>
            <TabsTrigger
              value="testing"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Phone className="h-4 w-4" />
              Test & Preview
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Agent Settings Tab */}
      <TabsContent value="agent" className="m-0 space-y-12">
        <AgentSettingsTab agent={agent} onUpdateField={onUpdateField} />
      </TabsContent>

      {/* Flow Tab */}
      <TabsContent value="flow" className="m-0">
        <ConversationFlowTab agentId={agent.id} />
      </TabsContent>

      {/* Testing Tab */}
      <TabsContent value="testing" className="m-0">
        <TestingTabContent agentVoiceId={agent.voiceId} />
      </TabsContent>
    </Tabs>
  );
}
