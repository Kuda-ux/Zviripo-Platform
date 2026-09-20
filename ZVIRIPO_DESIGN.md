# ZVIRIPO Design System

Persistent design context for every surface — mobile, consumer web, merchant, POS, admin. `packages/ui` is the single implementation; this file explains the intent behind it.

## Brand DNA

Zviripo is Zimbabwe's digital operating layer for the everyday economy. The interface should feel **premium, confident, warm, practical and commercially serious** — an internationally competitive product that is unmistakably built for Zimbabwean commerce.

Zimbabwean identity comes through **context, not decoration**: real products (roller meal, Mazoe, cement), real places (Mbare, Highfield), USD and ZWG, informal-retail workflows, offline resilience, and plain warm language. Never through patterns, flags, stock photos or "African" illustration.

Tagline: **Find it. Need it. Build with it.**

## Logo

The supplied logo is the identity anchor. Rules:

- Use the exact supplied asset. Never redraw, approximate, CSS-recreate, recolour, distort or add effects.
- The canonical master is a 1536×1024 raster with an **opaque night backdrop**. There is no transparent version yet.
- `packages/ui/brand/` contains derivatives of the exact asset only (resize/crop):
  - `zviripo-lockup-night-{1024,640,320}.{png,webp}` — mark + wordmark + tagline
  - `zviripo-mark-night-{1024,512,192,96}.png` — square mark for icons/avatars
  - `zviripo-wordmark-night-{1024,512,256}.png` — ZVIRIPO + tagline strip
- Place the logo **only on `colors.brand.night` surfaces** so the backdrop is invisible. On light surfaces use the typographic wordmark (`Wordmark` component) until a transparent master exists.
- Missing assets to request from the brand owner: transparent PNG/true SVG of mark and wordmark, monochrome white and dark variants.

Integration points: `Logo` (mobile, `apps/mobile/src/components/brand`), `<img src="/brand/…">` on web/admin, `app.json` icon.

## Colour

```
brand.night      #000A14   logo backdrop; welcome, dark headers, footers
brand.forest     #0A3527   primary surfaces, headings on dark, hero cards
brand.forestDeep #0D5F40   primary buttons, links, active states
brand.emerald    #178D5F   success, availability, positive metrics
brand.soft       #D9ECDF   tinted chips, avatar backgrounds
brand.tint       #EEF6F1   subtle highlighted rows

gold.500         #E8A020   THE primary action on a screen (one per screen)
gold.700         #B77708   warning text, gold on light
gold.100         #FBEED3   warning/attention background

paper            #F5F4EF   app canvas
surface          #FFFFFF   cards, inputs
surfaceElevated  #FFFFFF + shadow.sm
border           #E2E5DC
ink              #101D16   primary text
muted            #54675C   secondary text (AA on paper/surface)

success #0F7A51 · warning #B77708 · danger #C03B2B · info #2F5FA3
```

Rules: gold marks **one** primary action per screen. Do not colour containers gold. Never rely on colour alone — pair with a label or icon. Semantic colours are for state, not decoration.

## Typography

System font (Inter on web, platform sans on native). Roles, not sizes:

| Role      | Size/Line | Weight | Use                                     |
| --------- | --------- | ------ | --------------------------------------- |
| display   | 36/40     | 900    | One hero per screen (welcome, revenue)  |
| headingXl | 30/34     | 900    | Screen titles                           |
| headingLg | 24/28     | 800    | Section hero, product name on detail    |
| headingMd | 20/24     | 800    | Card titles, sheet titles               |
| headingSm | 17/22     | 800    | List item titles                        |
| bodyLg    | 17/24     | 400    | Lede paragraphs                         |
| body      | 15/22     | 400    | Default text                            |
| bodySm    | 13/18     | 400    | Secondary detail                        |
| caption   | 12/16     | 600    | Meta, timestamps                        |
| label     | 11/14     | 800    | Eyebrows, chips — uppercase, tracking 1 |
| numericLg | 34/38     | 900    | Revenue hero, tabular                   |
| numeric   | 20/24     | 900    | Prices in cards, tabular                |
| numericSm | 15/20     | 800    | Prices in rows                          |

Financial numbers always use a `numeric*` role with `fontVariant: ['tabular-nums']` so columns align. Minimum on-screen text size is 11 (labels only); body text never below 13.

## Spacing

Scale: `0 4 8 12 16 20 24 32 40 48 64 80 96` (tokens `spacing[0..24]`). Screen gutter 20. Card padding 16. Section gap 32. No off-scale values.

## Radii

`sm 8 · md 12 · lg 16 · xl 22 · pill 999`. Buttons/inputs `md`. Cards `lg`. Hero cards `xl`. Only chips and status pills use `pill`.

## Elevation

Prefer borders over shadows. `shadow.sm` for elevated surfaces (sticky checkout bar, sheets). No drop shadows on cards in lists.

## Iconography

Ionicons (via `@expo/vector-icons`) on mobile — one family, one stroke. Mapping in `packages/ui/src/icons.ts`: search, location, cart, sell, inventory, business, request, services, opportunities, notifications, receipt, settings, verified, sync, offline, back, save. No emoji in UI.

## Motion

Quick, purposeful, interruptible, reduced-motion aware.

| Token      | Duration | Use                              |
| ---------- | -------- | -------------------------------- |
| micro      | 120ms    | press feedback (scale 0.97)      |
| transition | 200ms    | chip select, toggle, pill change |
| sheet      | 260ms    | bottom sheet, modal              |
| success    | 320ms    | sale recorded, published         |

Respect `AccessibilityInfo.isReduceMotionEnabled` / `prefers-reduced-motion`. Never animate decoratively.

## Components (packages/ui + app-level)

Foundations → primitives (Text roles, Button, Input, Chip, Card) → feedback (EmptyState, ErrorState, Skeleton, SyncStatus, Toast) → commerce (Price, Availability, ProductCard, BusinessCard, SearchBar) → merchant (MetricCard, AttentionCard, StockIndicator, PaymentSelector) → screens.

Screens compose domain components; they do not define styling primitives inline.

## Interaction principles

- Five-second test: the purpose of every screen is obvious immediately.
- Thumb test: primary action reachable one-handed; sticky bottom bars for POS.
- Trust test: local vs server state is always explicit (`saved on this device` ≠ `synced`).
- Progressive disclosure: show what matters; details one tap away.
- Confirmation only where it prevents a meaningful mistake (recording a sale — yes; adding to cart — no).

## States — every data screen

Loading (skeleton, not text) · Empty (what, why, next action) · Error (human message, data-safety statement, retry) · Offline (explicit banner where relevant) · Success (clear, brief).

## Voice

Direct, warm, confident, concise. Say "You're offline. Your sale is safe and will sync when you're back online." Not "A synchronization exception occurred." Say "Nothing here yet." Not "No records were returned." Never expose PostgREST codes or JWT errors — map them via `humanizeError`.

## Anti-patterns

Gradients everywhere · glassmorphism · giant floating cards · everything pill-shaped · tiny text · emoji icons · fake ratings, demand, activity or verification · engagement bait · infinite scroll for its own sake · raw error strings · "Loading…" text · gold containers · decorative "African" motifs · screens that could belong to any SaaS template.
