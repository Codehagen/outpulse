"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Gets the current authenticated session
 *
 * @returns The session object or null if not authenticated
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
