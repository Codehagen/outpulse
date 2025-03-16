"use client";

import { NodeProps } from "reactflow";
import { GitFork } from "lucide-react";
import { BaseNode, BaseNodeData } from "./base-node";

export interface ConditionNodeData extends BaseNodeData {
  condition?: string;
}

export function ConditionNode(props: NodeProps<ConditionNodeData>) {
  return (
    <BaseNode {...props}>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <GitFork className="h-3 w-3" />
        <span>Condition</span>
      </div>
      {props.data.condition && (
        <div className="mt-2 rounded bg-muted p-2 text-xs">
          <code>{props.data.condition}</code>
        </div>
      )}
    </BaseNode>
  );
}
