# Zviripo Engineering Rules

## Product source of truth

Zviripo is a Zimbabwe-first commerce operating layer connecting consumers, informal and small merchants, service providers, job seekers, farmers, and suppliers. Preserve the original dual foundation: offline-first merchant POS/inventory/credit/QR receipts, a universal marketplace, and a centralized admin portal. Present one connected ecosystem rather than separate “POS + marketplace” products.

The core loop is inventory → marketplace publication → local discovery → sale → inventory update → aggregated insight. Prioritize proving this loop before finance, logistics, agriculture specialization, group buying, or AI.

## Non-negotiables

- Offline merchant operations are core behavior, not fallback UI.
- Never silently lose a sale. Transaction paths require atomicity, idempotency, crash recovery, retry tests, and reconciliation.
- Canonical merchant inventory powers marketplace availability; do not create independent stock sources.
- Protect private business data with tested PostgreSQL RLS.
- Store money as integer minor units with explicit currency; never use floating-point financial arithmetic.
- Keep service credentials and AI provider credentials server-side.
- Collect only necessary personal data; analytics and market intelligence must be privacy-conscious and aggregated.
- Trust signals must be factual. Never label new or unverified people as scammers.
- Optimize for low-cost Android devices, intermittent connectivity, small bundles, compressed media, pagination, and efficient lists.
- Keep checkout thumb-friendly and immediately accessible.
- Do not add wallets, lending, escrow, cryptocurrency, logistics fleets, full accounting, or complex loyalty without an explicit product decision.
- AI may assist but must not invent condition, stock, certification, price, seller claims, or business metrics.

## Architecture

- pnpm/Turborepo monorepo.
- Expo + React Native mobile application.
- Next.js consumer web and separate admin portal.
- Supabase Auth, PostgreSQL, RLS, Storage, Realtime where useful, and Edge Functions.
- SQLite is the immediate source for offline merchant transactions; Supabase is authoritative after idempotent synchronization.
- Shared TypeScript types, validation, UI tokens, and domain logic belong in packages.

## Definition of done

Include relevant loading, empty, error, success, accessibility, offline, validation, authorization, analytics, test, performance, security, and monitoring behavior. For financial/inventory work also include idempotency, consistency, crash recovery, duplicate sync testing, offline testing, and reconciliation.

## Verification

From the repository root run `pnpm install --fetch-timeout 300000`. Approved install scripts are limited to `sharp` and `esbuild`; use `pnpm approve-builds sharp esbuild` if a clean environment requests approval.

Then run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm format:check`

Do not claim completion when relevant checks fail.
