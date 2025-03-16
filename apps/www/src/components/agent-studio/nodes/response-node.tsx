"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResponseNode({ data, isConnectable }: NodeProps) {
  return (
    <Card className="w-64 shadow-md border-purple-200 border-2">
      <CardHeader className="py-2 px-4 bg-purple-50">
        <CardTitle className="text-sm font-medium text-purple-700">
          {data.label || "Response"}
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
          placeholder="Enter response..."
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
