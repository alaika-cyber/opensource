# Incident Response & Disaster Recovery Runbook

## 1. Severity Levels
- **P0 (Critical Outage / Financial Discrepancy):** Payment processing failure, duplicate financial ledger entries, database outage, or unauthorized data exposure. Response time: < 15 minutes.
- **P1 (High Impact):** Workspace task management disruption, attribution recording delay, webhook latency. Response time: < 1 hour.
- **P2 (Normal):** UI rendering glitches, minor non-blocking bug reports. Response time: < 24 hours.

## 2. Financial Discrepancy Protocol
If a ledger discrepancy or attribution collision is detected:
1. **Freeze Payouts:** Set `PLATFORM_PAYOUTS_FROZEN=true` in environment configuration to suspend outgoing payout batches.
2. **Audit Ledger:** Query `FinancialLedger` for unreferenced entries or broken balance chains:
   ```sql
   SELECT id, "entryType", "userId", "amountCents", "balanceAfterCents", "idempotencyKey", "createdAt"
   FROM "FinancialLedger"
   ORDER BY "createdAt" DESC
   LIMIT 100;
   ```
3. **Idempotency Reconciliation:** Ensure every `WebhookEvent` has a corresponding single `idempotencyKey` record.
4. **Issue Corrective Ledger Reversal:** Never mutate existing ledger rows; issue a corrective `SYSTEM_CREDIT` or debit entry.

## 3. Database Backup & Disaster Recovery Strategy
- **Continuous Backups:** Automated WAL archiving with 30-day Point-In-Time-Recovery (PITR).
- **Daily Snapshots:** Compressed database dumps executed nightly:
  ```bash
  pg_dump -U postgres -d opensource | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
  ```
- **Restore Procedure:**
  ```bash
  gunzip -c backup_latest.sql.gz | psql -U postgres -d opensource
  ```
