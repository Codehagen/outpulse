"use client";

import type React from "react";

import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  Panel,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveFlow as saveFlowAction } from "@/actions/agents/save-flow";
import { getFlow } from "@/actions/agents/get-flow";

import GreetingNode from "./nodes/greeting-node";
import QuestionNode from "./nodes/question-node";
import ResponseNode from "./nodes/response-node";
import BranchingNode from "./nodes/branching-node";
import ToolCallNode from "./nodes/tool-call-node";

// Define node types
const nodeTypes: NodeTypes = {
  greeting: GreetingNode,
  question: QuestionNode,
  response: ResponseNode,
  branching: BranchingNode,
  toolCall: ToolCallNode,
};

// Initial nodes for demonstration with increased vertical spacing
const initialNodes: Node[] = [
  {
    id: "1",
    type: "greeting",
    position: { x: 250, y: 50 },
    data: {
      label: "Greeting",
      content:
        "Hello, this is [Agent Name] calling from [Company]. How are you today?",
    },
  },
  {
    id: "2",
    type: "question",
    position: { x: 250, y: 250 },
    data: {
      label: "Initial Question",
      content:
        "I'm calling to discuss our new service that helps businesses like yours. Do you have a few minutes to chat?",
    },
  },
  {
    id: "3",
    type: "branching",
    position: { x: 250, y: 450 },
    data: {
      label: "Response Branch",
      options: ["Yes", "No"],
    },
  },
  {
    id: "4",
    type: "response",
    position: { x: 100, y: 650 },
    data: {
      label: "Yes Response",
      content: "Great! Let me tell you about our service...",
    },
  },
  {
    id: "5",
    type: "response",
    position: { x: 400, y: 650 },
    data: {
      label: "No Response",
      content:
        "I understand you're busy. Would it be better if I sent you some information by email?",
    },
  },
  {
    id: "7",
    type: "toolCall",
    position: { x: 100, y: 850 },
    data: {
      label: "Use Tool: Discord Notification",
      toolType: "webhook",
      toolName: "sendDiscordNotification",
      description: "Send important call information to the Discord channel",
      parameters: {
        method: "POST",
        url: "http://localhost:3000/api/discord-webhook",
        message:
          "Extract the most important information from the conversation to send as a notification",
      },
    },
  },
];

// Initial edges for demonstration
const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", sourceHandle: "Yes", animated: true },
  { id: "e3-5", source: "3", target: "5", sourceHandle: "No", animated: true },
  { id: "e4-7", source: "4", target: "7", animated: true },
];

interface ConversationFlowDesignerProps {
  agentId: string;
  onJsonOutput?: (json: string) => void;
}

export default function ConversationFlowDesigner({
  agentId,
  onJsonOutput,
}: ConversationFlowDesignerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [businessName, setBusinessName] = useState("OurBusinessName");
  const [prospectName, setProspectName] = useState("ProspectBusinessName");
  const [agentName, setAgentName] = useState("Johannes");
  const [phoneNumber, setPhoneNumber] = useState("+1234567890");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load flow data when component mounts or agentId changes
  useEffect(() => {
    async function loadFlow() {
      setIsLoading(true);
      try {
        const flowData = await getFlow(agentId);

        if (flowData && flowData.nodes.length > 0) {
          // Load nodes and edges from the database
          const flowNodes = flowData.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              // Add event handlers based on node type
              onChange:
                node.type === "greeting" ||
                node.type === "question" ||
                node.type === "response"
                  ? (content: string) => updateNodeContent(node.id, content)
                  : undefined,
              onChangeOptions:
                node.type === "branching"
                  ? (options: string[]) =>
                      updateBranchingOptions(node.id, options)
                  : undefined,
              onChangeToolData:
                node.type === "toolCall"
                  ? (key: string, value: string) =>
                      updateToolNodeData(node.id, key, value)
                  : undefined,
            },
          }));

          setNodes(flowNodes);
          setEdges(flowData.edges);
        } else {
          // If no flow exists, use the initial demo flow
          const demoNodes = initialNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onChange:
                node.type === "greeting" ||
                node.type === "question" ||
                node.type === "response"
                  ? (content: string) => updateNodeContent(node.id, content)
                  : undefined,
              onChangeOptions:
                node.type === "branching"
                  ? (options: string[]) =>
                      updateBranchingOptions(node.id, options)
                  : undefined,
              onChangeToolData:
                node.type === "toolCall"
                  ? (key: string, value: string) =>
                      updateToolNodeData(node.id, key, value)
                  : undefined,
            },
          }));

          setNodes(demoNodes);
          setEdges(initialEdges);
        }
      } catch (error) {
        console.error("Failed to load flow:", error);
        toast.error("Failed to load conversation flow");

        // Fall back to initial nodes if loading fails
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLoading(false);
      }
    }

    loadFlow();
  }, [agentId, setNodes, setEdges]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Handle node selection and update node content
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add a new node
  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 250, y: 100 + nodes.length * 200 }, // Increased vertical spacing to 200px
      data: { label: `New ${type}` },
    };

    // Add specific data based on node type
    switch (type) {
      case "greeting":
        newNode.data.content =
          "Hello, this is [Agent Name] calling from [Company].";
        newNode.data.onChange = (content: string) =>
          updateNodeContent(newNode.id, content);
        break;
      case "question":
        newNode.data.content = "What do you think about...?";
        newNode.data.onChange = (content: string) =>
          updateNodeContent(newNode.id, content);
        break;
      case "response":
        newNode.data.content = "I understand. Let me help with that.";
        newNode.data.onChange = (content: string) =>
          updateNodeContent(newNode.id, content);
        break;
      case "branching":
        newNode.data.options = ["Option 1", "Option 2"];
        newNode.data.onChangeOptions = (options: string[]) =>
          updateBranchingOptions(newNode.id, options);
        break;
      case "toolCall":
        newNode.data.label = "Use Tool";
        newNode.data.toolType = "webhook";
        newNode.data.toolName = "selectTool";
        newNode.data.description = "Select a tool for the AI to use";
        newNode.data.onChangeToolData = (key: string, value: string) =>
          updateToolNodeData(newNode.id, key, value);
        newNode.data.parameters = {
          method: "POST",
          url: "",
          message: "Extract information from the conversation",
        };
        break;
    }

    setNodes((nds) => [...nds, newNode]);
  };

  // Update node content
  const updateNodeContent = (nodeId: string, content: string) => {
    console.log(`Updating node ${nodeId} with content: ${content}`);

    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              content,
              // Preserve the onChange handler
              onChange: (newContent: string) =>
                updateNodeContent(node.id, newContent),
            },
          };
        }
        return node;
      });

      // Regenerate the JSON after node update
      setTimeout(() => generateTestJson(), 10);

      return newNodes;
    });
  };

  // Update tool node properties
  const updateToolNodeData = (nodeId: string, key: string, value: string) => {
    console.log(
      `Updating tool node ${nodeId}, key ${key} with value: ${value}`
    );

    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
              // Preserve the onChange handler
              onChangeToolData: (newKey: string, newValue: string) =>
                updateToolNodeData(node.id, newKey, newValue),
            },
          };
        }
        return node;
      });

      // Regenerate the JSON after node update
      setTimeout(() => generateTestJson(), 10);

      return newNodes;
    });
  };

  // Update branching node options
  const updateBranchingOptions = (nodeId: string, options: string[]) => {
    console.log(`Updating branching node ${nodeId} with options:`, options);

    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              options,
              // Preserve the onChange handler
              onChangeOptions: (newOptions: string[]) =>
                updateBranchingOptions(node.id, newOptions),
            },
          };
        }
        return node;
      });

      // Regenerate the JSON after node update
      setTimeout(() => generateTestJson(), 10);

      return newNodes;
    });
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);

      // Regenerate the JSON
      setTimeout(generateTestJson, 10);
    }
  };

  // Save the flow configuration
  const saveFlow = async () => {
    setIsSaving(true);

    try {
      // Prepare the flow data for saving
      // Convert ReactFlow nodes to the expected saveFlow input format
      const sanitizedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        data: {
          ...node.data,
          // Remove function references
          onChange: undefined,
          onChangeOptions: undefined,
          onChangeToolData: undefined,
        },
      }));

      // Convert ReactFlow edges to the expected saveFlow input format
      const sanitizedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        animated: edge.animated,
        data: edge.data,
      }));

      const flowData = {
        agentId,
        nodes: sanitizedNodes,
        edges: sanitizedEdges,
      };

      // Save to the database
      const result = await saveFlowAction(flowData);

      if (result.success) {
        toast.success("Conversation flow saved successfully!");
      } else {
        toast.error(result.error || "Failed to save flow");
      }
    } catch (error) {
      console.error("Error saving flow:", error);
      toast.error("Failed to save conversation flow");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to find nodes connected to a given node
  const findConnectedNodes = (
    nodeId: string,
    direction: "outgoing" | "incoming" = "outgoing"
  ) => {
    return edges
      .filter((edge) =>
        direction === "outgoing"
          ? edge.source === nodeId
          : edge.target === nodeId
      )
      .map((edge) =>
        direction === "outgoing"
          ? nodes.find((n) => n.id === edge.target)
          : nodes.find((n) => n.id === edge.source)
      )
      .filter(Boolean) as Node[];
  };

  // Traverse the flow to build a structured conversation path
  const buildConversationPath = (
    startNodeId: string,
    path: Node[] = [],
    visited = new Set<string>()
  ): Node[] => {
    if (visited.has(startNodeId)) return path;

    const node = nodes.find((n) => n.id === startNodeId);
    if (!node) return path;

    visited.add(startNodeId);
    path.push(node);

    const connectedNodes = findConnectedNodes(startNodeId);
    connectedNodes.forEach((nextNode) => {
      buildConversationPath(nextNode.id, path, visited);
    });

    return path;
  };

  // Generate test JSON output
  const generateTestJson = () => {
    // Make sure we're getting the latest node content
    const currentNodes = nodes;
    const currentEdges = edges;

    // Find specific nodes by their type and connections
    const greetingNode = currentNodes.find((node) => node.type === "greeting");
    const questionNode = currentNodes.find((node) => node.type === "question");
    const branchingNode = currentNodes.find(
      (node) => node.type === "branching"
    );
    const toolCallNode = currentNodes.find((node) => node.type === "toolCall");

    // Get Yes and No responses from the connections to the branching node
    let yesResponseContent = "";
    let noResponseContent = "";

    if (branchingNode) {
      // Find the "Yes" edge and its target node
      const yesEdge = currentEdges.find(
        (edge) =>
          edge.source === branchingNode.id && edge.sourceHandle === "Yes"
      );

      if (yesEdge) {
        const yesNode = currentNodes.find((node) => node.id === yesEdge.target);
        if (yesNode && yesNode.data && yesNode.data.content) {
          yesResponseContent = yesNode.data.content;
        }
      }

      // Find the "No" edge and its target node
      const noEdge = currentEdges.find(
        (edge) => edge.source === branchingNode.id && edge.sourceHandle === "No"
      );

      if (noEdge) {
        const noNode = currentNodes.find((node) => node.id === noEdge.target);
        if (noNode && noNode.data && noNode.data.content) {
          noResponseContent = noNode.data.content;
        }
      }
    }

    // Get the tool call info if it exists
    let toolCallInfo = "";
    if (toolCallNode) {
      toolCallInfo = `When the prospect shows interest, you MUST use the ${toolCallNode.data.toolName} tool to ${toolCallNode.data.description}.`;
    }

    // Construct the prompt exactly as in the example
    const promptContent = `You are ${agentName} working at ${businessName}. Your goal is to have a conversation with a potential customer from ${prospectName}.

${
  questionNode && questionNode.data.content
    ? `"${questionNode.data.content
        .replace(/{ourbusinessname}/g, businessName)
        .replace(
          /{prospectbusinessname}/g,
          prospectName
        )}" Always start with this.`
    : ""
}

${branchingNode ? "Listen carefully to their response:" : ""}
${
  yesResponseContent
    ? `- If they show interest, respond with: "${yesResponseContent
        .replace(/{ourbusinessname}/g, businessName)
        .replace(/{prospectbusinessname}/g, prospectName)}"`
    : ""
}
${
  noResponseContent
    ? `- If they're not interested, respond with: "${noResponseContent
        .replace(/{ourbusinessname}/g, businessName)
        .replace(/{prospectbusinessname}/g, prospectName)}"`
    : ""
}

${toolCallInfo}

Conversation style: Be polite, professional, friendly, and approachable. Let the customer speak, don't push them. Focus on understanding their needs, not selling aggressively.`;

    // Get first message from greeting node
    const firstMessageContent =
      greetingNode && greetingNode.data.content
        ? greetingNode.data.content
            .replace(/\[Agent Name\]/g, agentName)
            .replace(/\[Company\]/g, businessName)
            .replace(/{ourbusinessname}/g, businessName)
            .replace(/{prospectbusinessname}/g, prospectName)
        : `Hello, this is ${agentName} calling from ${businessName}. How are you today?`;

    // Create the final JSON structure
    const testJsonObject = {
      prompt: promptContent,
      first_message: firstMessageContent,
      number: phoneNumber,
    };

    const jsonString = JSON.stringify(testJsonObject, null, 2);

    // Pass the JSON to the parent component if the callback exists
    if (onJsonOutput) {
      onJsonOutput(jsonString);
    }
  };

  // Update JSON when relevant props change
  useEffect(() => {
    if (onJsonOutput) {
      generateTestJson();
    }
  }, [businessName, prospectName, agentName, phoneNumber, onJsonOutput]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-[75vh] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        >
          <Background size={1} gap={16} />
          <Controls />
          <MiniMap />

          <Panel position="top-right" className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Node
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addNode("greeting")}>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                  Greeting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNode("question")}>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  Question
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNode("response")}>
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                  Response
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNode("branching")}>
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                  Branching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNode("toolCall")}>
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                  Tool Call
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelectedNode}
              disabled={!selectedNode}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={saveFlow}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Flow"}
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
