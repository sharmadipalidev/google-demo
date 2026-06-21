# Contributing to Neurosync

First off, thank you for considering contributing to Neurosync! It's people like you that make this project a great tool for productivity and AI automation.

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/neurosync.git
   cd neurosync
   ```

2. **Install dependencies:**
   We use `pnpm` for package management.
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy the example environment file and fill in your keys.
   ```bash
   cp .env.example .env
   ```
   You will need API keys for Clerk, OpenAI, and a PostgreSQL database URL.

4. **Database Setup:**
   Push the schema to your local database using Drizzle ORM.
   ```bash
   pnpm db:push
   ```

5. **Run the Development Server:**
   ```bash
   pnpm dev
   ```

## Pull Request Process

1. Ensure your code follows our existing styling conventions (Tailwind CSS) and passes TypeScript compiler checks.
2. If you are adding a new feature, please update the `README.md` or `ARCHITECTURE.md` accordingly.
3. Test your changes locally to ensure no existing functionality breaks (especially the tRPC routers and AI agent logic).
4. Submit a PR against the `main` branch with a clear description of the changes.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Please be respectful and constructive in issues and pull requests.
