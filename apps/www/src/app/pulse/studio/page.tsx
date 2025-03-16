import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { getAgents } from "@/actions/agents/get-agents";
import { formatDistanceToNow } from "date-fns";
import { CreateAgentSheet } from "@/components/create-agent-sheet";

// Force dynamic rendering since we're using headers() via getCurrentUser
export const dynamic = 'force-dynamic';

function AgentsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-1">
                {Array(2)
                  .fill(0)
                  .map((_, j) => (
                    <Skeleton key={j} className="h-5 w-12 rounded-full" />
                  ))}
              </div>
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
            <Skeleton className="mt-4 h-3 w-28" />
          </div>
        ))}
    </div>
  );
}

async function AgentsList() {
  // Fetch agents from the database
  const agents = await getAgents();

  if (agents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <h3 className="text-lg font-medium">No agents yet</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first AI calling agent to get started
        </p>
        <div className="mt-4 inline-block">
          <CreateAgentSheet />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Link
          key={agent.id}
          href={`/pulse/studio/${agent.id}`}
          className="group"
        >
          <div className="h-full rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold group-hover:text-primary">
                {agent.name}
              </h3>
              <div className="flex gap-1">
                {agent.personalityTrait.slice(0, 3).map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-muted px-2 py-1 text-xs"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {agent.description || "No description provided"}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(agent.createdAt))} ago
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AgentStudio() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Studio</h1>
          <p className="text-muted-foreground">
            Create and manage your AI calling agents
          </p>
        </div>
        <CreateAgentSheet />
      </div>

      <Suspense fallback={<AgentsSkeleton />}>
        <AgentsList />
      </Suspense>
    </div>
  );
}
