# Frontend Architecture Assessment (Phase 0 — Discovery)

Findings from a full inspection of the repository before the Experience transformation. Read alongside `system-overview.md` (backend/data) and `ZVIRIPO_DESIGN.md` (design system).

## Route → data map

| Surface | Route                                  | Data source                                  | Repository call                                                            |
| ------- | -------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Mobile  | `/` welcome                            | none                                         | —                                                                          |
| Mobile  | `/(auth)/sign-in`                      | Supabase Auth                                | `signInWithEmail`, `signUpWithEmail`                                       |
| Mobile  | `/(consumer)/index`                    | `marketplace_listings`                       | `listMarketplace` via `fetchMarketplace`                                   |
| Mobile  | `/(consumer)/discover`                 | `marketplace_listings`                       | `listMarketplace` (query)                                                  |
| Mobile  | `/product/[id]`                        | `marketplace_listings`                       | `getMarketplaceListing`                                                    |
| Mobile  | `/(consumer)/profile`                  | session                                      | `useAuth`                                                                  |
| Mobile  | `/(consumer)/create`, `/action/[slug]` | none (placeholder forms)                     | —                                                                          |
| Mobile  | `/(merchant)/index`                    | `sales`, `business_products`                 | `getSales`, `listBusinessProducts` + SQLite pending count                  |
| Mobile  | `/(merchant)/sell`                     | `business_products` → SQLite → `sales`       | `listBusinessProducts`, `queueSale`, `syncPendingSales` → `recordSale`     |
| Mobile  | `/(merchant)/inventory`                | `business_products`, `inventory`             | `listBusinessProducts`, `toggleListed`, `updateStock`                      |
| Mobile  | `/(merchant)/add-product`              | `products`, `business_products`, `inventory` | `createProduct`                                                            |
| Mobile  | `/(merchant)/setup`                    | `create_business` RPC                        | `createBusiness`                                                           |
| Web     | `/`                                    | `marketplace_listings`                       | `listMarketplace` (client-side)                                            |
| Web     | `/sign-in`                             | Supabase Auth                                | `signInWithEmail`                                                          |
| Admin   | `/`                                    | `/api/stats` (service role)                  | counts on `businesses`, `marketplace_listings`, `sales`, `sync_operations` |

## What is already strong — preserve

- One typed data layer (`packages/database`); no raw Supabase calls in screens.
- Durable SQLite queue before network for POS; idempotent `recordSale` keyed by `operation_id`.
- Integer minor-unit money with DB constraints; USD/ZWG only.
- RLS on every private table; service-role key only in the admin server route.
- Honest empty states that route into the request economy; no fabricated ratings/trust.
- Consistent route architecture (consumer tabs, merchant tabs, shared product route).
- Token file exists and is consumed by every mobile screen.

## Inconsistencies found

- **Typography scale is ad-hoc.** Screens use raw sizes (10, 11, 12, 13, 17, 18, 21, 36, 42, 44) alongside tokens. No `label`/`numeric` roles; prices and revenue have no dedicated style.
- **Duplicated helpers.** `formatCurrency` is re-implemented in 5 files; `newId` in 3. The tested `@comodities/utils` money module is not used by any screen.
- **Icons are emoji/glyphs** (`🔔`, `⌕`, `‹`, `♡`). No coherent icon language. `@expo/vector-icons` (Ionicons) is now installed for this.
- **Raw errors reach users** — `error.message` from PostgREST rendered directly on Home, Discover, Sell, Inventory, Product detail.
- **Loading is text-only** (`Loading…`). No skeletons anywhere.
- **Web is a single Client Component page** with all styling in one 500-line CSS file; no URL-driven search, no per-page metadata, no product/business routes.
- **`ProductPreview` type lives in `src/data/demo.ts`** next to unused fake data; the type is real, the data is dead.
- **`Alert.prompt`** used for restock is iOS-only — no-op on Android (the primary target).
- **Web CSS palette is hardcoded hex**, drifting from `packages/ui` tokens.
- **Legacy `@comodities/*` package names.** Cosmetic; renaming touches 30+ files — deferred.

## Missing states

- No offline detection (no connectivity listener) → "Everything synced" can show while offline.
- No automatic sync on reconnect; sync is manual or on-screen-mount only.
- Local stock does not decrement while offline; POS shows server stock.
- No payment-method choice (cash hard-coded); no quantity decrement in cart.
- No receipt view after sale.
- No business storefront route (mobile or web).
- No requests backend — request forms are placeholders and must stay clearly labelled.
- Admin has no authentication; metrics-only by design.

## Logo assets — canonical status

Both supplied files (`Zviripo logo.svg`, `Zviripo logo no background.svg`) are **byte-identical** SVG wrappers around the **same 1536×1024 PNG raster with an opaque near-black navy backdrop** (no alpha channel). There is no transparent or true-vector version.

Decision (no redrawing): the exact raster is the canonical asset. `packages/ui/brand/` holds **resized/cropped derivatives only** — full lockup, mark, wordmark — on their native night backdrop. Because the backdrop is baked in, the logo is placed **only on `brand.night` surfaces** (welcome, dark headers, footers). Light-surface placements use the typographic wordmark until a transparent master is supplied. See `ZVIRIPO_DESIGN.md → Logo`.

## Technical debt affecting UX

- Every screen re-fetches on mount; no caching → visible flashes when switching tabs on slow networks.
- Home and Discover render full lists with `.map` inside `ScrollView` — fine at 30 items, not at 2,000. POS and Inventory need `FlatList`.
- `business = businesses[0]` — multi-business users (the seed owner has 5) cannot switch shops.

## Accessibility gaps

- Several tap targets under 48px (`smallAction` 30px, `save` 38px, filter chips 40px).
- Colour-only distinction for low stock (orange number) — needs a label.
- Web has no visible focus styles defined; contrast on `#a9c4b8` detail text over `#0a3527` is borderline.
- No reduced-motion handling (no motion yet either).

## Plan of record

Foundation first (`packages/ui` tokens → shared components), then consumer mobile, merchant mobile + POS, web marketplace, admin, offline/reliability, performance, accessibility, final polish. Refactor only where the existing structure blocks quality; never rewrite the data layer, offline queue, RLS or money model.
