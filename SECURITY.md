# Security Policy

## Supported Versions

Only the latest version of Neurosync is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Neurosync, please report it immediately via email. Do not use the public issue tracker for security-related issues.

We will acknowledge your report within 24 hours and provide a timeline for a fix.

## Important Security Notes

- **Environment Variables**: Never commit `.env` files. Ensure `CORSAIR_KEK`, `OPENAI_API_KEY`, and `CLERK_SECRET_KEY` are kept strictly confidential.
- **OAuth Tokens**: We utilize Corsair to handle OAuth token rotation and encryption. Tokens are encrypted at rest using the Master Key.
- **Database Access**: We recommend using strict role-based access controls for your PostgreSQL database in production.
