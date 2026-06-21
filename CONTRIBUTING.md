# 🤝 Contributing to Neurosync

First off, thank you for considering contributing to Neurosync! It's people like you that make this project a great tool for productivity and AI automation.

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/neurosync.git
cd neurosync
```

### 2. Install dependencies
We use `pnpm` for package management to ensure fast, reliable builds.
```bash
pnpm install
```

### 3. Set up Environment Variables
Copy the example environment file and fill in your keys.
```bash
cp .env.example .env
```
You will need API keys for Clerk, OpenAI, and a PostgreSQL database URL. For Corsair, you must define a `CORSAIR_KEK` (a strong base64-encoded string).

### 4. Database Setup
Push the schema to your local PostgreSQL database using Drizzle ORM.
```bash
pnpm db:push
```

### 5. Run the Development Server
```bash
pnpm dev
```
The app should now be running on `http://localhost:3000`.

---

## 🛠️ Pull Request Process

1. **Linting & Types**: Ensure your code passes all TypeScript compiler checks (`pnpm typecheck`) and ESLint checks (`pnpm lint`).
2. **Styling**: We strictly use Tailwind CSS for styling. Avoid writing custom CSS unless absolutely necessary.
3. **Documentation**: If you are adding a new feature or changing data flows, please update the `README.md` or `ARCHITECTURE.md` accordingly.
4. **Testing**: Test your changes locally to ensure no existing functionality breaks—especially the tRPC routers, Corsair webhook syncing, and AI agent logic.
5. **Submission**: Submit a PR against the `main` branch with a clear, descriptive title and a summary of the changes.

---

## 📜 Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Please be respectful, inclusive, and constructive in issues and pull requests.
