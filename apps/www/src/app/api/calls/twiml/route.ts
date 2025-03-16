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

    // Add the remaining parameters
    twimlResponse += `
            <Parameter name="prompt" value="${agent.description || ""}" />
            <Parameter name="firstMessage" value="${
              agent.speakingStyle || ""
            }" />
            <Parameter name="voiceId" value="${agent.voiceId || "alloy"}" />
            <Parameter name="language" value="${language}" />
          </Stream>
        </Connect>
      </Response>`;

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
