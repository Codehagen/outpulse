"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "utils/db";
import { getCurrentUser } from "../users/get-current-user";
import type { Node, Edge } from "reactflow";

// Schema for validating flow data
const SaveFlowSchema = z.object({
  agentId: z.string().uuid(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.any(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional().nullable(),
      targetHandle: z.string().optional().nullable(),
      animated: z.boolean().optional(),
      data: z.any().optional(),
    })
  ),
});

export type SaveFlowInput = z.infer<typeof SaveFlowSchema>;

interface FlowNode {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  data: any;
  flowId: string;
}

interface FlowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  data: any;
  flowId: string;
}

/**
 * Saves a conversation flow for an agent with optimized update strategy
 *
 * @param data The flow data to save (nodes and edges)
 * @returns Success status and flow ID or error message
 */
export async function saveFlow(
  data: SaveFlowInput
): Promise<{ success: boolean; flowId?: string; error?: string }> {
  try {
    // Validate input
    const validatedData = SaveFlowSchema.parse(data);

    // Get current user
    const currentUser = await getCurrentUser();

    // Check if the agent belongs to the current user
    const agent = await prisma.agent.findFirst({
      where: {
        id: validatedData.agentId,
        userId: currentUser.id,
      },
      include: {
        flows: true,
      },
    });

    if (!agent) {
      return {
        success: false,
        error: "Agent not found or you don't have permission to update it.",
      };
    }

    // Begin transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Check if flow already exists for this agent
      let flow = agent.flows[0]; // Get the first flow or undefined

      if (!flow) {
        // Create a new flow if it doesn't exist
        flow = await tx.flow.create({
          data: {
            name: `${agent.name}'s Conversation Flow`,
            agent: {
              connect: {
                id: agent.id,
              },
            },
          },
        });

        // For a new flow, we'll insert all nodes and edges
        await createAllNodesAndEdges(
          tx,
          flow.id,
          validatedData.nodes,
          validatedData.edges
        );
      } else {
        // For existing flows, we'll compare and update efficiently
        await updateFlowEfficiently(
          tx,
          flow.id,
          validatedData.nodes,
          validatedData.edges
        );
      }

      return flow;
    });

    // Revalidate the agent detail page
    revalidatePath(`/pulse/studio/${validatedData.agentId}`);

    return {
      success: true,
      flowId: result.id,
    };
  } catch (error) {
    console.error("Failed to save flow:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return {
      success: false,
      error: "Failed to save conversation flow. Please try again.",
    };
  }
}

/**
 * Maps the React Flow node type to the database NodeType enum
 */
function mapNodeType(
  type: string
):
  | "GREETING"
  | "QUESTION"
  | "RESPONSE"
  | "BRANCHING"
  | "TOOL_CALL"
  | "CONDITION" {
  switch (type) {
    case "greeting":
      return "GREETING";
    case "question":
      return "QUESTION";
    case "response":
      return "RESPONSE";
    case "branching":
      return "BRANCHING";
    case "toolCall":
      return "TOOL_CALL";
    default:
      return "CONDITION";
  }
}

/**
 * Create all nodes and edges for a new flow
 */
async function createAllNodesAndEdges(
  tx: any,
  flowId: string,
  nodeData: SaveFlowInput["nodes"],
  edgeData: SaveFlowInput["edges"]
) {
  // First create all nodes
  const createdNodes = await Promise.all(
    nodeData.map((node) =>
      tx.node.create({
        data: {
          type: mapNodeType(node.type),
          positionX: node.position.x,
          positionY: node.position.y,
          data: node.data,
          flowId: flowId,
        },
      })
    )
  );

  // Create nodeId mapping for edge creation
  const nodeIdMap = nodeData.reduce((map, node, index) => {
    map[node.id] = createdNodes[index].id;
    return map;
  }, {} as Record<string, string>);

  // Create all edges
  await Promise.all(
    edgeData.map((edge) =>
      tx.edge.create({
        data: {
          id: edge.id,
          label: edge.id,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          data: edge.data || {},
          flowId: flowId,
          sourceId: nodeIdMap[edge.source],
          targetId: nodeIdMap[edge.target],
        },
      })
    )
  );
}

/**
 * Update a flow efficiently by comparing existing nodes and edges
 */
async function updateFlowEfficiently(
  tx: any,
  flowId: string,
  nodeData: SaveFlowInput["nodes"],
  edgeData: SaveFlowInput["edges"]
) {
  // 1. Get existing nodes and edges
  const existingNodes = await tx.node.findMany({
    where: { flowId },
    select: {
      id: true,
      type: true,
      positionX: true,
      positionY: true,
      data: true,
    },
  });

  const existingEdges = await tx.edge.findMany({
    where: { flowId },
    select: {
      id: true,
      sourceId: true,
      targetId: true,
      sourceHandle: true,
      targetHandle: true,
      data: true,
    },
  });

  // 2. Create maps of existing nodes and edges for easy lookup
  const existingNodeMap = new Map(existingNodes.map((node) => [node.id, node]));
  const existingEdgeMap = new Map(existingEdges.map((edge) => [edge.id, edge]));

  // 3. Create sets of node and edge IDs from the incoming data
  const incomingNodeIds = new Set(nodeData.map((node) => node.id));
  const incomingEdgeIds = new Set(edgeData.map((edge) => edge.id));

  // 4. Find nodes and edges to delete (exist in DB but not in incoming data)
  const nodeIdsToDelete = existingNodes
    .filter((node) => !incomingNodeIds.has(node.id))
    .map((node) => node.id);

  const edgeIdsToDelete = existingEdges
    .filter((edge) => !incomingEdgeIds.has(edge.id))
    .map((edge) => edge.id);

  // 5. Delete nodes and edges that are no longer needed
  if (edgeIdsToDelete.length > 0) {
    await tx.edge.deleteMany({
      where: { id: { in: edgeIdsToDelete } },
    });
  }

  if (nodeIdsToDelete.length > 0) {
    await tx.node.deleteMany({
      where: { id: { in: nodeIdsToDelete } },
    });
  }

  // 6. Process nodes - update existing or create new ones
  const nodesPromises = nodeData.map(async (node) => {
    const existingNode = existingNodeMap.get(node.id);

    if (existingNode) {
      // Check if node needs update by comparing values
      const positionChanged =
        existingNode.positionX !== node.position.x ||
        existingNode.positionY !== node.position.y;

      const dataChanged =
        JSON.stringify(existingNode.data) !== JSON.stringify(node.data);
      const typeChanged = existingNode.type !== mapNodeType(node.type);

      if (positionChanged || dataChanged || typeChanged) {
        // Update only if something changed
        return tx.node.update({
          where: { id: existingNode.id },
          data: {
            type: mapNodeType(node.type),
            positionX: node.position.x,
            positionY: node.position.y,
            data: node.data,
          },
        });
      }

      // If nothing changed, return the existing node
      return existingNode;
    } else {
      // Create new node
      return tx.node.create({
        data: {
          id: node.id,
          type: mapNodeType(node.type),
          positionX: node.position.x,
          positionY: node.position.y,
          data: node.data,
          flowId: flowId,
        },
      });
    }
  });

  const updatedNodes = await Promise.all(nodesPromises);

  // 7. Create a mapping of React Flow node IDs to database node IDs
  const nodeIdMap = nodeData.reduce((map, node, index) => {
    const dbNode = updatedNodes[index];
    map[node.id] = dbNode.id;
    return map;
  }, {} as Record<string, string>);

  // 8. Process edges - update existing or create new ones
  const edgesPromises = edgeData.map(async (edge) => {
    const existingEdge = existingEdgeMap.get(edge.id);
    const sourceId = nodeIdMap[edge.source];
    const targetId = nodeIdMap[edge.target];

    if (existingEdge) {
      // Check if edge needs update
      const sourceChanged = existingEdge.sourceId !== sourceId;
      const targetChanged = existingEdge.targetId !== targetId;
      const sourceHandleChanged =
        existingEdge.sourceHandle !== (edge.sourceHandle || null);
      const targetHandleChanged =
        existingEdge.targetHandle !== (edge.targetHandle || null);
      const dataChanged =
        JSON.stringify(existingEdge.data) !== JSON.stringify(edge.data || {});

      if (
        sourceChanged ||
        targetChanged ||
        sourceHandleChanged ||
        targetHandleChanged ||
        dataChanged
      ) {
        // Update only if something changed
        return tx.edge.update({
          where: { id: existingEdge.id },
          data: {
            sourceId,
            targetId,
            sourceHandle: edge.sourceHandle || null,
            targetHandle: edge.targetHandle || null,
            data: edge.data || {},
          },
        });
      }

      // If nothing changed, return the existing edge
      return existingEdge;
    } else {
      // Create new edge
      return tx.edge.create({
        data: {
          id: edge.id,
          label: edge.id,
          flowId,
          sourceId,
          targetId,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          data: edge.data || {},
        },
      });
    }
  });

  await Promise.all(edgesPromises);
}
