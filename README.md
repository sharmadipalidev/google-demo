# Neurosync AI Workspace

Neurosync is an AI-powered workspace that acts as your personal AI operator. It deeply integrates into your workflow to manage your Gmail, schedule Google Meet events, and automate busywork using a conversational AI agent. Built on the modern T3 Stack, it securely connects to Google APIs via Corsair.

##URL Of Website:- https://theneurosync.in/
---

##  Key Features

1. **AI-Powered Inbox Management**: Chat with an AI agent that can summarize email threads, draft replies, and organize your inbox.
2. **Automated Scheduling**: Ask the agent to schedule Google Calendar events directly from your chat.
3. **Seamless Google Integration**: Native integrations with Gmail and Google Calendar powered by the `@corsair-dev` plugin ecosystem.
4. **Custom Onboarding Flow**: Secure OAuth 2.0 connection flows for users to link their Google Workspace securely.
5. **Modern Dashboard Aesthetic**: Premium, glassmorphism UI with smooth animations built using Tailwind CSS and Framer Motion.

---

## Application Architecture & Flow

1. **Authentication**: Users sign up or log in using **Clerk**.
2. **Onboarding**: New users are automatically redirected to `/onboarding` where they connect their Gmail or Google Calendar.
3. **Corsair Integration**: The connection redirects to `/api/connect`, which uses **Corsair** to securely manage OAuth tokens. A tenant is automatically created for the user.
4. **Data Sync & Webhooks**: Corsair manages the webhooks and pushes events (like new emails) into the Drizzle-managed PostgreSQL database.
5. **AI Processing**: When interacting with the Assistant Panel, requests are routed via **tRPC** to the Vercel AI SDK backend (`src/server/agent.ts`), which calls Corsair endpoints to fetch emails, read calendars, or send drafts.

---

##  File Structure

```text
google-demo/
├── .env                 # Environment variables
├── package.json         # Project dependencies and scripts
├── tailwind.config.ts   # Tailwind CSS styling configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── next.config.js       # Next.js configuration
├── public/              # Static assets (images, logos)
└── src/
    ├── app/             # Next.js App Router
    │   ├── api/         # API Routes (OAuth callbacks, webhooks, tRPC)
    │   ├── gmail/       # Gmail Dashboard interface
    │   ├── onboarding/  # User onboarding & account connection flow
    │   ├── _components/ # Page-specific components (e.g., assistant panel)
    │   ├── layout.tsx   # Root layout (Clerk Auth, tRPC Providers)
    │   └── page.tsx     # Landing Page
    ├── components/      # Reusable UI Components (Hero, Navbar, Features, Footer)
    ├── server/          # Backend Logic
    │   ├── api/         # tRPC Routers (Gmail endpoints, Agent endpoints)
    │   ├── db/          # Database connection and Drizzle schema
    │   ├── agent.ts     # AI Agent logic (Vercel AI SDK)
    │   └── corsair.ts   # Corsair configuration (Google integrations)
    ├── styles/          # Global CSS styles
    └── trpc/            # tRPC setup (Client and React query wrappers)
```

---

##  Database Diagram

Neurosync uses a PostgreSQL database managed by Drizzle ORM. The core tables handle Corsair's OAuth integration accounts, synchronized entities (emails, calendars), and webhook events.

```mermaid
erDiagram
    corsairIntegrations ||--o{ corsairAccounts : "has"
    corsairAccounts ||--o{ corsairEntities : "owns"
    corsairAccounts ||--o{ corsairEvents : "generates"

    corsairIntegrations {
        text id PK
        timestamp createdAt
        timestamp updatedAt
        text name
        jsonb config
        text dek
    }

    corsairAccounts {
        text id PK
        timestamp createdAt
        timestamp updatedAt
        text tenantId
        text integrationId FK
        jsonb config
        text dek
    }

    corsairEntities {
        text id PK
        timestamp createdAt
        timestamp updatedAt
        text accountId FK
        text entityId
        text entityType
        text version
        jsonb data
    }

    corsairEvents {
        text id PK
        timestamp createdAt
        timestamp updatedAt
        text accountId FK
        text eventType
        jsonb payload
        text status
    }
```

---

##  Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **API & RPC**: tRPC (Type-safe APIs)
- **AI Engine**: Vercel AI SDK, OpenAI
- **Integrations Framework**: Corsair

---

##  Getting Started

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname"

# Corsair Encryption Key
CORSAIR_KEK="base64-encoded-secret-key"

# OpenAI for AI Agent
OPENAI_API_KEY="sk-..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLEARK_WEBHOOKS_KEY="whsec_..."

# Application URLs
APP_URL="http://localhost:3000"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/onboarding"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/gmail"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

Push the Drizzle schema to your PostgreSQL database:

```bash
pnpm db:push
```

You can view the data using Drizzle Studio:

```bash
pnpm db:studio
```

### 4. Run the Development Server

Start the application with Turbo enabled:

```bash
pnpm dev
```

The app will be accessible at `http://localhost:3000`.
