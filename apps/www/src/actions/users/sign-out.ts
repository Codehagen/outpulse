"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Signs the user out and redirects to the home page
 */
export async function signOut() {
  try {
    // Clear the Better Auth session
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Error signing out:", error);
  }

  // Redirect to home page
  redirect("/");
}
