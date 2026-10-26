# Changelog

All notable changes to the OpenSource platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-26

### Added
- **Core Platform Architecture:** Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4, Prisma ORM 6.
- **Relational Data Model:** 30 normalized PostgreSQL tables supporting users, products, teams, commercial agreements, tamper-evident acceptances, integer minor-unit commissions, double-entry financial ledger, payouts, disputes, tasks, and audit logs.
- **Authentication System:** Secure bcrypt password hashing, edge-ready jose JWT session tokens, HTTP-only secure cookie sessions, and role-based access control.
- **Commission Calculation Engine:** Deterministic integer minor-unit arithmetic, basis points (bps) modeling, remainder distribution, 5% disclosed platform fee calculation, and SHA-256 agreement checksum generation.
- **Attribution & Ledger Accounting:** Multi-touch attribution (referral links, discount codes, B2B deal registrations), idempotency key enforcement on financial entries, and auditable refund clawback reversals.
- **Dual Collaborative Workflows:** Both Product Owner-led (Workflow A) and Independent Professional-led (Workflow B) team formation and opportunity pitching.
- **Interactive Team Workspace:** Integrated deliverable tracking with Kanban boards, discussion threads, member invitations, and live revenue allocation editors.
- **Dashboards:** Role-adaptive overview, dedicated Professional dashboard, Product Owner command center with live refund simulation, Team workspace, and Admin console.
- **Public Marketing Website:** 23 responsive pages including Home, Interactive Revenue Simulator, Products catalogue, Professionals directory, Teams directory, How It Works, Pricing, About, Trust & Safety, FAQ, Contact, Terms, Privacy, and Cookie preferences.
- **Automated Testing Suite:** 18 comprehensive unit, integration, and end-to-end tests covering mathematical rounding, attribution, idempotency, and full order-to-payout cycles.
- **Operational Documentation:** Architecture spec, Commission spec, Payments guide, Security checklist, Testing guide, Deployment runbook, Incident response runbook, and Production launch checklist.
