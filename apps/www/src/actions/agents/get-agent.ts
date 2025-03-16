"use server";

import { notFound } from "next/navigation";
import { prisma } from "utils/db";
import { getCurrentUser } from "../users/get-current-user";
import { AgentResponse } from "./get-agents";

/**
 * Retrieves a single agent by ID if it belongs to the current user
 *
 * @param id The ID of the agent to retrieve
 * @returns The agent data or throws notFound if not found
 */
export async function getAgent(id: string): Promise<AgentResponse> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    // Fetch the agent for this user
    const agent = await prisma.agent.findFirst({
      where: {
        id,
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
    });

    if (!agent) {
      notFound();
    }

    return agent;
  } catch (error) {
    console.error(`Failed to fetch agent ${id}:`, error);
    notFound();
  }
}
