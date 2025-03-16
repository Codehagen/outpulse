"use client";

import { NodeProps } from "reactflow";
import { Zap } from "lucide-react";
import { BaseNode, BaseNodeData } from "./base-node";

export function TriggerNode(props: NodeProps<BaseNodeData>) {
  return (
    <BaseNode {...props} showTargetHandle={false}>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        <span>Trigger Event</span>
      </div>
    </BaseNode>
  );
}
