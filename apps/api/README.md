# WebSocket API Server

This is a standalone WebSocket server built with Hono.js that handles streaming audio between Twilio and ElevenLabs. It's designed to work with the Next.js application in the monorepo.

## Features

- WebSocket server for handling Twilio media streams
- TwiML generation for outbound calls
- Integration with ElevenLabs for voice generation

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=8000
   NODE_ENV=development
   ELEVENLABS_API_KEY=your_api_key
   ELEVENLABS_AGENT_ID=your_agent_id
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /` - Health check endpoint
- `GET /debug` - Debug information endpoint
- `GET /outbound-call` - Generate TwiML for outbound calls
- `WS /outbound-media-stream` - WebSocket endpoint for Twilio media streams

## Production Deployment

For production, build and start the server:

```
npm run build
npm start
```

## Environment Variables

- `PORT` - Port to run the server on (default: 8000)
- `NODE_ENV` - Environment (development/production)
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `ELEVENLABS_AGENT_ID` - Your ElevenLabs agent ID 