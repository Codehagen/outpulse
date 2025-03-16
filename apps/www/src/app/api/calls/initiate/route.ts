import { NextResponse } from "next/server";
import { getSession } from "@/actions/users/get-session";
import { prisma } from "utils/db";
import twilio from "twilio";

// Twilio requires a fully qualified URL that's accessible from the internet
// For local development, set this environment variable to your ngrok URL
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL;

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

    // Get user's Twilio credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
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

    // Generate TwiML URL
    // Use the PUBLIC_BASE_URL environment variable if available, otherwise use the host from the request
    let baseUrl;
    if (PUBLIC_BASE_URL) {
      baseUrl = PUBLIC_BASE_URL;
    } else {
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      baseUrl = `${protocol}://${host}`;
    }

    const twimlUrl = `${baseUrl}/api/calls/twiml?agentId=${agentId}`;

    console.log(`Using TwiML URL: ${twimlUrl}`);

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
