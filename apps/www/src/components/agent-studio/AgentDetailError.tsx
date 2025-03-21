import Link from "next/link";
import { ArrowLeft, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentDetailErrorProps {
  message?: string;
}

export function AgentDetailError({ message }: AgentDetailErrorProps) {
  return (
    <div className="container flex h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="bg-muted mb-4 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <UserCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {message ||
            "The agent you are looking for does not exist or you don't have permission to view it."}
        </p>
        <Link href="/pulse/studio">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Agent Studio
          </Button>
        </Link>
      </div>
    </div>
  );
}
