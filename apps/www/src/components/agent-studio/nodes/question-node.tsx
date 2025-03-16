"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionNode({ data, isConnectable }: NodeProps) {
  return (
    <Card className="w-64 shadow-md border-green-200 border-2">
      <CardHeader className="py-2 px-4 bg-green-50">
        <CardTitle className="text-sm font-medium text-green-700">
          {data.label || "Question"}
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
          placeholder="Enter question..."
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
