"use server";

import { prisma } from "utils/db";
import { getSession } from "@/actions/users/get-session";

interface ApiKeysResponse {
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioPhoneNumber?: string | null;
  elevenLabsApiKey?: string | null;
  success: boolean;
  error?: string;
}

export async function getApiKeys(): Promise<ApiKeysResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.session.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
        elevenLabsApiKey: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      ...user,
      success: true,
    };
  } catch (error) {
    console.error("Failed to get API keys:", error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}
