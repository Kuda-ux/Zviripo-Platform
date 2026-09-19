# Zviripo

A Zimbabwe-first commerce operating layer that connects consumers, informal and small merchants, service providers, job seekers, farmers, and suppliers.

**Core promise:** Find it. Sell it. Need it. Build with it.

This repository is the home of the Zviripo platform: an offline-first mobile POS and inventory engine, a universal marketplace, and a centralized admin command center.

## Product surfaces

- **Consumer mobile / web** — discover, search, save, request, and transact locally.
- **Merchant mobile** — sell offline, manage inventory, track credit, publish to the marketplace, and view business insights.
- **Admin web** — platform operations, moderation, verification, sync health, and commerce intelligence.

## Tech stack

- Mobile: Expo + React Native + TypeScript
- Web / Admin: Next.js + TypeScript
- UI: Tailwind CSS + shared Zviripo design tokens
- Backend / Auth / Storage / Realtime: Supabase
- Offline persistence: SQLite on mobile merchant flows
- Monorepo: pnpm workspaces + Turborepo
- Mobile builds: Expo EAS
- Web hosting: Vercel
- Error monitoring: Sentry
- Analytics: PostHog

## Repository structure

```text
comodities/
  apps/
    mobile/        # Consumer + merchant Expo app
    web/           # Public consumer Next.js site
    admin/         # Restricted operations portal
  packages/
    ui/            # Design tokens and shared primitives
    types/         # Cross-app TypeScript types
    validation/    # Shared Zod schemas
    database/      # Supabase client and generated types
    utils/         # Money, dates, identifiers
    config/        # Shared TS / lint / build config
  supabase/
    migrations/    # Versioned PostgreSQL migrations
    functions/     # Supabase Edge Functions
    tests/         # pgTAP RLS and schema tests
  docs/
    architecture/  # System design and domain model
    product/       # Master product brief
    security/      # Security model
    testing/       # Testing strategy
  AGENTS.md        # Engineering rules and verification commands
```

## Quick start

### Requirements

- Node.js 22+
- pnpm 11+
- (Optional) Docker for local Supabase

### Install

```bash
pnpm install --fetch-timeout 300000
```

If a clean environment asks to approve native builds, run:

```bash
pnpm approve-builds sharp esbuild
```

### Environment

Copy `.env.example` to `.env.local` (and per-app `.env` files) and fill in your Supabase, Sentry, and PostHog credentials.

```bash
cp .env.example .env.local
```

### Run

```bash
# All dev servers
pnpm dev

# Or individually
pnpm --filter @comodities/mobile dev
pnpm --filter @comodities/web dev
pnpm --filter @comodities/admin dev
```

### Verify

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

## Vercel deployment

The monorepo contains two web apps. Create **separate Vercel projects** for each:

| Project       | Root Directory | Framework Preset | Build Command |
| ------------- | -------------- | ---------------- | ------------- |
| Zviripo Web   | `apps/web`     | Next.js          | default       |
| Zviripo Admin | `apps/admin`   | Next.js          | default       |

Each app includes a `vercel.json` with the correct framework and output settings.

### Environment variables on Vercel

Add these to each project in the Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- `SENTRY_DSN` (optional)

Mobile environment variables are provided at build time through Expo EAS secrets.

## Supabase setup

1. Create a Supabase project for the target environment.
2. Install the Supabase CLI and link:

   ```bash
   pnpm add -g supabase
   supabase link --project-ref <your-project-ref>
   ```

3. Push migrations:

   ```bash
   supabase db push
   ```

4. Run pgTAP tests:

   ```bash
   supabase test db
   ```

Keep development, staging, and production projects separated. Never use production data casually in development.

## GitHub Codespaces

1. Open the repository in GitHub and select **Code → Codespaces → Create codespace on main**.
2. The container will use the existing pnpm/Turborepo setup.
3. Run `pnpm install --fetch-timeout 300000` inside the codespace.
4. Run `pnpm build` to confirm the environment.

Codespaces is ideal for collaborative work with Claude Fable, SWE-2, or other contributors because every developer gets the same Node version and workspace layout.

## Branching and CI

Default branches:

- `main` — production-ready code
- `develop` — integration branch
- `feature/*`, `fix/*`, `release/*`

GitHub Actions runs lint, typecheck, tests, and builds on every pull request and push to `main` or `develop`.

## Important security notes

- Service-role keys and AI provider credentials must stay server-side.
- Supabase anonymous keys are safe to expose in web/mobile bundles.
- RLS policies are mandatory for every private table and are tested with pgTAP.
- Money is stored as integer minor units. Do not use floating-point arithmetic for financial records.
- Customer debt and private transaction data must not be exposed publicly.

## Roadmap

1. Repository foundation and design system ✅
2. Supabase schema, RLS, and migrations (ready, pending live database execution)
3. Authentication and merchant onboarding
4. Consumer marketplace foundation
5. Offline POS, inventory, credit, and receipts
6. POS ↔ marketplace inventory bridge
7. Requests, services, and jobs
8. Trust, safety, verification, and moderation
9. Merchant insights and commerce intelligence
10. Grounded AI assistance

See `docs/product/master-brief.md` and `AGENTS.md` for the full product principles and engineering rules.

## License

Private and confidential. External use or distribution is not permitted without explicit agreement.
