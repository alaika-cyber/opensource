# OpenSource Security & Privacy Architecture Checklist

## 1. Authentication & Session Security
- [x] Passwords salted and hashed with bcrypt (cost factor 12).
- [x] No plaintext passwords or credentials persisted in database or logs.
- [x] JWT sessions signed with HMAC-SHA256 using `jose` with mandatory 7-day expiration.
- [x] Session cookie configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
- [x] Role-Based Access Control (`USER`, `ADMIN`) validated on the server for all protected API routes and server actions.

## 2. Authorization & Broken Access Control (IDOR) Protections
- [x] Route handlers verify resource ownership before mutating products, teams, or agreements.
- [x] Team workspace endpoints enforce team membership checks; unauthorized users cannot access private team tasks or discussion threads.
- [x] Payout requests require authenticated session and cannot request payouts on behalf of other users.
- [x] Administrative console routes enforce `user.role === Role.ADMIN` check on server-side.

## 3. Financial Integrity & Cryptographic Verifications
- [x] Integer minor units (cents) enforced throughout schema and calculations to eliminate floating-point precision flaws.
- [x] Idempotency keys enforced on all financial ledger writes to eliminate duplicate credits on network retries.
- [x] Mutual agreement terms hashed with SHA-256 to guarantee tamper-evident contract versioning.
- [x] Order refunds trigger atomic reversals and ledger clawbacks.

## 4. Input Sanitization & Threat Mitigation
- [x] External request payloads validated with Zod schemas.
- [x] Parameterized SQL executed via Prisma ORM to prevent SQL injection.
- [x] Output encoding handled by React JSX to mitigate cross-site scripting (XSS).
- [x] CSRF protection via SameSite cookies on all state-changing endpoints.
