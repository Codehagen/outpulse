"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GreetingNode({ data, isConnectable }: NodeProps) {
  return (
    <Card className="w-64 shadow-md border-blue-200 border-2">
      <CardHeader className="py-2 px-4 bg-blue-50">
        <CardTitle className="text-sm font-medium text-blue-700">
          {data.label || "Greeting"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Textarea
          value={data.content}
          onChange={(e) => {
            if (data.onChange) {
              data.onChange(e.target.value);
            }
          }}
          placeholder="Enter greeting message..."
          className="text-xs min-h-[80px] resize-none"
        />
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
