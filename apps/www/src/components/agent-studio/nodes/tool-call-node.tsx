"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Tool {
  id: string;
  name: string;
}

type ToolType = "webhook" | "calendar" | "crm" | "email";

export default function ToolCallNode({ data, isConnectable }: NodeProps) {
  const toolTypes = [
    { id: "webhook" as ToolType, name: "Webhook" },
    { id: "calendar" as ToolType, name: "Calendar" },
    { id: "crm" as ToolType, name: "CRM" },
    { id: "email" as ToolType, name: "Email" },
  ];

  const tools: Record<ToolType, Tool[]> = {
    webhook: [
      { id: "sendDiscordNotification", name: "Discord Notification" },
      { id: "genericWebhook", name: "Generic Webhook" },
    ],
    calendar: [
      { id: "calendarBooking", name: "Calendar Booking" },
      { id: "scheduleMeeting", name: "Schedule Meeting" },
    ],
    crm: [
      { id: "crmLookup", name: "CRM Lookup" },
      { id: "updateContact", name: "Update Contact" },
    ],
    email: [
      { id: "emailSender", name: "Email Sender" },
      { id: "emailTemplate", name: "Email Template" },
    ],
  };

  return (
    <Card className="w-80 shadow-md border-red-200 border-2">
      <CardHeader className="py-2 px-4 bg-red-50">
        <CardTitle className="text-sm font-medium text-red-700">
          {data.label || "Tool Call"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div>
          <Label className="text-xs font-medium">Tool Name</Label>
          <Input
            value={data.toolName || ""}
            onChange={(e) => {
              if (data.onChangeToolData) {
                data.onChangeToolData("toolName", e.target.value);
              }
            }}
            placeholder="Enter tool name..."
            className="text-xs h-7 mt-1"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Description</Label>
          <Textarea
            value={data.description || ""}
            onChange={(e) => {
              if (data.onChangeToolData) {
                data.onChangeToolData("description", e.target.value);
              }
            }}
            placeholder="Describe what this tool does..."
            className="text-xs min-h-[60px] resize-none mt-1"
          />
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </Card>
  );
}
