"use client";

import Link from "next/link";
import ConversationFlowDesigner from "@/components/agent-studio/conversation-flow-designer";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data } = useSession();
  const isAuthenticated = !!data;
  const userName = data?.user?.name;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              AI Calling Agent Builder
            </h1>
            {isAuthenticated && (
              <p className="mt-2 text-muted-foreground">
                Welcome back, {userName || "User"}!
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <Link href="/pulse">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="h-[850px] rounded-lg border">
          <ConversationFlowDesigner />
        </div>
      </div>
    </main>
  );
}
