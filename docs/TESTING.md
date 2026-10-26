# OpenSource Automated Testing & Quality Assurance Suite

## 1. Testing Strategy Overview
The platform maintains a multi-tiered automated test suite powered by Vitest, verifying mathematical correctness, database transactions, authorization rules, and end-to-end user journeys.

## 2. Test Inventory

### Suite 1: Commission Engine & Allocation Validation (`src/test/commission.test.ts`)
1. Allocation basis points must sum exactly to 10,000 (100.00%).
2. Rejection of allocations that do not equal 10,000 basis points.
3. Rejection of 0 or negative allocation basis points.
4. Exact integer minor-unit commission math without floating point drift.
5. Deterministic handling of odd pennies and rounding deltas.
6. Cryptographic SHA-256 checksum generation for tamper-evident agreements.
7. Attribution window validation within active window days.
8. Attribution window expiration outside window days.

### Suite 2: Integration Workflows (`src/test/integration.test.ts`)
1. Password hashing with bcrypt and session token signing/verification with jose.
2. Financial ledger entry recording with strict idempotency key deduplication.
3. Agreement checksum tampering detection.

### Suite 3: End-to-End User Journeys (`src/test/e2e-workflows.test.ts`)
1. Journey 1: Product Owner and Professional registration with secure auth.
2. Journey 2: Product Owner publishes a product with commercial terms.
3. Journey 3: Growth team is created and members accept internal allocation splits.
4. Journey 4: Commercial agreement created and signed with SHA-256 checksum.
5. Journey 5: Referral link generated and attributed to campaign.
6. Journey 6: Attributed purchase recorded, integer commissions calculated, and ledger credited.
7. Journey 7: Customer refund triggers auditable ledger reversal and cancels commissions.

## 3. Running Tests Locally

```bash
# Execute complete test suite
npm test

# Run tests in watch mode
npx vitest

# Run specific suite
npx vitest run src/test/commission.test.ts
```
