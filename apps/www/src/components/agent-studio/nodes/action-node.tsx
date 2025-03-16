"use client";

import { NodeProps } from "reactflow";
import { Workflow } from "lucide-react";
import { BaseNode, BaseNodeData } from "./base-node";

export interface ActionNodeData extends BaseNodeData {
  actionType?: string;
  parameters?: Record<string, any>;
}

export function ActionNode(props: NodeProps<ActionNodeData>) {
  return (
    <BaseNode {...props}>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Workflow className="h-3 w-3" />
        <span>{props.data.actionType || "Action"}</span>
      </div>
      {props.data.parameters &&
        Object.keys(props.data.parameters).length > 0 && (
          <div className="mt-2 rounded bg-muted p-2 text-xs">
            <div className="font-medium">Parameters:</div>
            <div className="mt-1 space-y-1">
              {Object.entries(props.data.parameters).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono mr-1">{key}:</span>
                  <span className="text-muted-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </BaseNode>
  );
}
