"use client";

import { Handle, Position, NodeProps } from "reactflow";

export interface BaseNodeData {
  label: string;
  description?: string;
}

export function BaseNode({
  data,
  selected,
  children,
  showSourceHandle = true,
  showTargetHandle = true,
}: NodeProps<BaseNodeData> & {
  children?: React.ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}) {
  return (
    <div
      className={`min-w-[180px] rounded-md border bg-card p-3 shadow-sm transition-all ${
        selected ? "border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-muted-foreground"
        />
      )}

      <div className="space-y-2">
        <div className="mb-2 font-medium">{data.label}</div>
        {data.description && (
          <div className="text-xs text-muted-foreground">
            {data.description}
          </div>
        )}
        {children}
      </div>

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !rounded-full !border-2 !border-background !bg-muted-foreground"
        />
      )}
    </div>
  );
}
