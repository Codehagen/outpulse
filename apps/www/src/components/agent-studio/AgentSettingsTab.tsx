import { motion } from "framer-motion";
import { AgentLanguageSettings } from "./AgentLanguageSettings";
import { AgentMessagesSection } from "./AgentMessagesSection";
import { AgentBasicSettings } from "./AgentBasicSettings";

interface AgentSettingsTabProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    voiceId: string;
    personalityTrait: string[];
    energyLevel: number;
    speakingStyle?: string | null;
    language?: string;
    additionalLanguages?: string[];
  };
  onUpdateField: (field: string, value: string | number | string[]) => void;
}

export function AgentSettingsTab({
  agent,
  onUpdateField,
}: AgentSettingsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Language Settings Grid */}
      <AgentLanguageSettings
        language={agent.language || "en"}
        additionalLanguages={agent.additionalLanguages || []}
        onLanguageChange={(value) => onUpdateField("language", value)}
        onAdditionalLanguagesChange={(values) =>
          onUpdateField("additionalLanguages", values)
        }
      />

      {/* Messages Grid */}
      <AgentMessagesSection
        firstMessage={agent.speakingStyle || ""}
        systemPrompt={agent.description || ""}
        onFirstMessageChange={(value) => onUpdateField("speakingStyle", value)}
        onSystemPromptChange={(value) => onUpdateField("description", value)}
      />

      {/* Basic Settings & Advanced Settings Grid */}
      <AgentBasicSettings
        name={agent.name}
        energyLevel={agent.energyLevel}
        voiceId={agent.voiceId}
        personalityTrait={agent.personalityTrait}
        onNameChange={(value) => onUpdateField("name", value)}
        onEnergyLevelChange={(value) => onUpdateField("energyLevel", value)}
        onVoiceIdChange={(value) => onUpdateField("voiceId", value)}
      />
    </motion.div>
  );
}
