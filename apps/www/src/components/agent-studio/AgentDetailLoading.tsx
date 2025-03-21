import { Skeleton } from "@/components/ui/skeleton";

export function AgentDetailLoading() {
  return (
    <div className="container max-w-screen-2xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <Skeleton className="h-10 w-full max-w-md rounded-lg" />

      <div className="h-[750px]">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  );
}
