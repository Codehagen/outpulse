import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Sparkles,
  Search,
  ArrowRight,
  PhoneCall,
  Activity,
  Users,
  ArrowUpRight,
  Grid,
  ListFilter,
  TrendingUp,
  ChevronUp,
} from "lucide-react";
import { getAgents } from "@/actions/agents/get-agents";
import { formatDistanceToNow } from "date-fns";
import { CreateAgentSheet } from "@/components/create-agent-sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we're using headers() via getCurrentUser
export const dynamic = "force-dynamic";

function AgentsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-7 w-40" />
              <div className="flex gap-1.5">
                {Array(2)
                  .fill(0)
                  .map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16 rounded-full" />
                  ))}
              </div>
            </div>
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-3/4" />
            <Skeleton className="mt-6 h-3.5 w-28" />
          </div>
        ))}
    </div>
  );
}

function BarChart({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 10);

  return (
    <div className={cn("flex h-[40px] items-end gap-1", className)}>
      {data.map((value, i) => (
        <div
          key={i}
          className="relative flex-1 rounded-sm bg-primary/10 transition-all duration-500"
          style={{
            height: `${Math.max(15, (value / max) * 100)}%`,
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div
            className="absolute bottom-0 left-0 w-full animate-height-increase rounded-sm bg-primary/40"
            style={{
              height: `${(value / max) * 100}%`,
              maxHeight: "100%",
              animationDelay: `${i * 100 + 500}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  percentage = 0,
  size = 56,
  strokeWidth = 6,
}: {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          stroke="hsl(var(--muted))"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="hsl(var(--primary))"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <div className="absolute flex h-full w-full items-center justify-center">
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
    </div>
  );
}

function LineChart({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const max = Math.max(...data, 1);
  const points = data
    .map(
      (value, index) =>
        `${(index / (data.length - 1)) * 100},${100 - (value / max) * 100}`
    )
    .join(" ");

  return (
    <div className={cn("h-[40px] w-full", className)}>
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-75"
        />
        <polyline
          points={`${points} 100,100 0,100`}
          fill="url(#gradient)"
          strokeWidth="0"
          className="opacity-20"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

async function MetricsDashboard() {
  // Mock data with some randomization for graphs
  const mockData = {
    totalAgents: 0,
    activeAgents: 0,
    totalCalls: 0,
    successRate: 0,
    dailyCalls: [2, 4, 3, 6, 5, 8, 7],
    monthlyAgentGrowth: [1, 2, 3, 4, 6, 5, 8],
    successTrend: [65, 70, 68, 75, 78, 82, 85],
  };

  try {
    const agents = await getAgents();
    mockData.totalAgents = agents.length;
    // Simulate some active agents (in a real app, you'd query for active status)
    mockData.activeAgents = Math.min(
      agents.length,
      Math.floor(agents.length * 0.7)
    );
    mockData.totalCalls =
      Math.floor(mockData.totalAgents * 8) + Math.floor(Math.random() * 10);
    mockData.successRate = mockData.totalAgents > 0 ? 85 : 0;
  } catch (error) {
    console.error("Failed to fetch metrics:", error);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{mockData.totalAgents}</div>
            <div className="flex items-center text-xs text-green-500">
              <ChevronUp className="mr-1 h-3 w-3" />
              <span>12%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {mockData.activeAgents} active
          </p>
          <LineChart data={mockData.monthlyAgentGrowth} className="mt-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockData.totalCalls}</div>
          <p className="text-xs text-muted-foreground mb-2">
            +{Math.floor(Math.random() * 5)} today
          </p>
          <BarChart data={mockData.dailyCalls} className="mt-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {mockData.successRate > 0 ? `${mockData.successRate}%` : "--"}
            </div>
            {mockData.successRate > 0 && (
              <DonutChart percentage={mockData.successRate} />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {mockData.successRate > 0
              ? `+${mockData.successRate - mockData.successTrend[0]}% from last month`
              : "Waiting for data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Get Started</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Link
              href="https://docs.elevenlabs.ai"
              target="_blank"
              className="text-sm text-primary hover:underline flex items-center"
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              View documentation
            </Link>
            <Link
              href="#"
              className="text-sm text-primary hover:underline flex items-center"
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              Templates gallery
            </Link>
            <Link
              href="#"
              className="text-sm text-primary hover:underline flex items-center"
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              API reference
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

async function AgentsList() {
  // Fetch agents from the database
  const agents = await getAgents();

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-10 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Sparkles className="h-10 w-10" />
        </div>
        <div className="mt-6 space-y-2">
          <h3 className="text-2xl font-medium">Create your first AI agent</h3>
          <p className="max-w-md text-muted-foreground">
            Build intelligent calling agents that handle conversations naturally
            and achieve your business goals
          </p>
        </div>
        <div className="relative mt-8">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/60 to-primary opacity-75 blur"></div>
          <CreateAgentSheet>
            <Button size="lg" className="relative gap-2">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </CreateAgentSheet>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent, index) => (
        <Link
          key={agent.id}
          href={`/pulse/studio/${agent.id}`}
          className="group"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <div className="relative h-full overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md animate-fade-in">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 transition-all duration-300 group-hover:opacity-100" />

            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                {agent.name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.personalityTrait.slice(0, 3).map((trait) => (
                  <Badge
                    key={trait}
                    variant="secondary"
                    className="px-2.5 py-0.5 text-xs font-normal"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2">
              {agent.description || "No description provided"}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(agent.createdAt))} ago
              </span>
              <div className="rounded-full bg-muted p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AgentStudio() {
  return (
    <div className="relative space-y-8 pb-10">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -top-[50px] -z-10 bg-gradient-to-b from-primary/5 to-transparent h-72 w-full" />

      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Studio</h1>
          <p className="mt-1.5 text-muted-foreground">
            Create and manage your AI calling agents
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="w-full pl-9 sm:w-[250px]"
            />
          </div>
          <CreateAgentSheet>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </CreateAgentSheet>
        </div>
      </div>

      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsDashboard />
      </Suspense>

      <Tabs defaultValue="agents" className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents" className="gap-2">
              <Grid className="h-4 w-4" />
              <span>All Agents</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <ListFilter className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent
          value="agents"
          className="space-y-0 border-none p-0 outline-none"
        >
          <Suspense fallback={<AgentsSkeleton />}>
            <AgentsList />
          </Suspense>
        </TabsContent>

        <TabsContent value="templates" className="border-none p-0 outline-none">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-14 text-center">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <ListFilter className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-xl font-medium">Agent Templates</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Pre-built agent templates will be available soon. Create a custom
              agent for now.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
