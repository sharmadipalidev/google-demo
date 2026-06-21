# 🧠 Neurosync AI Workspace

> Your personal AI operator, seamlessly integrated into your daily workflow.

[![Website](https://img.shields.io/badge/Website-theneurosync.in-blue?style=flat-square)](https://theneurosync.in)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Neurosync is a next-generation AI-powered workspace that acts as your personal operational assistant. It deeply integrates into your daily workflow to manage your Gmail, schedule Google Calendar events, and automate busywork using a conversational AI agent. Built on the modern T3 Stack, it securely connects to Google APIs via **Corsair**.

---

## ✨ Key Features

- 🤖 **AI-Powered Inbox Management**: Chat with an intelligent AI agent that can summarize complex email threads, draft thoughtful replies, and instantly organize your inbox.
- 📅 **Automated Scheduling**: Ask the agent to schedule Google Calendar events, check your availability, and set up meetings directly from your chat.
- 🔗 **Seamless Google Integration**: Native, secure integrations with Gmail and Google Calendar powered by the robust `@corsair-dev` plugin ecosystem.
- 🔐 **Custom Onboarding Flow**: Fast and secure OAuth 2.0 connection flows for users to seamlessly link their Google Workspace.
- 🎨 **Modern Dashboard Aesthetic**: Premium, glassmorphism UI with smooth micro-animations built using Tailwind CSS and Framer Motion for a stunning user experience.

---

## 🏗 Application Architecture & Flow

1. **Authentication**: Users sign up or log in securely using **Clerk**.
2. **Onboarding**: New users are automatically redirected to `/onboarding` to effortlessly connect their Gmail or Google Calendar accounts.
3. **Corsair Integration**: The connection redirects to `/api/connect`, which uses **Corsair** to securely manage OAuth tokens. A tenant is automatically created for the user.
4. **Data Sync & Webhooks**: Corsair manages the webhooks and pushes real-time events (like incoming emails) directly into the **Drizzle**-managed PostgreSQL database.
5. **AI Processing**: When interacting with the Assistant Panel, requests are routed via **tRPC** to the Vercel AI SDK backend (`src/server/agent.ts`), which calls Corsair endpoints to fetch emails, read calendars, or send drafts.

---

## 📂 File Structure

```text
neurosync/
├── .env                 # Environment variables
├── package.json         # Project dependencies and scripts
├── tailwind.config.ts   # Tailwind CSS styling configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── next.config.js       # Next.js configuration
├── public/              # Static assets (images, logos, videos)
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

## 🗄 Database Diagram

Neurosync uses a robust PostgreSQL database managed by **Drizzle ORM**. The core tables handle Corsair's OAuth integration accounts, synchronized entities (emails, calendars), and real-time webhook events.

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

## 💻 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **API & RPC**: tRPC (Type-safe APIs)
- **AI Engine**: Vercel AI SDK, OpenAI
- **Integrations Framework**: Corsair

---

## 🚀 Getting Started

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


