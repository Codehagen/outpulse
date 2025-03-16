import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

// Hardcoded agent ID for testing
const ELEVENLABS_AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "KR70lfUkcaRuF0TTVPnq";

async function getSignedUrl(agentId: string, apiKey: string): Promise<string> {
  try {
    const requestHeaders = new Headers();
    requestHeaders.set("xi-api-key", apiKey);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.signed_url;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  console.log(`[WebSocket] Stream handler called with method: GET`);

  // Handle ping requests for testing connectivity
  const url = new URL(req.url);
  if (url.searchParams.get("ping") === "true") {
    return new Response("pong", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Check for WebSocket upgrade
  const upgradeHeader = req.headers.get("upgrade");
  console.log(`[WebSocket] Upgrade header: ${upgradeHeader}`);

  // Log all request headers for debugging
  console.log("[WebSocket] Request headers:");
  req.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });

  if (upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  try {
    console.log(
      `[WebSocket] Attempting to handle WebSocket connection for ElevenLabs agent ID: ${ELEVENLABS_AGENT_ID}`
    );

    // Note: This is a simplified implementation
    // Next.js Edge Runtime's WebSocket support is limited
    // For production, consider using a standalone WebSocket server

    console.log("[WebSocket] Creating WebSocket response");

    // For our testing purposes, we'll just return a 101 Switching Protocols response
    // which indicates WebSocket protocol switch, but the actual WebSocket handling is limited
    return new Response(null, {
      status: 101,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Accept": "optional-but-helps-with-compatibility",
        "X-Debug-Info": "NextJS-Edge-WebSocket-Limited",
      },
    });
  } catch (error) {
    console.error("[WebSocket] Error handling WebSocket:", error);
    return new Response(
      `WebSocket Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { status: 500 }
    );
  }
}
