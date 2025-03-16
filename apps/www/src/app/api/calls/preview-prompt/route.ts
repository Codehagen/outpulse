import { NextResponse } from "next/server";
import { prisma } from "utils/db";
import { getSession } from "@/actions/users/get-session";

// Direct database access for agent data with user authentication
async function getAgentWithFlow(id: string) {
  try {
    console.log(`Fetching agent ${id} with flow data from database`);
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            elevenLabsApiKey: true,
          },
        },
        // Fetch the flow related to this agent
        flows: {
          take: 1, // Get the most recent flow
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });

    if (!agent) {
      console.log(`Agent ${id} not found in database`);
      return null;
    }

    return agent;
  } catch (error) {
    console.error(`Error fetching agent ${id}:`, error);
    return null;
  }
}

// Generate prompt and first message from flow data
function generateFlowContent(agent: any) {
  try {
    // Check if agent has a flow
    if (!agent.flows || agent.flows.length === 0) {
      console.log("No flow found for this agent, using default content");
      return {
        prompt: `You are an AI assistant representing ${agent.name}. ${agent.description || ""}`,
        firstMessage: `Hello, this is ${agent.name}. How may I assist you today?`,
      };
    }

    const flow = agent.flows[0];
    const nodes = flow.nodes;
    const edges = flow.edges;

    // Debug logs to better understand the data
    console.log(
      "Flow nodes:",
      JSON.stringify(
        nodes.map((n: any) => ({ id: n.id, type: n.type, data: n.data })),
        null,
        2
      )
    );
    console.log("Flow edges:", JSON.stringify(edges, null, 2));

    // Case-insensitive node type matching
    const findNodeByType = (type: string) =>
      nodes.find(
        (node: any) =>
          node.type && node.type.toLowerCase() === type.toLowerCase()
      );

    // Find specific nodes by their type
    const greetingNode = findNodeByType("greeting");
    const questionNode = findNodeByType("question");
    const branchingNode = findNodeByType("branching");
    const toolCallNode =
      findNodeByType("toolCall") || findNodeByType("tool_call");

    // Debug the found nodes
    console.log(
      "Greeting node:",
      greetingNode ? JSON.stringify(greetingNode.data) : "Not found"
    );
    console.log(
      "Question node:",
      questionNode ? JSON.stringify(questionNode.data) : "Not found"
    );
    console.log(
      "Branching node:",
      branchingNode ? JSON.stringify(branchingNode.data) : "Not found"
    );
    console.log(
      "Tool call node:",
      toolCallNode ? JSON.stringify(toolCallNode.data) : "Not found"
    );

    // Get Yes and No responses from the connections to the branching node
    let yesResponseContent = "";
    let noResponseContent = "";

    if (branchingNode) {
      // Find the "Yes" edge and its target node
      const yesEdge = edges.find(
        (edge: any) =>
          edge.sourceId === branchingNode.id && edge.sourceHandle === "Yes"
      );

      if (yesEdge) {
        const yesNode = nodes.find((node: any) => node.id === yesEdge.targetId);
        if (yesNode && yesNode.data) {
          // Debug node content access
          console.log("Yes node data:", JSON.stringify(yesNode.data));
          // Try different ways to access the content
          yesResponseContent =
            typeof yesNode.data === "string"
              ? yesNode.data
              : yesNode.data.content || "";
        }
      }

      // Find the "No" edge and its target node
      const noEdge = edges.find(
        (edge: any) =>
          edge.sourceId === branchingNode.id && edge.sourceHandle === "No"
      );

      if (noEdge) {
        const noNode = nodes.find((node: any) => node.id === noEdge.targetId);
        if (noNode && noNode.data) {
          console.log("No node data:", JSON.stringify(noNode.data));
          noResponseContent =
            typeof noNode.data === "string"
              ? noNode.data
              : noNode.data.content || "";
        }
      }
    }

    // Get the tool call info if it exists
    let toolCallInfo = "";
    if (toolCallNode && toolCallNode.data) {
      const toolName =
        typeof toolCallNode.data === "string"
          ? "the selected tool"
          : toolCallNode.data.toolName || "the selected tool";

      const toolDescription =
        typeof toolCallNode.data === "string"
          ? "perform the required action"
          : toolCallNode.data.description || "perform the required action";

      toolCallInfo = `When the prospect shows interest, you should use the ${toolName} tool to ${toolDescription}.`;
    }

    // Construct the prompt
    let promptContent = `You are ${agent.name}.`;

    if (agent.description) {
      promptContent += ` ${agent.description}`;
    }

    // Get content from greeting node if it exists
    const greetingContent =
      greetingNode && greetingNode.data
        ? typeof greetingNode.data === "string"
          ? greetingNode.data
          : greetingNode.data.content
        : "";

    if (greetingContent) {
      promptContent += `\n\nGreeting: "${greetingContent}"`;
    }

    // Get content from question node if it exists
    const questionContent =
      questionNode && questionNode.data
        ? typeof questionNode.data === "string"
          ? questionNode.data
          : questionNode.data.content
        : "";

    if (questionContent) {
      promptContent += `\n\n"${questionContent}" Always start with this question after greeting.`;
    }

    if (branchingNode) {
      promptContent += "\n\nListen carefully to their response:";

      if (yesResponseContent) {
        promptContent += `\n- If they show interest, respond with: "${yesResponseContent}"`;
      }

      if (noResponseContent) {
        promptContent += `\n- If they're not interested, respond with: "${noResponseContent}"`;
      }
    }

    if (toolCallInfo) {
      promptContent += `\n\n${toolCallInfo}`;
    }

    promptContent += `\n\nConversation style: Be polite, professional, friendly, and approachable. Let the customer speak, don't push them. Focus on understanding their needs.`;

    // Get first message from greeting node
    const firstMessageContent =
      greetingContent ||
      `Hello, this is ${agent.name}. How may I assist you today?`;

    return {
      prompt: promptContent,
      firstMessage: firstMessageContent,
    };
  } catch (error) {
    console.error("Error generating flow content:", error);
    console.error(error instanceof Error ? error.stack : "Unknown error");
    return {
      prompt: `You are an AI assistant representing ${agent.name}. ${agent.description || ""}`,
      firstMessage: `Hello, this is ${agent.name}. How may I assist you today?`,
    };
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Get agent data from the database
    const agent = await getAgentWithFlow(agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Generate the prompt and first message
    const { prompt, firstMessage } = generateFlowContent(agent);

    // Return the generated prompt and first message
    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        voiceId: agent.voiceId,
      },
      prompt,
      firstMessage,
    });
  } catch (error) {
    console.error("Error previewing prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate prompt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
