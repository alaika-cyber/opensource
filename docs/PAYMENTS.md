# Payment Integration & Payout Reconciliation Guide

## 1. Separation of Economic Funds
OpenSource maintains strict separation between:
1. **Customer Product Purchase:** Customer pays Product Owner via credit card / external payment intent.
2. **Attributed Commission Pool:** Agreed percentage committed by the Product Owner to the collaborating growth team.
3. **OpenSource Service Fee:** Disclosed 5.0% fee applied solely on contributor commissions actually settled through OpenSource.
4. **Contributor Payout Distribution:** Transfers from the platform escrow account to individual contributor external bank / Stripe Connect accounts.

## 2. Webhook Event Processing & Idempotency
All webhook events from payment providers (e.g., Stripe) are processed through `/api/webhooks/stripe`:
1. **Signature Verification:** Validates webhook signature against `STRIPE_WEBHOOK_SECRET`.
2. **Idempotency Guard:** Queries `WebhookEvent` table for existing `eventId`. If already processed, returns HTTP 200 immediately to prevent double ledger credits.
3. **Auditable Storage:** Stores raw event payload in `WebhookEvent.payload` with `WebhookStatus.PROCESSED`.
4. **Automated Reversal Handling:** `charge.refunded` and `payment_intent.canceled` events trigger `processOrderRefund()` to claw back unearned commissions automatically.

## 3. Payout Eligibility & Minimum Thresholds
- Minimum payout threshold: **$50.00 USD** (5,000 cents).
- Contributors below $50.00 cannot trigger payout processing to avoid disproportionate payment processing fees.
- Payout requests execute inside atomic PostgreSQL transactions, generating an immediate debit record in `FinancialLedger`.
