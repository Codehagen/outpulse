"use server";

import { getCurrentUser } from "../users/get-current-user";
import { prisma } from "utils/db";

export interface AgentResponse {
  id: string;
  name: string;
  description: string | null;
  voiceId: string;
  energyLevel: number;
  speakingStyle: string | null;
  personalityTrait: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retrieves all agents belonging to the current user
 *
 * @returns Array of agents or empty array if none found
 */
export async function getAgents(): Promise<AgentResponse[]> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    // Fetch agents for this user
    const agents = await prisma.agent.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        voiceId: true,
        energyLevel: true,
        speakingStyle: true,
        personalityTrait: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return agents;
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
}
