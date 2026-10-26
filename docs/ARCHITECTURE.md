# OpenSource System Architecture & Technical Specification

## 1. Architectural Philosophy
OpenSource is designed as a modular monolith adhering to domain-driven boundaries. It couples high developer velocity with rigorous financial determinism.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|        Next.js App Router (React 19, Tailwind CSS, Lucide, Turbopack)   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                             API & Middleware                            |
|        Edge-Ready Jose Auth, Server-Side RBAC, Zod Validation           |
+-------------------------------------------------------------------------+
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
       v                            v                            v
+--------------+            +----------------+           +---------------+
| Product &    |            | Commission &   |           | Workspace &   |
| Team Domain  |            | Ledger Domain  |           | Collaboration |
+--------------+            +----------------+           +---------------+
       |                            |                            |
       +----------------------------+----------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        Data Persistence Layer                           |
|       PostgreSQL 16 (Relational Schema, Foreign Keys, Unique Indexes)   |
|       Prisma ORM (Strict Type Safety, Transactional Isolation)          |
+-------------------------------------------------------------------------+
```

## 2. Core Domain Boundaries

### A. Authentication & User Identities
- Passwords hashed using bcrypt (12 rounds).
- Stateless JWT sessions encoded via `jose` using HS256 with HTTP-only, SameSite=Lax cookie storage.
- Non-exclusive multi-role support (`USER` can simultaneously publish products and join independent growth syndicates).
- Elevated administrative operations enforce server-side `Role.ADMIN` checks and write immutable entries to `AdminAuditLog`.

### B. Product & Opportunity Marketplace
- Supports SaaS, AI Tools, Developer Infrastructure, Digital Downloads, and Physical Products.
- Commercial parameters (pricing, commission models, attribution window days, recurring duration) are versioned and immutable once linked to an active agreement.

### C. Collaborative Team Formation & Workspaces
- Supports both **Workflow A** (Product Owner creates opportunity -> invites professionals) and **Workflow B** (Independent professionals form syndicate first -> source and pitch products).
- Integrated workspace with Kanban deliverables (TODO -> IN_PROGRESS -> REVIEW -> DONE), discussion forums, and member directory.

### D. Financial Ledger & Commission Engine
- **Integer Minor Units:** All monetary sums are recorded in cents (`priceCents`, `grossCommissionCents`, `platformFeeCents`, `netCommissionCents`, `amountCents`). Floating point arithmetic is strictly forbidden.
- **Basis Points (bps):** All percentage calculations use basis points (100 bps = 1.00%, 10,000 bps = 100.00%).
- **Double-Entry Ledger:** All movements of funds create auditable debit and credit records with cryptographic idempotency keys.
- **Tamper-Evident Contracts:** Commercial agreements calculate a SHA-256 checksum upon mutual acceptance.
