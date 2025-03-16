import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export specific methods for easier usage in components
export const { signIn, signUp, signOut, useSession } = authClient;
