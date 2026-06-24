#  Neurosync AI Workspace

> Your personal AI operator, seamlessly integrated into your daily workflow.

[![Website](https://img.shields.io/badge/Website-theneurosync.in-blue?style=flat-square)](https://theneurosync.in)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Neurosync is a next-generation AI-powered workspace that acts as your personal operational assistant. It deeply integrates into your daily workflow to manage your Gmail, schedule Google Calendar events, and automate busywork using a conversational AI agent. Built on the modern T3 Stack, it securely connects to Google APIs via **Corsair**.

---

##  Key Features

- **AI-Powered Inbox Management**: Chat with an intelligent AI agent that can summarize complex email threads, draft thoughtful replies, and instantly organize your inbox.
- **Automated Scheduling**: Ask the agent to schedule Google Calendar events, check your availability, and set up meetings directly from your chat interface.
- **Seamless Google Integration**: Native, secure integrations with Gmail and Google Calendar powered by the robust `@corsair-dev` plugin ecosystem.
- **Better Auth Integration**: Secure passwordless authentication via Better Auth with Google social login provider.
- **Billing & Payments**: Integrated premium subscription flow with Razorpay, allowing users to upgrade to plans such as Starter (Free), Pro (₹199/month), and Enterprise (Custom).
- **Modern Dashboard Aesthetic**: Premium, glassmorphism UI with smooth micro-animations built using Tailwind CSS and Framer Motion for a stunning user experience.

---

## Application Architecture & Flow

1. **Authentication**: Users sign up or log in securely using **Better Auth** with Google OAuth login.
2. **Onboarding**: New users are automatically redirected to `/onboarding` to connect their Gmail or Google Calendar accounts.
3. **Corsair Integration**: The connection redirects to `/api/connect`, which uses **Corsair** to securely manage OAuth tokens. A tenant is automatically created for the user.
4. **Data Sync & Webhooks**: Corsair manages the webhooks and pushes real-time events (like incoming emails) directly into the **Drizzle**-managed PostgreSQL database.
5. **AI Processing**: When interacting with the Assistant Panel, requests are routed via **tRPC** to the Vercel AI SDK backend (`src/server/agent.ts`), which calls Corsair endpoints to fetch emails, read calendars, or send drafts.
6. **Payment Flow**: Premium subscriptions are upgraded via **Razorpay**, creating secure orders and verifying signatures on the backend (`/api/create-order` and `/api/verify-payment`).

---

##  File Structure

```text
google-demo/
├── .env                     # Environment variables configuration
├── .env.example             # Example environment variables template
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.js           # Next.js configuration
├── public/                  # Static assets (images, logos, favicon)
└── src/
    ├── app/                 # Next.js App Router
    │   ├── api/             # API Routes
    │   │   ├── auth/        # Better Auth catch-all route ([...all])
    │   │   ├── connect/     # Corsair integration OAuth routes
    │   │   ├── create-order/# Razorpay payment order creation route
    │   │   ├── verify-payment/ # Razorpay signature verification route
    │   │   ├── trpc/        # tRPC Router handler
    │   │   └── webhooks/    # Webhook handlers (e.g., Corsair incoming events)
    │   ├── docs/            # API reference and documentation
    │   ├── gmail/           # User dashboard for Gmail & Assistant integration
    │   ├── onboarding/      # Workspace connection setup onboarding
    │   ├── _components/     # Page-specific components (e.g., gmail-dashboard, assistant-panel)
    │   ├── layout.tsx       # Next.js app root layout
    │   └── page.tsx         # Home landing page with Hero, Features, Pricing
    ├── components/          # Reusable UI components
    │   ├── ui/              # Shadcn primitive components (button, select, popover, calendar, etc.)
    │   ├── Hero.tsx         # Product hero section
    │   ├── Features.tsx     # Feature showcasing component
    │   ├── Pricing.tsx      # Razorpay payment & pricing tier card component
    │   ├── Navbar.tsx       # Header navigation with Better Auth sign-in triggers
    │   └── ...              # Other layout/aesthetic components
    ├── lib/                 # Core utilities
    │   ├── auth.ts          # Better Auth backend server configurations
    │   └── auth-client.ts   # Better Auth client hooks
    ├── server/              # Backend server logic
    │   ├── api/             # tRPC router declarations and procedures
    │   ├── db/              # Drizzle ORM database client & table schemas
    │   ├── agent.ts         # AI Agent logic and capabilities (Vercel AI SDK)
    │   └── corsair.ts       # Corsair SDK initialization
    ├── styles/              # Global stylesheet with Tailwind CSS rules
    └── trpc/                # React-Query / tRPC configuration
```

---

##  Database Diagram

Neurosync uses a robust PostgreSQL database managed by **Drizzle ORM**. The schema is split between Corsair's integration/account state tables and Better Auth's user/session tables.

```mermaid
erDiagram
    user ||--o{ session : "has"
    user ||--o{ account : "links"
    user ||--o{ corsairAccounts : "associates (tenantId)"
    corsairIntegrations ||--o{ corsairAccounts : "has"
    corsairAccounts ||--o{ corsairEntities : "owns"
    corsairAccounts ||--o{ corsairEvents : "generates"

    user {
        text id PK
        text name
        text email
        boolean emailVerified
        text image
        user_role role
        timestamp createdAt
        timestamp updatedAt
    }

    session {
        text id PK
        timestamp expiresAt
        text token
        timestamp createdAt
        timestamp updatedAt
        text ipAddress
        text userAgent
        text userId FK
    }

    account {
        text id PK
        text accountId
        text providerId
        text userId FK
        text accessToken
        text refreshToken
        text idToken
        timestamp accessTokenExpiresAt
        timestamp refreshTokenExpiresAt
        text scope
        text password
        timestamp createdAt
        timestamp updatedAt
    }

    verification {
        text id PK
        text identifier
        text value
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }

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
        text tenantId FK
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
- **Styling**: Tailwind CSS v4 & Framer Motion
- **Authentication**: Better Auth (with Google OAuth)
- **Payments & Billing**: Razorpay
- **Database**: PostgreSQL with Drizzle ORM
- **API & RPC**: tRPC (Type-safe APIs)
- **AI Engine**: Vercel AI SDK, OpenAI
- **Integrations Framework**: Corsair

---

##  Getting Started

### 1. Environment Variables

Create a `.env` file based on `.env.example` and populate it with the required keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname"

# Better Auth (Authentication)
BETTER_AUTH_SECRET="a-secure-32-character-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Corsair Encryption Key
CORSAIR_KEK="base64-encoded-secret-key"

# OpenAI for AI Agent (Optional)
OPENAI_API_KEY="sk-..."

# Razorpay (Payments & Subscriptions - Optional)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

### 2. Install Dependencies

Using `pnpm` (configured in packageManager):

```bash
pnpm install
```

### 3. Database Setup

Push the schema structure to your PostgreSQL database:

```bash
pnpm db:push
```

To inspect or interact with your database tables locally:

```bash
pnpm db:studio
```

### 4. Running the Project

To run only the frontend dev server:

```bash
pnpm dev
```

To boot up the complete workspace environment, including the local database setup, Drizzle studio, and a local ngrok tunnel (for handling incoming webhooks):

```bash
pnpm dev:all
```

The application is reachable at `http://localhost:3000`.
