# OpenSource API Reference

## Authentication Endpoints

### `POST /api/auth/register`
Create a new user account.
- **Request Body:** `{ name: string, email: string, password: string, intent?: "owner" | "professional" | "both" }`
- **Response (201):** `{ success: true, user: SafeUser }`

### `POST /api/auth/login`
Authenticate and obtain HTTP-only session cookie.
- **Request Body:** `{ email: string, password: string }`
- **Response (200):** `{ success: true, user: SafeUser }`

### `POST /api/auth/logout`
Revoke active session and delete session cookie.

### `GET /api/auth/me`
Retrieve currently authenticated user profile and memberships.

---

## Products & Opportunities

### `GET /api/products`
Query active products catalogue.
- **Query Params:** `category`, `search`, `minCommissionBps`
- **Response (200):** `{ products: Product[] }`

### `POST /api/products`
Publish a product and open commercial opportunity (Requires Auth).
- **Request Body:** `{ name, shortDesc, description, category, tags, priceCents, pricingModel, commissionRateBps, attributionMethod, attributionWindowDays }`

---

## Teams & Workspaces

### `GET /api/teams`
Query public collaborative growth syndicates.

### `POST /api/teams`
Create a growth syndicate and assign leader (Requires Auth).

### `POST /api/teams/:id/members`
Manage team members (invite, remove, or update revenue allocation splits).

### `POST /api/teams/:id/tasks`
Create team deliverable in workspace.

### `PATCH /api/teams/:id/tasks`
Update task priority or status (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).

### `POST /api/teams/:id/discussions`
Post a topic or reply with comment.

---

## Commercial Agreements & Financial Operations

### `POST /api/agreements`
Draft a commercial agreement and compute SHA-256 terms checksum.

### `POST /api/agreements/:id/accept`
Cryptographically accept agreement terms.

### `POST /api/orders`
Record verified order, attribute to referral link or deal registration, and calculate integer commission entries.

### `POST /api/orders/:id/refund`
Issue refund and execute proportional clawback reversal in ledger.

### `POST /api/payouts`
Request payout against available balance ($50.00 minimum threshold).

### `POST /api/webhooks/stripe`
Idempotent webhook processor for external payment providers.
