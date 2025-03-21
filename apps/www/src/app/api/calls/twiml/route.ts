import { NextResponse } from "next/server";
import { prisma } from "utils/db";

// Hardcoded agent ID for testing
const ELEVENLABS_AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "KR70lfUkcaRuF0TTVPnq";

// Twilio requires a fully qualified URL that's accessible from the internet
// For local development, set this environment variable to your ngrok URL
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;

// WebSocket Server URL (our standalone server)
const WEBSOCKET_SERVER_URL =
  process.env.WEBSOCKET_SERVER_URL || "http://localhost:8000";

// Direct database access for agent data (no authentication required)
async function getAgentDirectly(id: string) {
  try {
    console.log(`Fetching agent ${id} directly from database`);
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
      "Flow nodes in TwiML:",
      JSON.stringify(
        nodes.map((n: any) => ({ id: n.id, type: n.type })),
        null,
        2
      )
    );

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
      "Found nodes in TwiML:",
      JSON.stringify({
        greeting: greetingNode ? greetingNode.id : "Not found",
        question: questionNode ? questionNode.id : "Not found",
        branching: branchingNode ? branchingNode.id : "Not found",
        toolCall: toolCallNode ? toolCallNode.id : "Not found",
      })
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
    return {
      prompt: `You are an AI assistant representing ${agent.name}. ${agent.description || ""}`,
      firstMessage: `Hello, this is ${agent.name}. How may I assist you today?`,
    };
  }
}

// Handler for generating TwiML response
async function generateTwimlResponse(request: Request) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Get agent data directly from the database (no auth required)
    const agent = await getAgentDirectly(agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get user's ElevenLabs API key if available
    const elevenLabsApiKey = agent.user?.elevenLabsApiKey;

    // Get language from agent if it exists, otherwise default to 'en'
    const language = agent.language || "en";

    // Generate prompt and first message from the flow data
    const { prompt, firstMessage } = generateFlowContent(agent);

    // Use the external WebSocket server URL instead of our Edge runtime
    // Convert the server URL to WebSocket URL (ws:// or wss://)
    let wsServerUrl;

    try {
      // Parse the URL and use the correct protocol (http->ws, https->wss)
      const serverUrl = new URL(WEBSOCKET_SERVER_URL);
      const protocol = serverUrl.protocol === "https:" ? "wss:" : "ws:";
      wsServerUrl = `${protocol}//${serverUrl.host}/outbound-media-stream`;

      console.log(`Using WebSocket server URL: ${wsServerUrl}`);
    } catch (error) {
      console.error("Error parsing WebSocket server URL:", error);
      return NextResponse.json(
        { error: "Invalid WebSocket server URL" },
        { status: 500 }
      );
    }

    // Generate TwiML with agent data and ElevenLabs information
    // Conditionally include the API key only if it's available
    let twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${wsServerUrl}">
            <Parameter name="agentId" value="${agentId}" />
            <Parameter name="elevenLabsAgentId" value="${ELEVENLABS_AGENT_ID}" />`;

    // Only include the API key if it's available
    if (elevenLabsApiKey) {
      twimlResponse += `\n            <Parameter name="elevenLabsApiKey" value="${elevenLabsApiKey}" />`;
    }

    // Add the flow-generated prompt and first message
    twimlResponse += `
            <Parameter name="prompt" value="${prompt}" />
            <Parameter name="firstMessage" value="${firstMessage}" />
            <Parameter name="voiceId" value="${agent.voiceId || "alloy"}" />
            <Parameter name="language" value="${language}" />
          </Stream>
        </Connect>
      </Response>`;

    console.log("Generated prompt:", prompt);
    console.log("Generated first message:", firstMessage);

    return new NextResponse(twimlResponse, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error generating TwiML:", error);
    return NextResponse.json(
      {
        error: "Failed to generate TwiML",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET(request: Request) {
  return generateTwimlResponse(request);
}

// Handle POST requests
export async function POST(request: Request) {
  return generateTwimlResponse(request);
}
