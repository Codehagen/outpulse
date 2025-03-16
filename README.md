<a href="https://github.com/Outpulse/outpulse">
  <!-- <img alt="Outpulse" src="public/og.png"> -->
  <h1 align="center">Outpulse</h1>
</a>

<p align="center">
  Transform your outbound calling with intelligent AI agents
</p>


<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack--features"><strong>Tech Stack + Features</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
<br/>

## Introduction

Welcome to Outpulse, where we're revolutionizing outbound calling with AI. Our platform enables businesses to create, configure, and deploy personalized AI calling agents without technical expertise. Whether you're in sales, customer service, or market research, Outpulse provides the tools you need to scale your outreach efficiently and effectively.

Key features of Outpulse include:
- AI agent creation with intuitive visual builders
- Advanced conversation flow configuration
- Campaign management and scheduling
- Integration with CRMs and business tools
- Detailed analytics and call performance tracking
- Custom tool creation for specialized workflows

With Outpulse, you can transform your outbound communication strategy, qualify leads at scale, and deliver consistent messaging across all customer touchpoints.

## Directory Structure

Outpulse follows a monorepo structure with multiple applications:

```
.
├── apps/                      # Application workspace
│   ├── www/                   # Next.js application (main web frontend)
│   │   ├── src/               # Source code for the Next.js app
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React components
│   │   │   ├── actions/       # Server actions
│   │   │   ├── lib/           # Utility functions and shared code
│   │   │   └── [...]          # Other source folders
│   │   ├── public/            # Static assets
│   │   └── prisma/            # Database schema and migrations
│   └── api/                   # Hono API (REST API service for SDK)
├── packages/                  # Shared packages (empty for now, will be used later)
├── tooling/                   # Shared configuration
│   └── tailwind/              # Tailwind configuration
├── .env                       # Shared environment variables
└── .env.local                 # Local development overrides
```

## Installation

Clone & create this repo locally with the following command:

```bash
git clone https://github.com/Outpulse/outpulse
```

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables.

```sh
cp .env.example .env.local
```

3. Input everything you need for the env:

   1. Create [Neon Database](https://neon.tech/) Account for serverless Postgres
   2. Create [ElevenLabs](https://elevenlabs.io/) Account for voice synthesis
   3. Setup [Better Auth](https://betterauth.com/) for authentication
   4. Create [Resend](https://resend.com/) Account for email notifications
   5. Setup [Stripe](https://stripe.com) for payment processing

4. Start the development server:

```sh
pnpm dev
```

## Deployment

The monorepo is set up for easy deployment to Vercel:

### Vercel Deployment Configuration

1. Connect your GitHub repository to Vercel.

2. Configure the following project settings in Vercel:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/www`
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`
   - **Node.js Version**: 18.x or higher

3. Add the required environment variables in the Vercel project settings:
   - Copy all variables from your `.env` file
   - Make sure to include `DATABASE_URL` and `DIRECT_URL` for Prisma
   - Add any service API keys (Supabase, ElevenLabs, etc.)

4. Deploy!

### Alternative: Using vercel.json

You can also include a `vercel.json` file in your repository:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "pnpm install",
  "outputDirectory": ".next"
}
```

> **Important**: If you use `vercel.json`, make sure your Vercel project settings still point to the correct root directory (`apps/www`).

### Database Setup

Before the first deployment, you need to set up your database:

1. Create a database in Neon, Railway, or your preferred provider
2. Add the connection string as `DATABASE_URL` in your Vercel environment variables
3. Prisma will automatically run migrations on the first deployment

## Authentication Setup

This project uses [Better Auth](https://better-auth.dev/) for authentication. Follow these steps to set up authentication in your development environment:

### Environment Variables

In your `.env` or `.env.local` file, fill in the following authentication variables:

- `BETTER_AUTH_SECRET`: Generate a secure random string (run `openssl rand -base64 32`)
- `BETTER_AUTH_URL`: Set to your application URL (e.g., `http://localhost:3000` for development)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: (Optional) If you want to enable Google login

### Database Tables

Authentication requires several tables in your database. Run the following commands to set up the database:

```bash
# Push the Prisma schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Authentication Routes

The following authentication routes are available:

- `/login` - Login page
- `/signup` - Signup page
- `/api/auth/*` - Authentication API endpoints

### User Roles

The application supports two user roles:

- **User**: Regular user with limited permissions
- **Admin**: User with administrative privileges

To promote a user to admin, update their role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Debugging Authentication

If you're having authentication issues:

1. Check browser console for errors
2. Inspect the "better-auth-session" cookie in your browser's developer tools
3. Verify database records in the `users`, `accounts`, and `sessions` tables

## Tech Stack + Features

### Core Framework

- [Next.js](https://nextjs.org/) – React framework with App Router for server components
- [TypeScript](https://www.typescriptlang.org/) – Static type checking for enhanced developer experience
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) – Beautifully designed components built with Radix UI and Tailwind CSS

### Data & Authentication

- [Neon](https://neon.tech/) – Serverless Postgres database with exceptional scalability
- [Prisma](https://www.prisma.io/) – Type-safe ORM for database access
- [Better Auth](https://betterauth.com/) – Secure, flexible authentication system

### AI & Voice Technologies

- [ElevenLabs](https://elevenlabs.io/) – Advanced voice synthesis for lifelike AI agent voices
- [OpenAI](https://openai.com/) – Language models for conversation intelligence
- [Twilio](https://www.twilio.com/) – Telephony infrastructure for handling calls

### Additional Services

- [Resend](https://resend.com/) – Email delivery for notifications and alerts
- [Stripe](https://stripe.com) – Payment processing and subscription management
- [Vercel](https://vercel.com/) – Deployment platform with exceptional performance

## Contributing

We love our contributors! Here's how you can contribute:

- [Open an issue](https://github.com/codehagen/outpulse/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/codehage/outpulse/pull) to add new features/make quality-of-life improvements/fix bugs.

<a href="https://github.com/codehagen/outpulse/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=codehagen/outpulse" />
</a>

## Repo Activity

![Outpulse repo activity – generated by Axiom](https://repobeats.axiom.co/api/embed/dc82e8d6fbe397c44e8ee078bfde91be418cc3f3.svg "Repobeats analytics image")



