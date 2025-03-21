export interface Agent {
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
