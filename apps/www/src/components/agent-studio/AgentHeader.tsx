import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AgentHeaderProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    updatedAt: string | Date;
  };
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => Promise<void>;
}

export function AgentHeader({
  agent,
  isSaving,
  isDirty,
  onSave,
}: AgentHeaderProps) {
  return (
    <div className="space-y-2">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/pulse">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/pulse/studio">Agent Studio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{agent.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Link href="/pulse/studio">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          <p className="text-muted-foreground">
            {agent.description ? (
              <span className="line-clamp-1">{agent.description}</span>
            ) : (
              "No description provided"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="hidden md:flex gap-1 items-center font-normal"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Last edited {new Date(agent.updatedAt).toLocaleDateString()}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSave}
                  disabled={isSaving || !isDirty}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isDirty ? "Save Changes" : "Saved"}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {!isDirty && (
                <TooltipContent>
                  <p>All changes are saved</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
