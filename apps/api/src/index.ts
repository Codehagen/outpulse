import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import type { IncomingMessage } from "http";
import type { Socket } from "net";
import { StreamParamsSchema } from "./utils";

// Load environment variables
dotenv.config();

// Environment variables with fallbacks
const { ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, PORT = "8000" } = process.env;

// Initialize Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Helper function to get signed URL for authenticated conversations
async function getSignedUrl(apiKey: string, agentId: string): Promise<string> {
  try {
    const headers = new Headers();
    headers.append("xi-api-key", apiKey);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = (await response.json()) as { signed_url: string };
    return data.signed_url;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

// Root route for health check
app.get("/", (c) => {
  return c.json({ message: "WebSocket Server is running" });
});

// Add debug endpoint to check connectivity
app.get("/debug", (c) => {
  // Get all headers as entries
  const headers: Record<string, string> = {};
  for (const [key, value] of c.req.raw.headers.entries()) {
    headers[key] = value;
  }

  return c.json({
    status: "ok",
    message: "Debug endpoint reached successfully",
    timestamp: new Date().toISOString(),
    headers,
  });
});

// TwiML route for outbound calls
app.all("/outbound-call", async (c) => {
  const url = new URL(c.req.url);

  // Get parameters from URL
  const agentId = url.searchParams.get("agentId");
  const elevenLabsApiKey =
    url.searchParams.get("elevenLabsApiKey") || ELEVENLABS_API_KEY;
  const elevenLabsAgentId =
    url.searchParams.get("elevenLabsAgentId") || ELEVENLABS_AGENT_ID;

  // Validate that required parameters exist
  if (!agentId) {
    return c.json({ error: "Agent ID is required" }, 400);
  }

  if (!elevenLabsApiKey) {
    return c.json({ error: "ElevenLabs API key is required" }, 400);
  }

  if (!elevenLabsAgentId) {
    return c.json({ error: "ElevenLabs Agent ID is required" }, 400);
  }

  // More parameters from the URL
  const prompt = url.searchParams.get("prompt") || "";
  const firstMessage = url.searchParams.get("firstMessage") || "";
  const voiceId = url.searchParams.get("voiceId") || "alloy";
  const language = url.searchParams.get("language") || "en";

  const host = c.req.header("host") || "localhost:8000";

  // Use WSS for production, WS for localhost
  const protocol = host.includes("localhost") ? "ws" : "wss";
  const streamUrl = `${protocol}://${host}/outbound-media-stream`;

  console.log(`[Twilio] Generating TwiML with Stream URL: ${streamUrl}`);
  console.log(`[Twilio] Using ElevenLabs Agent ID: ${elevenLabsAgentId}`);
  console.log(`[Twilio] Prompt: ${prompt.substring(0, 100)}...`);
  console.log(`[Twilio] First Message: ${firstMessage}`);

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="${streamUrl}">
            <Parameter name="agentId" value="${agentId}" />
            <Parameter name="elevenLabsAgentId" value="${elevenLabsAgentId}" />
            <Parameter name="elevenLabsApiKey" value="${elevenLabsApiKey}" />
            <Parameter name="prompt" value="${prompt}" />
            <Parameter name="firstMessage" value="${firstMessage}" />
            <Parameter name="voiceId" value="${voiceId}" />
            <Parameter name="language" value="${language}" />
          </Stream>
        </Connect>
      </Response>`;

  return c.text(twimlResponse, 200, {
    "Content-Type": "text/xml",
  });
});

// Define interface for custom parameters
interface CustomParameters {
  agentId?: string;
  elevenLabsAgentId?: string;
  elevenLabsApiKey?: string;
  prompt?: string;
  firstMessage?: string;
  voiceId?: string;
  language?: string;
}

// Setup WebSocket server for Twilio media streams
const wss = new WebSocketServer({
  noServer: true,
  clientTracking: true,
  verifyClient: () => true,
  perMessageDeflate: false,
});

console.log(
  "[Server] WebSocket server initialized, waiting for connections..."
);

// Add a WebSocket heartbeat to keep connections alive
setInterval(() => {
  console.log(`[WebSocket] Active connections: ${wss.clients.size}`);
  wss.clients.forEach((ws) => {
    if ((ws as any).isAlive === false) {
      console.log("[WebSocket] Terminating inactive connection");
      return ws.terminate();
    }

    (ws as any).isAlive = false;
    try {
      ws.ping();
    } catch (error) {
      console.error("[WebSocket] Error sending ping:", error);
    }
  });
}, 30000); // Check every 30 seconds

wss.on(
  "connection",
  (ws: WebSocket, req: IncomingMessage, customParameters: CustomParameters) => {
    console.info("[Server] Twilio connected to outbound media stream");

    // Setup connection tracking
    (ws as any).isAlive = true;
    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });

    // Variables to track the call
    let streamSid: string | null = null;
    let callSid: string | null = null;
    let elevenLabsWs: WebSocket | null = null;

    // Handle WebSocket errors
    ws.on("error", (err) => {
      console.error("[WebSocket] Error:", err);
    });

    // Set up ElevenLabs connection
    const setupElevenLabs = async (params: CustomParameters) => {
      try {
        // Validate parameters
        const validationResult = StreamParamsSchema.safeParse(params);

        if (!validationResult.success) {
          console.error(
            "[ElevenLabs] Invalid parameters:",
            validationResult.error
          );
          return;
        }

        // Use custom values or fallbacks
        const elevenLabsApiKey = params.elevenLabsApiKey || ELEVENLABS_API_KEY;
        const agentId = params.elevenLabsAgentId || ELEVENLABS_AGENT_ID;

        if (!elevenLabsApiKey) {
          console.error("[ElevenLabs] Missing API key");
          return;
        }

        if (!agentId) {
          console.error("[ElevenLabs] Missing agent ID");
          return;
        }

        console.log(`[ElevenLabs] Using agent ID: ${agentId}`);

        // Get a signed URL using the provided API key
        const signedUrl = await getSignedUrl(
          elevenLabsApiKey as string,
          agentId as string
        );

        console.log(`[ElevenLabs] Using signed URL: ${signedUrl}`);
        console.log(
          `[ElevenLabs] Important: Make sure your agent is configured to use μ-law 8000 Hz audio format for both input and output`
        );

        elevenLabsWs = new WebSocket(signedUrl);

        elevenLabsWs.on("open", () => {
          console.log("[ElevenLabs] Connected to Conversational AI");

          // Send initial configuration with prompt and first message
          // Get the prompt and first_message from the customParameters or use defaults
          const prompt =
            params.prompt ||
            `
            You are a professional sales representative. After greeting, always ask: 
            "I'm calling to discuss our new service that helps businesses like yours. 
            Do you have a few minutes to chat?"

            Listen carefully to their response:
            - If they show interest by saying yes or asking to learn more, say 
              "Great! Let me tell you about our service..." and use the 
              sendDiscordNotification tool to notify Discord about an interested prospect
            - If they say they're busy or not interested, respond with 
              "I understand you're busy. Would it be better if I sent you some 
              information by email?"

            Be polite, professional, friendly and approachable. Let the customer speak 
            and don't be pushy. Focus on understanding their needs and concerns.
          `;
          const firstMessage =
            params.firstMessage ||
            "Hello, this is Sam calling from Codebase. Am im talking with Chris?";

          console.log(
            `[ElevenLabs] Using prompt: ${prompt.substring(0, 100)}...`
          );
          console.log(`[ElevenLabs] Using first message: ${firstMessage}`);

          const initialConfig = {
            type: "conversation_initiation_client_data",
            conversation_config_override: {
              agent: {
                prompt: {
                  prompt: prompt,
                },
                first_message: firstMessage,
              },
            },
          };

          console.log(
            "[ElevenLabs] Sending initial config with prompt:",
            initialConfig.conversation_config_override.agent.prompt.prompt.substring(
              0,
              100
            ) + "..."
          );

          // Send the configuration to ElevenLabs
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            elevenLabsWs.send(JSON.stringify(initialConfig));
          }
        });

        elevenLabsWs.on("message", (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());

            switch (message.type) {
              case "conversation_initiation_metadata":
                console.log("[ElevenLabs] Received initiation metadata");
                break;

              case "audio":
                if (streamSid) {
                  if (message.audio?.chunk) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio.chunk,
                      },
                    };
                    ws.send(JSON.stringify(audioData));
                  } else if (message.audio_event?.audio_base_64) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio_event.audio_base_64,
                      },
                    };
                    ws.send(JSON.stringify(audioData));
                  }
                } else {
                  console.log(
                    "[ElevenLabs] Received audio but no StreamSid yet"
                  );
                }
                break;

              case "interruption":
                if (streamSid) {
                  ws.send(
                    JSON.stringify({
                      event: "clear",
                      streamSid,
                    })
                  );
                }
                break;

              case "ping":
                if (
                  message.ping_event?.event_id &&
                  elevenLabsWs &&
                  elevenLabsWs.readyState === WebSocket.OPEN
                ) {
                  elevenLabsWs.send(
                    JSON.stringify({
                      type: "pong",
                      event_id: message.ping_event.event_id,
                    })
                  );
                }
                break;

              case "agent_response":
                console.log(
                  `[Twilio] Agent response: ${message.agent_response_event?.agent_response}`
                );
                break;

              case "user_transcript":
                console.log(
                  `[Twilio] User transcript: ${message.user_transcription_event?.user_transcript}`
                );
                break;

              default:
                console.log(
                  `[ElevenLabs] Unhandled message type: ${message.type}`
                );
            }
          } catch (error) {
            console.error("[ElevenLabs] Error processing message:", error);
          }
        });

        elevenLabsWs.on("error", (error) => {
          console.error("[ElevenLabs] WebSocket error:", error);
        });

        elevenLabsWs.on("close", () => {
          console.log("[ElevenLabs] Disconnected");
        });
      } catch (error) {
        console.error("[ElevenLabs] Setup error:", error);
      }
    };

    // Handle messages from Twilio
    ws.on("message", (message: WebSocket.Data) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.event !== "media") {
          console.log(`[Twilio] Received event: ${msg.event}`);
        }

        switch (msg.event) {
          case "start":
            streamSid = msg.start.streamSid;
            callSid = msg.start.callSid;
            const params = msg.start.customParameters;
            console.log(
              `[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}`
            );
            console.log("[Twilio] Start parameters:", params);

            // Only setup ElevenLabs after we get the stream started event with parameters
            setupElevenLabs(params);
            break;

          case "media":
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              const audioMessage = {
                user_audio_chunk: Buffer.from(
                  msg.media.payload,
                  "base64"
                ).toString("base64"),
              };
              elevenLabsWs.send(JSON.stringify(audioMessage));
            }
            break;

          case "stop":
            console.log(`[Twilio] Stream ${streamSid} ended`);
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              elevenLabsWs.close();
            }
            break;

          default:
            console.log(`[Twilio] Unhandled event: ${msg.event}`);
        }
      } catch (error) {
        console.error("[Twilio] Error processing message:", error);
      }
    });

    // Handle WebSocket closure
    ws.on("close", () => {
      console.log("[Twilio] Client disconnected");
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close();
      }
    });
  }
);

// Create server and handle WebSocket upgrades
const server = serve(
  {
    fetch: app.fetch,
    port: parseInt(PORT, 10),
  },
  (info) => {
    console.log(`[Server] Listening on port ${info.port}`);
  }
);

// Handle WebSocket connections
server.addListener(
  "upgrade",
  (req: IncomingMessage, socket: Socket, head: Buffer) => {
    try {
      const pathname = new URL(req.url || "", `http://${req.headers.host}`)
        .pathname;

      console.log(`[WebSocket] Upgrade request for: ${pathname}`);

      // Log headers for debugging
      console.log(
        `[WebSocket] Request headers: ${JSON.stringify(req.headers)}`
      );

      if (pathname === "/outbound-media-stream") {
        console.log(
          `[WebSocket] Attempting to handle upgrade for: ${pathname}`
        );

        // Add error handling for upgrade
        try {
          wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
            console.log(
              `[WebSocket] Connection established for outbound-media-stream`
            );

            // Send a test message to confirm connection
            ws.send(
              JSON.stringify({
                event: "connected",
                message: "Connection established",
              })
            );

            // Pass parameters as an empty object - we'll get them from the start event
            wss.emit("connection", ws, req, {});
          });
        } catch (upgradeError) {
          console.error(`[WebSocket] Upgrade error: ${upgradeError}`);
          // Send a proper WebSocket close frame before destroying
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
          socket.destroy();
        }
      } else {
        console.log(
          `[WebSocket] Rejecting upgrade for unknown path: ${pathname}`
        );
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.destroy();
      }
    } catch (error) {
      console.error(`[WebSocket] Error handling upgrade: ${error}`);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  }
);
