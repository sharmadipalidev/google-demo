# 🛡️ Security Policy

## Supported Versions

Only the latest version of Neurosync is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within Neurosync, please report it immediately to our security team via email. **Do not use the public GitHub issue tracker for security-related issues.**

We take security seriously. We will acknowledge your report within 24 hours and provide a timeline for a fix and responsible disclosure.

## 🔒 Important Security Architecture Notes

Neurosync handles sensitive user data (Emails, Calendars), so strict security practices are enforced throughout the stack:

1. **Authentication (Clerk)**: All user sessions, JWT minting, and multi-factor authentication are delegated to Clerk. Do not attempt to bypass Clerk's middleware checks.
2. **Environment Variables**: Never commit `.env` files. Ensure `CORSAIR_KEK`, `OPENAI_API_KEY`, and `CLERK_SECRET_KEY` are kept strictly confidential. 
3. **OAuth Tokens (Corsair)**: We utilize Corsair to handle OAuth token rotation and encryption. Third-party API tokens (Google) are heavily encrypted at rest in the database using AES-256-GCM via the `CORSAIR_KEK` (Key Encryption Key).
4. **Database Access**: The Drizzle-managed PostgreSQL database must be configured with strict role-based access controls (RBAC) in production environments to prevent unauthorized data access.
5. **AI Safety**: The Vercel AI SDK interacts with OpenAI. Ensure that context windows do not inadvertently expose other tenants' data. The backend explicitly scopes all Corsair interactions to the current authenticated `tenantId`.
