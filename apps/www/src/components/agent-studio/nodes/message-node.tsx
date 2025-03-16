"use client";

import { NodeProps } from "reactflow";
import { MessageSquare } from "lucide-react";
import { BaseNode, BaseNodeData } from "./base-node";

export interface MessageNodeData extends BaseNodeData {
  message?: string;
}

export function MessageNode(props: NodeProps<MessageNodeData>) {
  return (
    <BaseNode {...props}>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="h-3 w-3" />
        <span>Message</span>
      </div>
      {props.data.message && (
        <div className="mt-2 rounded bg-muted p-2 text-xs">
          "{props.data.message}"
        </div>
      )}
    </BaseNode>
  );
}
