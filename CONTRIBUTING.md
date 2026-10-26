# Contributing to OpenSource

Thank you for your interest in contributing to OpenSource.

## Development Setup

1. **Prerequisites:** Node.js 20+, Docker (for PostgreSQL).
2. **Start Database:**
   ```bash
   docker compose up -d
   ```
3. **Install Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Initialize Database:**
   ```bash
   npx prisma db push
   npm run seed
   ```
5. **Run Test Suite:**
   ```bash
   npm test
   ```
6. **Start Dev Server:**
   ```bash
   npm run dev
   ```

## Financial & Code Guidelines
- **Financial Arithmetic:** Always use integer minor units (cents) and basis points (bps). Never introduce floating-point math in financial calculation paths.
- **Strict Typing:** All TypeScript files must adhere to strict mode without `any` types where possible.
- **Security:** Always enforce server-side authorization on all protected routes and mutations.
