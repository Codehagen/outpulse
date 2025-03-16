"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "utils/db";
import { getCurrentUser } from "../users/get-current-user";

// Schema for validating agent update input
const UpdateAgentSchema = z.object({
  id: z.string().uuid(),
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

export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;

/**
 * Updates an existing agent for the current user
 *
 * @param data The agent data to update
 * @returns Success status and any error messages
 */
export async function updateAgent(
  data: UpdateAgentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validatedData = UpdateAgentSchema.parse(data);

    // Get current user
    const currentUser = await getCurrentUser();

    // First check if the agent belongs to the current user
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: validatedData.id,
        userId: currentUser.id,
      },
    });

    if (!existingAgent) {
      return {
        success: false,
        error: "Agent not found or you don't have permission to update it.",
      };
    }

    // Update the agent
    await prisma.agent.update({
      where: {
        id: validatedData.id,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        voiceId: validatedData.voiceId,
        personalityTrait: validatedData.personalityTrait,
        energyLevel: validatedData.energyLevel,
        speakingStyle: validatedData.speakingStyle,
        language: validatedData.language,
        additionalLanguages: validatedData.additionalLanguages,
      },
    });

    // Revalidate both the list page and the detail page
    revalidatePath("/pulse/studio");
    revalidatePath(`/pulse/studio/${validatedData.id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update agent:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return {
      success: false,
      error: "Failed to update agent. Please try again.",
    };
  }
}
