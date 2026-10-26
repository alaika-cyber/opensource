# OpenSource Production Deployment Guide

## 1. Prerequisites
- Node.js 20+ or 22+ LTS
- PostgreSQL 15+ (Local container, AWS RDS, Supabase, Neon, or Railway)
- Domain with SSL/HTTPS termination

## 2. Environment Configuration
Copy `.env.example` to `.env` and set production secrets:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL`: Connection string with schema parameters (e.g. `postgresql://user:pass@host:5432/opensource?schema=public`).
- `JWT_SECRET`: Random cryptographic string of at least 32 characters (`openssl rand -base64 32`).
- `NEXT_PUBLIC_APP_URL`: Canonical public URL (e.g. `https://opensource.example.com`).
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Real keys from your approved marketplace payment provider.

## 3. Database Synchronization & Migrations
Synchronize the relational schema with PostgreSQL:

```bash
# Push schema or run migrations
npx prisma db push

# Generate typed Prisma Client
npx prisma generate

# (Optional) Seed realistic demo data for staging
npm run seed
```

## 4. Building the Production Bundle

```bash
npm run build
```

## 5. Starting the Service

```bash
npm start
```

## 6. Docker Deployment
Run PostgreSQL and application together:

```bash
docker compose up -d
```
