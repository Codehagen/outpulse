import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/actions/users/get-current-user";
import { getAgents } from "@/actions/agents/get-agents";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  Calendar,
  ChevronUp,
  Clock,
  Globe,
  ListFilter,
  PhoneCall,
  Phone,
  Plus,
  Target,
  Sparkles,
  Users,
  BarChart3,
  Layers,
} from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
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
                <Skeleton className="h-10 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="h-[200px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="h-[200px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();
  const agents = await getAgents();

  // Mock data with some randomization for graphs
  const data = {
    totalAgents: agents.length,
    activeAgents: Math.max(1, Math.floor(agents.length * 0.7)),
    activeCampaigns: 1,
    totalCalls: 124,
    successRate: 87,
    dailyCalls: [12, 18, 15, 22, 30, 25, 24],
    weeklyTrend: [62, 68, 74, 78, 82, 85, 87],
    callsDistribution: [40, 25, 15, 20], // Successful, Transferred, Voicemail, Failed
    upcomingCalls: 18,
    recentCalls: [
      {
        id: "1",
        contact: "John Smith",
        duration: "3:24",
        time: "2 hours ago",
        status: "completed",
      },
      {
        id: "2",
        contact: "Sarah Jones",
        duration: "1:45",
        time: "4 hours ago",
        status: "completed",
      },
      {
        id: "3",
        contact: "Michael Brown",
        duration: "0:58",
        time: "6 hours ago",
        status: "voicemail",
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{data.totalAgents}</div>
              {data.totalAgents > 0 && (
                <div className="flex items-center text-xs text-green-500">
                  <ChevronUp className="mr-1 h-3 w-3" />
                  <span>Active</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {data.activeAgents} active agents
            </p>
            <div className="mt-3">
              <Link
                href="/pulse/studio"
                className="inline-flex items-center text-xs text-primary hover:underline"
              >
                <ArrowRight className="mr-1 h-3 w-3" />
                Manage agents
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground mb-2">
              {data.upcomingCalls} scheduled calls
            </p>
            <LineChart data={[3, 4, 3, 5, 4, 6, 5]} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCalls}</div>
            <p className="text-xs text-muted-foreground mb-2">
              +{data.dailyCalls[data.dailyCalls.length - 1]} today
            </p>
            <BarChart data={data.dailyCalls} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.successRate}%</div>
              <DonutChart percentage={data.successRate} />
            </div>
            <p className="text-xs text-muted-foreground">
              +{data.successRate - data.weeklyTrend[0]}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Call Activity</CardTitle>
            <CardDescription>7-day call volume and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[230px] flex items-end">
              <div className="relative flex h-[200px] w-full items-end">
                {data.dailyCalls.map((value, i) => {
                  const day = new Date();
                  day.setDate(day.getDate() - (6 - i));
                  const dayName = day.toLocaleDateString("en-US", {
                    weekday: "short",
                  });

                  return (
                    <div
                      key={i}
                      className="relative flex flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="w-full rounded-t bg-primary/80"
                        style={{
                          height: `${(value / Math.max(...data.dailyCalls)) * 190}px`,
                        }}
                      />
                      <span className="mt-2 text-xs">{dayName}</span>
                    </div>
                  );
                })}

                <div className="absolute left-0 top-0 h-full w-full">
                  {[0, 1, 2, 3].map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-border/50 text-xs text-muted-foreground"
                      style={{
                        position: "absolute",
                        top: `${i * 25}%`,
                        width: "100%",
                        paddingRight: "8px",
                        textAlign: "right",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {Math.round(
                        Math.max(...data.dailyCalls) * (1 - i * 0.25)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest calls and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentCalls.length > 0 ? (
                data.recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-full p-1.5",
                          call.status === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : call.status === "voicemail"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-blue-500/20 text-blue-500"
                        )}
                      >
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{call.contact}</p>
                        <p className="text-xs text-muted-foreground">
                          {call.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{call.duration}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {call.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity to display
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Agents</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Layers className="h-4 w-4" />
              <span>Campaigns</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="overview"
          className="space-y-0 border-none p-0 outline-none"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Distribution</CardTitle>
                <CardDescription>
                  Status breakdown of recent calls
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <div className="flex max-w-md flex-wrap items-center justify-center gap-6">
                  {[
                    { label: "Successful", value: 40, color: "bg-green-500" },
                    { label: "Transferred", value: 25, color: "bg-blue-500" },
                    { label: "Voicemail", value: 15, color: "bg-amber-500" },
                    { label: "Failed", value: 20, color: "bg-red-500" },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-background"
                        style={{
                          background: `conic-gradient(${stat.color} 0% ${stat.value}%, transparent ${stat.value}% 100%)`,
                        }}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                          <span className="text-xl font-bold">
                            {stat.value}%
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>
                  Next 24 hours of scheduled calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.upcomingCalls > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {data.upcomingCalls} calls scheduled
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Next 24 hours
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-md border bg-muted/40 p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Morning Batch</p>
                          <p className="text-sm">8 calls</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          9:00 AM - 12:00 PM
                        </p>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Afternoon Batch</p>
                          <p className="text-sm">10 calls</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          2:00 PM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming calls scheduled
                    </p>
                    <Button size="sm" className="mt-4">
                      <Plus className="mr-1 h-3 w-3" />
                      Schedule Calls
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="border-none p-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Your Agents</CardTitle>
              <CardDescription>
                {agents.length > 0
                  ? `You have ${agents.length} agents ready to make calls`
                  : "Create your first AI agent to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {agent.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                      <Link href={`/pulse/studio/${agent.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ArrowRight className="h-3 w-3" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">
                    Create your first AI agent
                  </h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Build intelligent calling agents that handle conversations
                    naturally
                  </p>
                  <div className="mt-4">
                    <Link href="/pulse/studio">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Agent
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="border-none p-0 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Your ongoing and upcoming calling campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No active campaigns
                </p>
                <Button size="sm" className="mt-4">
                  <Plus className="mr-1 h-3 w-3" />
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="relative pb-10">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -top-[50px] -z-10 bg-gradient-to-b from-primary/5 to-transparent h-72 w-full" />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
