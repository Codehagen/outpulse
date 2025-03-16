"use server";

import { redirect } from "next/navigation";
import { prisma } from "utils/db";
import { getSession } from "./get-session";

export interface CurrentUserResponse {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isAdmin: boolean;
  createdAt: Date;
}

/**
 * Retrieves the currently authenticated user with complete profile data
 *
 * @returns The current user data or redirects to login if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  // Get the session using Better Auth

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const userId = session.session.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    isAdmin: user.role === "ADMIN",
    createdAt: user.createdAt,
  };
}
