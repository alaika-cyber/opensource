# Production Launch Checklist & Blocker Inventory

Before commencing public commercial transactions, the following legal, compliance, and payment provider requirements must be resolved:

## 1. External Payment Provider & Banking Approval (Blocker)
- [ ] Submit marketplace business model for underwriting approval with Stripe Connect or equivalent payment processor.
- [ ] Determine marketplace liability structure (Direct charges vs Destination charges vs Separate charges and transfers).
- [ ] Configure live production webhook endpoints with secret verification.
- [ ] Enable 1099-K / DAC7 tax compliance reporting automation for high-volume contributors.

## 2. Legal & Jurisdictional Review (Blocker)
- [ ] Formal review of `Terms of Service` draft by legal counsel in operating jurisdiction.
- [ ] Review of `Privacy Policy` against GDPR (EU), CCPA/CPRA (California), and LGPD (Brazil) standards.
- [ ] Review contractor vs employee characterization of independent growth specialists to ensure independent contractor status is preserved.
- [ ] Formulate restricted products and prohibited services policy (e.g., adult, gambling, multi-level marketing prohibited).

## 3. Infrastructure & Operational Safeguards
- [x] Automated CI pipeline running lint, test, and build on pull requests.
- [x] Automated database push and migration scripts verified.
- [x] Double-entry ledger with idempotency keys verified against duplicate credits.
- [x] Tamper-evident agreement checksums verified.
- [ ] Configure production database backup cron with point-in-time recovery (PITR).
- [ ] Configure Sentry or Datadog for runtime error tracking and APM telemetry.
- [ ] Set up SendGrid / Resend production API key for transactional emails.
