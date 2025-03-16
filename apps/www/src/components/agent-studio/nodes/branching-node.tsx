"use client";

import { useState, useEffect } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export default function BranchingNode({ data, isConnectable }: NodeProps) {
  const [options, setOptions] = useState<string[]>(
    data.options || ["Yes", "No"]
  );
  const [newOption, setNewOption] = useState("");

  // Update local state when data.options changes
  useEffect(() => {
    setOptions(data.options || ["Yes", "No"]);
  }, [data.options]);

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()];
      setOptions(updatedOptions);

      // Call the parent component's handler if it exists
      if (data.onChangeOptions) {
        data.onChangeOptions(updatedOptions);
      } else {
        data.options = updatedOptions;
      }

      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter(
      (_: string, i: number) => i !== index
    );
    setOptions(updatedOptions);

    // Call the parent component's handler if it exists
    if (data.onChangeOptions) {
      data.onChangeOptions(updatedOptions);
    } else {
      data.options = updatedOptions;
    }
  };

  return (
    <Card className="w-64 shadow-md border-amber-200 border-2">
      <CardHeader className="py-2 px-4 bg-amber-50">
        <CardTitle className="text-sm font-medium text-amber-700">
          {data.label || "Branching"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="text-xs font-medium">Response Options:</div>
          <ul className="space-y-1">
            {options.map((option: string, index: number) => (
              <li
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span>{option}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Handle
                  id={option}
                  type="source"
                  position={Position.Bottom}
                  className="!left-auto !right-auto !translate-x-0 !bottom-0"
                  style={{
                    left: `${(index + 1) * (100 / (options.length + 1))}%`,
                  }}
                  isConnectable={isConnectable}
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-1">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="New option..."
              className="text-xs h-7"
              onKeyDown={(e) => e.key === "Enter" && addOption()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={addOption}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
    </Card>
  );
}
