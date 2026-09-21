# Zviripo — Complete System Overview

This document explains how the entire Zviripo platform operates: the user-facing apps, the backend, the data model, the offline engine, and every tool in the chain.

---

## 1. What Zviripo is

Zviripo is a Zimbabwe-first digital operating layer for the everyday economy. One platform connects:

- **Consumers** — find products, shops, services and opportunities nearby
- **Merchants** — run a shop: inventory, POS sales, marketplace publishing, business metrics
- **Operators (you)** — an admin portal for platform health, metrics and moderation

**Core promise:** _Find it. Sell it. Need it. Build with it._

The first connected loop the system implements:

```
merchant adds stock → publishes to marketplace → consumer discovers it nearby
→ sale recorded in POS → stock decrements → dashboard metrics update
→ demand signals accumulate → better merchant decisions
```

Everything is designed for Zimbabwean realities: low-cost Android phones, intermittent connectivity, USD + ZWG pricing, informal retail (tuckshops, market stalls).

---

## 2. High-level architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        SUPABASE PROJECT                         │
│  Auth (email/password)  ·  PostgreSQL + RLS  ·  PostgREST API    │
│  marketplace_listings view  ·  create_business RPC               │
└──────┬───────────────────────┬──────────────────────┬───────────┘
       │ anon key + user JWT   │ anon key + user JWT  │ service key
       │                       │                      │ (server only)
┌──────▼──────────┐   ┌────────▼─────────┐   ┌────────▼───────────┐
│  apps/mobile     │   │  apps/web         │   │  apps/admin        │
│  Expo / RN       │   │  Next.js (Vercel) │   │  Next.js (Vercel)  │
│  consumer +      │   │  public           │   │  internal ops      │
│  merchant + POS  │   │  marketplace      │   │  dashboard         │
└──────┬───────────┘   └──────────────────┘   └────────────────────┘
       │
┌──────▼───────────┐
│  expo-sqlite      │  ← durable local sale queue (offline-first POS)
│  pending_sales    │
└──────────────────┘
```

**One database, three doors.** All surfaces share a single Supabase project. Security is enforced by PostgreSQL Row-Level Security, not by the apps — the apps simply carry the user's JWT.

---

## 3. Repository and tooling

### Monorepo structure

| Tool               | Role                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **pnpm 11**        | Package manager; workspaces link `apps/*` and `packages/*`                                                             |
| **Turborepo**      | Task orchestration — `lint`, `typecheck`, `test`, `build` run across all packages with caching and dependency ordering |
| **TypeScript 5.8** | Every package; strict types generated for the whole DB schema                                                          |
| **Prettier**       | Formatting gate (`pnpm format:check` runs in CI)                                                                       |
| **Vitest**         | Unit tests in `packages/utils` (money math) and `packages/validation`                                                  |
| **pgTAP**          | SQL-level tests asserting RLS is enabled on every private table (`supabase/tests/`)                                    |
| **GitHub Actions** | `.github/workflows/ci.yml` — runs format, lint, typecheck, test, build on every push/PR                                |
| **Vercel**         | Hosts `apps/web` and `apps/admin` as separate projects, auto-deploys `main`                                            |
| **Expo + EAS**     | Mobile runtime (SDK 57) and future APK/AAB builds                                                                      |
| **Metro**          | Mobile bundler; `metro.config.js` adds `.wasm` assets and stubs Node's `ws` for `supabase-js` realtime                 |

### Supply-chain policy

`.npmrc` enforces a **7-day minimum release age** — packages published in the last week can't be installed. This deliberately blocks bleeding-edge releases (supply-chain protection) and is why Expo patch versions are pinned slightly behind latest.

### Repository layout

```
apps/
  mobile/    Expo app — consumer + merchant + POS (one app, two modes)
  web/       Next.js public consumer storefront
  admin/     Next.js internal operations portal
packages/
  database/  Typed Supabase client + all data-access repositories
  types/     Shared domain types (Money, SyncOperation…)
  ui/        Design tokens + style recipes (colors, spacing, radii)
  utils/     Money math (integer minor units), tested
  validation/ Shared Zod schemas (money, sync operations)
  config/    Shared tsconfig presets
supabase/
  migrations/ Versioned SQL (core schema → marketplace view → RPCs)
  tests/      pgTAP security tests
  seed.sql    Mbare demo dataset (idempotent, re-runnable)
docs/         Product brief, architecture, security model, test strategy
```

Package names are still `@comodities/*` (the original name) — cosmetic only, visible branding is all Zviripo.

---

## 4. The backend — Supabase in detail

### 4.1 Authentication

- **Supabase Auth** with email + password. `signUpWithEmail` / `signInWithEmail` in `packages/database/src/auth.ts`.
- Phone OTP helpers exist (`signInWithPhone`, `verifyPhoneOtp`) but aren't wired into UI yet.
- A database trigger `handle_new_user` fires on `auth.users` insert and creates the matching `public.profiles` row — profile creation is automatic and can't be skipped.
- Sessions persist on the device (`persistSession: true`), JWT auto-refreshes, and every request carries `Authorization: Bearer <jwt>` so Postgres can evaluate `auth.uid()`.

### 4.2 Schema (from `202609170001_core_commerce.sql`)

**Identity & access**

| Table              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `profiles`         | One row per auth user — display name, phone, area                       |
| `businesses`       | A shop: name, area, coordinates, status, `created_by`                   |
| `business_members` | Join table — who works at which shop, with `owner/manager/cashier` role |
| `devices`          | Registered POS devices per user/business                                |

**Catalog**

| Table                | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `product_categories` | Shared taxonomy (Groceries, Fresh Produce, Phones…)                                |
| `products`           | Global product definitions (name, brand, category)                                 |
| `business_products`  | A shop's offering of a product: `sku`, `price_minor`, `currency_code`, `is_listed` |
| `inventory`          | Stock level per business product + low-stock threshold                             |

**Transactions**

| Table                 | Purpose                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| `sales`               | Header: `operation_id` (idempotency key), receipt number, totals                     |
| `sale_items`          | Lines: product snapshot name, qty, unit price                                        |
| `payments`            | Tender: `cash/card/mobile_money/bank_transfer/credit`                                |
| `receipts`            | Public receipt token hash per sale                                                   |
| `inventory_movements` | Append-only stock ledger — every change is a signed delta with the resulting balance |
| `sync_operations`     | Server-side mirror of offline operation status                                       |

**Key invariants enforced by the DB itself**

- Money is `bigint` minor units — never floats. `total = subtotal − discount` is a check constraint.
- Currency restricted to `USD`/`ZWG`.
- `sales.operation_id` is unique → retry-safe.
- `business_products` unique per `(business_id, product_id)` and per SKU.
- Quantities are `numeric(18,3)` — supports partial units (kg of tomatoes).

### 4.3 Row-Level Security model

Every private table has RLS enabled. The policies form one consistent rule set:

- **Profiles** — you can only read/update your own row.
- **Businesses** — members can read; creators insert (`created_by = auth.uid()`); owners/managers update.
- **Members** — visible to fellow members; only owners manage membership; an owner can't delete themselves.
- **Catalog** — products readable by any authenticated user; creators own their edits.
- **Business products & inventory** — readable by business members; writable by owner/manager roles only.
- **Sales, items, payments, receipts, movements** — readable and writable only by members of that business; inserts additionally require `recorded_by = auth.uid()` and a registered device belonging to the caller.
- **Sync operations** — member of the business **and** owner of the device.

Helper functions (`is_business_member`, `has_business_role`, `is_business_creator`) are `security definer` with `search_path = ''` — safe against search-path hijacking — and are what policies call.

The `marketplace_listings` **view** is the single public window: it joins `business_products` (only `is_listed = true`, `active`) + products + businesses (`status = 'active'`) + inventory, and is granted to `anon` and `authenticated`. Anonymous users can browse the marketplace but see _only_ what merchants explicitly published.

### 4.4 Server-side functions

- `create_business(name, area, phone)` — `security definer` RPC that inserts the business **and** the owner membership atomically. This replaced a two-step client flow that could leave orphan businesses, and bypasses an RLS edge case observed on the live project.
- `handle_new_user` — profile creation trigger.
- `set_updated_at` — timestamp maintenance trigger on mutable tables.

### 4.5 The `marketplace_listings` contract

What a consumer sees per row: product name/description/brand, category, shop name/slug/area/coordinates, price (minor units) + currency, live `available_quantity`, timestamps. When a POS sale decrements inventory, the view's `available_quantity` drops automatically — marketplace availability is the merchant's real stock, not a separate catalog.

---

## 5. Data access layer — `packages/database`

All Supabase access goes through typed repository functions (never raw queries in screens):

| Module           | Exports                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`       | `createSupabaseClient` (session persistence on), all generated `Database` types                                                                                       |
| `server.ts`      | `createServiceClient` — service-role, no session (server-side only)                                                                                                   |
| `auth.ts`        | Sign up/in/out, session, OTP helpers                                                                                                                                  |
| `marketplace.ts` | `listMarketplace` (query/area/category/price filters, pagination), `getMarketplaceListing`, `getMarketplaceByBusiness`                                                |
| `merchant.ts`    | `getBusinessesForProfile`, `createBusiness` (RPC), `listBusinessProducts`, `createProduct` (+ initial stock), `updateStock`, `toggleListed`, `recordSale`, `getSales` |
| `device.ts`      | `registerDevice` — upserts device so sales can attach to it                                                                                                           |

`recordSale` is idempotent: it checks `operation_id` first, so replaying a queued sale returns the existing row instead of duplicating.

---

## 6. The mobile app — `apps/mobile`

Expo SDK 57 + Expo Router + React Native 0.86. One app serves both audiences via route groups.

### Route map

```
/                    Welcome (brand lockup on night surface → Explore / Business / Sign in)
/(auth)/sign-in      Email sign-in + sign-up (same screen, toggle, humanized errors)

/(consumer)/         Tab bar: Home · Discover · Sell · Activity · You
  index              Intent-first home: search, action grid, live "Available near you"
                     listings, skeletons and honest empty/error states
  discover           Search-as-heart: URL-seeded query, persisted recent searches,
                     real listing results, request fallback on empty
  create             Sell/Request/Offer-a-service entry points; unbuilt flows are
                     clearly marked "Coming soon"
  activity           Notifications placeholder
  profile            Real session identity, saved items, sign-out
/product/[id]        Live listing detail: price, stock, seller card, call action
                     when a phone is published, save toggle, request-similar link
/action/[slug]       Honest placeholder flows — preview forms are disabled and
                     explicitly say nothing is saved; flows that exist (sell,
                     add stock, insights) deep-link to the live screen

/(merchant)/         Tab bar: Business · Sell · Inventory · Activity · More
  index              Dashboard: today's revenue/txns/items, marketplace count,
                     low-stock, Attention cards (pending sync, restock, unlisted)
  sell               POS: searchable inventory, quantity steppers capped at stock,
                     payment-method chips (cash/mobile money/card/bank transfer),
                     confirm → queue locally → sync
  inventory          Stock list, inline restock stepper, "List on Zviripo" toggles
  add-product        Name/price/currency chips/initial stock/marketplace toggle
  setup              Create business (→ create_business RPC)
  activity           Real sales feed grouped Today/Earlier from getSales
  more               Real business card, tool links (live vs coming soon), sign-out
```

### Shared UI layer

`src/ui/` holds the primitives every screen composes — `Text` (typography roles), `Button`, `Input`, `Press` (micro-press feedback honoring reduced motion), `Card`/`Chip`/`Row`/`SectionHeader`/`IconButton`, and `Skeleton`/`EmptyState`/`ErrorState`. `src/components/` adds domain pieces: `SyncStatus` (connectivity-aware pill/card), `commerce.tsx` (`Price`, `Availability`, `ProductCard`, `ListingRow`), and `brand.tsx` lockups. `src/lib/connectivity.ts` wraps `expo-network` into a `useConnectivity` hook plus `useOnReconnect` for auto-sync.

### State and identity

`AuthProvider` (React context at the root) holds the session, the user's business memberships, and a per-device ID. On session change it refreshes memberships and registers the device.

### The offline POS engine — the most important subsystem

`src/lib/offline-pos.ts` uses `expo-sqlite` with a `pending_sales` table:

```
sale built on Sell screen
  → queueSale(): INSERT INTO pending_sales (operation_id, payload)   ← durable before network
  → syncPendingSales(): for each pending row → recordSale(supabase, input)
      success → status='synced', synced_at set
      failure → keep pending, store sanitized error message
```

Guarantees:

- **A sale is never lost** — it hits SQLite before any network call; crash/reboot/offline all safe.
- **No duplicates** — `operation_id` is the SQLite primary key _and_ the unique server key; replaying returns the existing sale.
- **Visible state** — the shared `SyncStatus` pill/card shows real connectivity (via `expo-network`) plus pending count on Sell, the dashboard and Activity; tapping retries.
- **Auto-sync on reconnect** — a `useOnReconnect` listener in the root layout flushes the queue whenever connectivity returns, app-wide; individual screens also refresh their data.
- **Honest UX** — success says "Sale recorded"; offline says "saved on this device, will sync automatically." Errors pass through `humanizeError` so network failures read as "You're offline", not stack traces.

Known limits (roadmap): stock doesn't decrement locally while offline, no conflict resolution UI, and `recordSale` still runs as sequential client calls — a transactional server-side RPC is the planned hardening step.

### Metro bundling notes

`metro.config.js` registers `.wasm` as an asset (expo-sqlite ships a WASM build for web) and redirects `ws` → a stub that exports the global `WebSocket` (supabase realtime-js dynamically requires Node's `ws`, which doesn't exist in RN).

---

## 7. The consumer web app — `apps/web`

Next.js (App Router), deployed to Vercel. The storefront is **server-rendered** — listings are fetched on the server per request, so pages are crawlable and fast on cheap devices.

- `/` — server component reading `?q=` from the URL: hero with a plain GET search form, quick links (Buy/Sell/Request/Services), a "Live near you" card with a real listing, the **Near you** grid of real `marketplace_listings` rows (each card links to its detail page), honest empty/error states, a **Reverse marketplace** request section (examples labeled EXAMPLE), and a merchant pitch section (dashboard mock labeled EXAMPLE).
- `/product/[id]` — server-rendered listing detail with `generateMetadata`: price, live stock status, description/brand, seller card linking to the shop page, and a `tel:` call button when the business publishes a phone number.
- `/business/[id]` — server-rendered shop page listing all live listings for that business, with `generateMetadata`.
- `/sign-in` — email auth against the same Supabase project.
- `components/auth-link.tsx` — session-aware nav (Sign in ↔ account state); `components/save-button.tsx` — the only client island on the listing grid, persisting saves to `localStorage`.

It reads the same `listMarketplace`/`getMarketplaceListing`/`getMarketplaceByBusiness` repositories as mobile — one data source, two renderers.

## 8. The admin app — `apps/admin`

Next.js portal at `admin-six-mauve-79.vercel.app`.

- Sidebar sections: Overview, Users, Merchants, Listings, Moderation, Verification, Sync health, Audit logs.
- `/api/stats` — server route using the **service-role key** (server-only, never bundled to the client). Returns aggregate counts (merchants, live listings, sales today, registered users, out-of-stock inventory, sync ops in flight and in conflict) plus the 8 most recent merchants and listings.
- Section-aware panels: Merchants shows the real recent-business list with status badges, Listings shows newest marketplace rows, Sync health splits in-flight vs. conflict queues; Moderation, Verification and Audit logs state plainly that those queues don't exist yet.
- Deliberately honest: shows "Live from Supabase" when configured, "Awaiting data connection" otherwise. Privileged admin actions are not yet built — the portal is metrics-first pending admin auth/roles.

---

## 9. Design system — `packages/ui`

Zviripo's visual language lives in tokens, consumed identically by RN and CSS:

- **Palette** — deep forest greens (`#0a3527`→`#178d5f`), Zimbabwean gold accent (`#e8a020`), warm paper canvas (`#f5f4ef`), semantic success/warning/danger/info.
- **Rule** — gold marks the _primary action_ on each screen (Sell now, Explore, Post a request).
- **Type** — a role scale (`display`/`headingXl…Sm`/`body`/`bodySm`/`caption`/`label`/`numeric*`) plus a legacy size map; **radii** 8/12/16/22/pill; **spacing** 4-based scale to 96; **48px minimum touch targets**.
- **Iconography** (`icons.ts`) — a single named icon set mapped to Ionicons, so screens ask for `sync`, `lowStock`, `mobileMoney` rather than glyph names.
- **Voice** (`copy.ts`) — shared product copy: sync states ("N sales waiting to sync", "Everything synced"), empty states per surface, error titles/details, and the "Coming soon — nothing here is saved" notice used by placeholder flows.
- **Motion** (`motion` tokens) — 120ms micro-press, 200ms transitions; the `Press` primitive honors reduced-motion settings.
- **Money formatting** — `formatMinor`/`formatMoney` in `@comodities/utils` render integer minor units identically on Hermes, Node and browsers (no `Intl` dependency).

---

## 10. Cross-cutting invariants

| Concern       | Implementation                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Money         | Integer minor units (`bigint`), USD/ZWG only, `money/addMoney/multiplyMoney` in `@comodities/utils` reject non-integers and cross-currency math; DB check constraints repeat the guarantees |
| Idempotency   | `operation_id` UUID generated client-side, unique in SQLite and Postgres; `recordSale` returns the existing row on replay                                                                   |
| Authorization | RLS on every table + role helpers; writes require membership + matching `recorded_by`                                                                                                       |
| Validation    | Zod schemas shared in `@comodities/validation`                                                                                                                                              |
| Privacy       | Service-role key exists only in `apps/admin` server env; public surfaces see only the marketplace view                                                                                      |
| Testing       | Vitest unit tests (money, validation); pgTAP asserts RLS enabled on all 14 tables + helper functions + `operation_id` uniqueness                                                            |

---

## 11. Environments and secrets

| Variable                                 | Where              | Public?                           |
| ---------------------------------------- | ------------------ | --------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | `apps/mobile/.env` | Yes — bundled, safe (RLS-guarded) |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | web + admin env    | Yes — same                        |
| `SUPABASE_SERVICE_ROLE_KEY`              | admin server only  | **No — bypasses RLS**             |
| `SUPABASE_PROJECT_ID`, PostHog, Sentry   | optional tooling   | mixed                             |

Deployments: web → `web-swart-nine-57.vercel.app`, admin → `admin-six-mauve-79.vercel.app`, mobile → Expo Go (`npx expo start`) now, EAS APK/AAB for testers later.

---

## 12. What's real vs. what's ahead

**Working today, end-to-end:** auth → business creation → products + stock → publish to marketplace → public discovery on web + mobile (searchable, server-rendered product and shop pages) → offline-safe POS sale with payment method → stock decrement → dashboard/admin metrics → auto-sync on reconnect. Seeded with a realistic Mbare dataset.

**Honest gaps (roadmap):** requests economy (tables + responses), services/jobs, admin authentication and privileged actions, local stock decrement while offline, conflict resolution, transactional server-side `record_sale` RPC (the current client performs sequential writes), messaging, receipts QR, verification flows, live pgTAP runs in CI, and a pending investigation into the `businesses` insert-policy mismatch that the `create_business` RPC works around.
