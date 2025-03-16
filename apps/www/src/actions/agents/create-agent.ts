"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "utils/db";
import { getCurrentUser } from "../users/get-current-user";

// Schema for validating agent creation input
const CreateAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  voiceId: z.string().min(1, "Voice selection is required"),
  personalityTrait: z
    .array(z.string())
    .min(1, "At least one personality trait is required"),
  energyLevel: z.number().min(1).max(10),
  speakingStyle: z.string().optional(),
  language: z.string().default("en"),
  additionalLanguages: z.array(z.string()).default([]),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;

/**
 * Creates a new agent for the current user
 *
 * @param data The agent data to create
 * @returns The created agent's ID or null if creation failed
 */
export async function createAgent(
  data: CreateAgentInput
): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    // Validate input
    const validatedData = CreateAgentSchema.parse(data);

    // Get current user
    const currentUser = await getCurrentUser();

    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        ...validatedData,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Revalidate the agents list page
    revalidatePath("/pulse/studio");

    return {
      success: true,
      agentId: agent.id,
    };
  } catch (error) {
    console.error("Failed to create agent:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return {
      success: false,
      error: "Failed to create agent. Please try again.",
    };
  }
}
