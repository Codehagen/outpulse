import { getCurrentUser } from "@/actions/users/get-current-user";

export default async function Dashboard() {
  const user = await getCurrentUser();
  console.log(user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Outpulse AI Calling Platform dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Total Agents</h3>
            <span className="text-2xl font-bold">2</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Active Campaigns</h3>
            <span className="text-2xl font-bold">1</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Total Calls</h3>
            <span className="text-2xl font-bold">124</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Success Rate</h3>
            <span className="text-2xl font-bold">87%</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Recent Activity
        </h2>
        <div className="mt-4 rounded-lg border">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
