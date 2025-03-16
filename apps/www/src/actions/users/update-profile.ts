"use server";

import { prisma } from "utils/db";
import { z } from "zod";
import { getCurrentUser } from "./get-current-user";

// Schema for profile update validation
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional().nullable(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

/**
 * Updates the current user's profile information
 *
 * @param data The profile data to update
 * @returns A success message or error
 */
export async function updateProfile(data: UpdateProfileData) {
  try {
    // Validate input data
    const validatedData = updateProfileSchema.parse(data);

    // Get current user
    const currentUser = await getCurrentUser();

    // Update user profile
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.image !== undefined && {
          image: validatedData.image,
        }),
      },
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid data provided",
        errors: error.errors,
      };
    }

    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
