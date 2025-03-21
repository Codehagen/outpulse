import { CornerDownLeft, HelpCircle, Code } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentMessagesSectionProps {
  firstMessage: string;
  systemPrompt: string;
  onFirstMessageChange: (value: string) => void;
  onSystemPromptChange: (value: string) => void;
}

export function AgentMessagesSection({
  firstMessage,
  systemPrompt,
  onFirstMessageChange,
  onSystemPromptChange,
}: AgentMessagesSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* First Message */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CornerDownLeft className="h-4 w-4" /> First Message
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This is the first message your agent will say when answering
                    a call. It sets the tone for the conversation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            The first message the agent will say. If empty, the agent will wait
            for the user to start the conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Hello, this is [Agent Name]. How can I help you today?"
            className="min-h-[120px] resize-y"
            value={firstMessage}
            onChange={(e) => onFirstMessageChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-4 w-4" /> System Prompt
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The system prompt determines your agent's persona and
                    provides context for the conversation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            The system prompt is used to determine the persona of the agent and
            the context of the conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="You are a helpful assistant..."
            className="min-h-[120px] resize-y"
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
