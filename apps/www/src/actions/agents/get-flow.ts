"use server";

import { prisma } from "utils/db";
import { getCurrentUser } from "../users/get-current-user";

interface FlowResponse {
  id: string;
  name: string;
  nodes: {
    id: string;
    type: string;
    position: {
      x: number;
      y: number;
    };
    data: any;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    animated?: boolean;
    data?: any;
  }[];
}

/**
 * Gets the conversation flow for an agent
 *
 * @param agentId The agent ID to get the flow for
 * @returns The flow data or null if not found
 */
export async function getFlow(agentId: string): Promise<FlowResponse | null> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();

    // Check if agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: currentUser.id,
      },
      include: {
        flows: {
          include: {
            nodes: true,
            edges: {
              include: {
                source: true,
                target: true,
              },
            },
          },
        },
      },
    });

    if (!agent || agent.flows.length === 0) {
      return null;
    }

    const flow = agent.flows[0];

    // Map the database models to the ReactFlow format
    const nodes = flow.nodes.map((node) => ({
      id: node.id,
      type: mapNodeTypeToReactFlow(node.type),
      position: {
        x: node.positionX,
        y: node.positionY,
      },
      data: node.data,
    }));

    const edges = flow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: true,
      data: edge.data,
    }));

    return {
      id: flow.id,
      name: flow.name,
      nodes,
      edges,
    };
  } catch (error) {
    console.error(`Failed to fetch flow for agent ${agentId}:`, error);
    return null;
  }
}

/**
 * Maps the database NodeType enum to React Flow node types
 */
function mapNodeTypeToReactFlow(type: string): string {
  switch (type) {
    case "GREETING":
      return "greeting";
    case "QUESTION":
      return "question";
    case "RESPONSE":
      return "response";
    case "BRANCHING":
      return "branching";
    case "TOOL_CALL":
      return "toolCall";
    case "CONDITION":
      return "condition";
    default:
      return "default";
  }
}
