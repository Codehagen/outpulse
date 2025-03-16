import { NextResponse } from "next/server";
import { getSession } from "@/actions/users/get-session";
import { prisma } from "utils/db";
import twilio from "twilio";

// Twilio requires a fully qualified URL that's accessible from the internet
// For local development, set this environment variable to your ngrok URL
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;

// WebSocket Server URL (our standalone server)
const WEBSOCKET_SERVER_URL =
  process.env.WEBSOCKET_SERVER_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    console.log("Initiating call request received");

    // Check authentication
    const session = await getSession();
    if (!session) {
      console.log("Unauthorized: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.userId;
    console.log(`Authenticated user: ${userId}`);

    // Get user's Twilio and ElevenLabs credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
        elevenLabsApiKey: true, // Also fetch ElevenLabs API key
      },
    });

    if (
      !user?.twilioAccountSid ||
      !user?.twilioAuthToken ||
      !user?.twilioPhoneNumber
    ) {
      console.log("Missing Twilio credentials");
      return NextResponse.json(
        { error: "Twilio credentials not configured" },
        { status: 400 }
      );
    }

    if (!user?.elevenLabsApiKey) {
      console.log("Missing ElevenLabs API key");
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phoneNumber, agentId } = body;
    console.log(`Initiate call to ${phoneNumber} using agent ${agentId}`);

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      console.log(`Agent ${agentId} not found`);
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Initialize Twilio client
    console.log(
      `Initializing Twilio client with SID ${user.twilioAccountSid.substring(
        0,
        6
      )}...`
    );
    const twilioClient = twilio(user.twilioAccountSid, user.twilioAuthToken);

    // Use the standalone API server for TwiML generation
    // The TwiML URL needs to be publicly accessible for Twilio to reach it
    let twimlUrl;
    try {
      const serverUrlObj = new URL(WEBSOCKET_SERVER_URL);

      // Include the ElevenLabs API key and agent ID as a query parameter
      // We'll encode it to make it URL safe
      const encodedApiKey = encodeURIComponent(user.elevenLabsApiKey);
      twimlUrl = `${serverUrlObj.origin}/outbound-call?agentId=${agentId}&elevenLabsApiKey=${encodedApiKey}`;

      console.log(`Using standalone API TwiML URL: ${twimlUrl}`);
    } catch (error) {
      console.error("Error parsing WebSocket server URL:", error);
      return NextResponse.json(
        { error: "Invalid WebSocket server URL configuration" },
        { status: 500 }
      );
    }

    // Initiate call
    const call = await twilioClient.calls.create({
      from: user.twilioPhoneNumber,
      to: phoneNumber,
      url: twimlUrl,
    });

    console.log(`Call initiated with SID: ${call.sid}`);

    return NextResponse.json({
      success: true,
      message: "Call initiated",
      callSid: call.sid,
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate call",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
