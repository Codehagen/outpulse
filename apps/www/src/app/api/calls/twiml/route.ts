import { NextResponse } from "next/server";
import { prisma } from "utils/db";

// Hardcoded agent ID for testing
const ELEVENLABS_AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "KR70lfUkcaRuF0TTVPnq";

// Twilio requires a fully qualified URL that's accessible from the internet
// For local development, set this environment variable to your ngrok URL
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;

// Optional external WebSocket server (Hono-based)
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL;

// Direct database access for agent data (no authentication required)
async function getAgentDirectly(id: string) {
  try {
    console.log(`Fetching agent ${id} directly from database`);
    const agent = await prisma.agent.findUnique({
      where: { id },
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

    // Get language from agent if it exists, otherwise default to 'en'
    const language = agent.language || "en";

    // Generate the WebSocket URL - prioritize the external WebSocket server if available
    let streamUrl;

    if (WEBSOCKET_SERVER_URL) {
      // Use the external WebSocket server
      // Convert from http to ws protocol
      streamUrl = `${WEBSOCKET_SERVER_URL.replace(/^http/, "ws").replace(
        /^https/,
        "wss"
      )}/outbound-media-stream`;
      console.log(`Using external WebSocket server: ${streamUrl}`);
    } else {
      // Use the built-in API route for WebSockets
      let baseUrl;
      if (PUBLIC_BASE_URL) {
        // Parse the public URL to get the hostname
        const publicUrl = new URL(PUBLIC_BASE_URL);
        baseUrl = `${publicUrl.protocol === "https:" ? "wss" : "ws"}://${
          publicUrl.host
        }`;
      } else {
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "ws" : "wss";
        baseUrl = `${protocol}://${host}`;
      }
      streamUrl = `${baseUrl}/api/calls/stream`;
      console.log(`Using built-in WebSocket route: ${streamUrl}`);
    }

    // Generate TwiML with agent data and ElevenLabs agent ID
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${streamUrl}">
            <Parameter name="agentId" value="${agentId}" />
            <Parameter name="elevenLabsAgentId" value="${ELEVENLABS_AGENT_ID}" />
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
