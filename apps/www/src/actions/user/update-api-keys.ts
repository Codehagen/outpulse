"use server";

import { prisma } from "utils/db";
import { getSession } from "@/actions/users/get-session";
import { z } from "zod";

const ApiKeysSchema = z.object({
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioPhoneNumber: z.string().optional(),
  elevenLabsApiKey: z.string().optional(),
});

export type ApiKeysInputType = z.infer<typeof ApiKeysSchema>;

interface ApiKeysResponseType {
  success: boolean;
  error?: string;
}

export async function updateApiKeys(
  data: ApiKeysInputType
): Promise<ApiKeysResponseType> {
  try {
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.session.userId;

    const validatedFields = ApiKeysSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Invalid fields",
      };
    }

    const {
      twilioAccountSid,
      twilioAuthToken,
      twilioPhoneNumber,
      elevenLabsApiKey,
    } = validatedFields.data;

    // Update user with new API keys
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
        elevenLabsApiKey,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update API keys:", error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}
