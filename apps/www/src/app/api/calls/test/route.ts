import { NextResponse } from "next/server";

// This endpoint is for testing Twilio connectivity
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  const info = {
    message: "Twilio test endpoint is working",
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(searchParams.entries()),
  };

  // Return XML for testing TwiML
  if (format === "xml") {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This is a test response from the Twilio test endpoint.</Say>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }

  // Default to JSON
  return NextResponse.json(info);
}

// Handle POST requests as well (Twilio might use POST)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const info = {
      message: "Twilio test endpoint is working",
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
      body,
    };

    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error processing request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
