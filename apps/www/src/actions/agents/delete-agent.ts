"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../users/get-current-user";
import { prisma } from "utils/db";

/**
 * Deletes an agent if it belongs to the current user
 *
 * @param id The ID of the agent to delete
 * @returns Success status and any error messages
 */
export async function deleteAgent(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    // Check if the agent exists and belongs to the user
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!agent) {
      return {
        success: false,
        error: "Agent not found or you don't have permission to delete it.",
      };
    }

    // Delete the agent
    await prisma.agent.delete({
      where: {
        id,
      },
    });

    // Revalidate the agents list page
    revalidatePath("/pulse/studio");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return {
      success: false,
      error: "Failed to delete agent. Please try again.",
    };
  }
}
