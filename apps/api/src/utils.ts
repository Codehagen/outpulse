import fs from "fs";
import path from "path";
import { z } from "zod";

// Schema for validating WebSocket parameters
export const StreamParamsSchema = z.object({
  agentId: z.string().min(1),
  elevenLabsAgentId: z.string().min(1),
  prompt: z.string().optional(),
  firstMessage: z.string().optional(),
  voiceId: z.string().optional().default("alloy"),
  language: z.string().optional().default("en"),
});

export type StreamParams = z.infer<typeof StreamParamsSchema>;

// Save audio to file for debugging (useful in development)
export function saveAudioToFile(buffer: Buffer, filename: string): string {
  // Only save files in development mode
  if (process.env.NODE_ENV !== "development") {
    return "";
  }

  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error("Error saving audio file:", error);
    return "";
  }
}

// Helper to convert Twilio Mulaw format to signed 16-bit PCM format (required by ElevenLabs)
export function mulaw2linear(mulawData: Buffer): Buffer {
  const MULAW_BIAS = 33;
  const MULAW_QUANTIZATION_MASK = 0x0f;
  const SIGN_BIT = 0x80;

  const linearData = Buffer.alloc(mulawData.length * 2);

  for (let i = 0; i < mulawData.length; i++) {
    // Get the mulaw value and flip all bits (according to Twilio's format)
    let mulaw = ~mulawData[i] & 0xff;

    // Extract the sign bit
    const sign = mulaw & SIGN_BIT ? -1 : 1;

    // Remove the sign bit
    mulaw &= ~SIGN_BIT;

    // Get the segment number and quantization value
    let segment = (mulaw & 0x70) >> 4;
    let quantized = mulaw & MULAW_QUANTIZATION_MASK;

    // Inverse quantization - convert to 16-bit linear PCM
    let sample =
      (quantized << (segment + 3)) + ((1 << (segment + 3)) - 1) - MULAW_BIAS;
    sample = sign * sample;

    // Clamp to 16-bit signed range
    sample = Math.min(Math.max(sample, -32768), 32767);

    // Write the sample to the output buffer (little-endian 16-bit)
    linearData.writeInt16LE(sample, i * 2);
  }

  return linearData;
}

// Create a debug log message
export function createDebugLog(req: Request): Record<string, any> {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    url: req.url,
    method: req.method,
    headers,
    timestamp: new Date().toISOString(),
  };
}
