# OpenSource

> **Build together. Sell together. Earn together.**

Production-ready global collaborative commerce platform connecting product innovators with independent cross-functional growth teams who market products and share transparent commissions from verified commercial results.

---

## 🚀 Key Highlights & Architectural Features

- **Integer Minor-Unit Commission Engine:** Precise decimal/cent calculations with zero floating-point arithmetic errors. Percentage allocations calculated using basis points (100 bps = 1.00%, 10,000 bps = 100.00%).
- **Double-Entry Financial Ledger:** Auditable debit/credit records with cryptographic idempotency keys that prevent double credits from network retries or duplicate webhooks.
- **Tamper-Evident Commercial Agreements:** SHA-256 checksum generation for versioned agreements and mutual acceptance records. Terms cannot be modified retrospectively.
- **Dual Collaborative Workflows:** Supports both **Owner-Led** (Product Owner publishes product -> invites growth specialists) and **Professional-Led** (Professionals form syndicate -> pitch products) collaboration.
- **Interactive Team Workspaces:** Kanban deliverables management, discussion threads, member invitations, and live revenue allocation editors with 10,000 bps sum validation.
- **Automated Refund & Clawback Engine:** Atomic reversals that debit contributor commission balances and adjust platform fees whenever customer orders are refunded.
- **Role-Adaptive Dashboards:** Unified Overview, Professional View (attributed sales, referral links), Product Owner Command Center (orders, commission liabilities, live refund actions), and Platform Admin Console.
- **Comprehensive Public Experience:** Responsive marketing site with interactive revenue simulation tools, product catalogue, professional profiles, team directories, legal drafts, and accessible dark/light themes.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide Icons.
- **Backend & API:** Next.js Route Handlers, Edge-ready `jose` JWT authentication, Zod input validation, Bcrypt password hashing.
- **Database & ORM:** PostgreSQL 16 (Docker-orchestrated), Prisma ORM 6 with 30 relational models, foreign keys, unique constraints, and indexes.
- **Testing:** Vitest automated test suite covering unit math, integration transactions, and end-to-end user journeys (18 automated tests passing).
- **Tooling & CI:** Docker Compose, GitHub Actions CI workflow, TypeScript compiler, Turbopack.

---

## ⚡ Quick Start & Local Execution

### 1. Clone & Enter Repository
```bash
git clone https://github.com/your-org/opensource.git
cd opensource
```

### 2. Start PostgreSQL Container
```bash
docker compose up -d
```
*PostgreSQL 16 will start on `localhost:5432` with database `opensource`.*

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Initialize Database Schema & Seed Realistic Demo Data
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed database with realistic products, teams, agreements, orders, and ledger records
npm run seed
```

### 5. Run Automated Tests
```bash
npm test
```
*Executes all 18 unit, integration, and end-to-end tests.*

### 6. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Demo Accounts (Password: `Password123!`)

The platform includes pre-configured, realistic test accounts with 1-click selectors on the Sign-In page:

| Role | Email | Features to Test |
| :--- | :--- | :--- |
| **Product Owner** | `sarah.chen@cloudscale.io` | Product listings, sales analytics, commission liability, issuing refunds & clawbacks. |
| **Independent Professional** | `elena.rostova@hypergrowth.syndicate` | Attributed referral links, team revenue splits, payable balances, requesting payouts. |
| **Platform Administrator** | `admin@opensource.platform` | System-wide sales metrics, product verification, user suspension, dispute mediation. |

---

## 📦 Project Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000. |
| `npm run build` | Compiles production bundle with Turbopack and verifies TypeScript. |
| `npm start` | Starts compiled production server. |
| `npm test` | Executes the Vitest automated test suite. |
| `npm run seed` | Seeds PostgreSQL with realistic demo data. |
| `npx prisma db push` | Synchronizes database tables with Prisma schema. |
| `npx prisma studio` | Launches Prisma web interface for inspecting database tables. |

---

## 📚 Technical Documentation Directory

- [Architecture & System Design](docs/ARCHITECTURE.md)
- [Commission Calculation & Rounding Specification](docs/COMMISSION_SPEC.md)
- [Payment Integration & Webhooks](docs/PAYMENTS.md)
- [Security & Privacy Checklist](docs/SECURITY_CHECKLIST.md)
- [Testing Suite Documentation](docs/TESTING.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [Pre-Launch Blockers & Compliance Checklist](docs/PRODUCTION_CHECKLIST.md)
- [Incident Response & Disaster Recovery](docs/INCIDENT_RESPONSE.md)
- [REST API Reference](docs/API.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

## ⚖️ License & Disclaimers

All legal documents provided in `/terms`, `/privacy`, and `/cookies` are operational structural drafts that require jurisdiction-specific legal counsel review before live public transactions. Platform fees and monetization parameters are configurable via environment variables and administrative settings.
