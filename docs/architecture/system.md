# System Architecture

```text
Expo mobile ── online marketplace ───────────────┐
     │                                           │
     └── SQLite transaction + durable sync queue │
                              │                  ▼
                              └──────► Supabase Auth/PostgreSQL/RLS
                                                │ Storage/Realtime/Functions
                                     ┌──────────┴──────────┐
                                     ▼                     ▼
                               Consumer web           Admin portal
```

## Data authority

PostgreSQL is authoritative for shared synchronized data. SQLite commits critical merchant actions immediately and atomically with a durable sync operation. The server accepts operations using stable idempotency keys. An operation is not removed until acknowledged; conflicts remain visible and recoverable.

## Domains

- Identity: profiles, businesses, membership, devices, roles, verification.
- Catalog: categories, products, business products, images.
- Inventory: stock balances and append-only movements.
- Transactions: sales, sale items, payments, receipts.
- Credit: customers, accounts, transactions.
- Marketplace: listings, inventory publications, saves, enquiries.
- Demand: requests, responses, services, jobs, applications.
- Communication: conversations, participants, messages, notifications.
- Safety: reviews, reports, blocks, moderation actions, audit logs.
- Operations: sync operations, attempts, business metrics, aggregated market metrics.

## Sync states

`pending → uploading → synced`, `pending → retry`, or `conflict → resolution → synced`.

Each operation contains operation ID, device ID, entity and operation type, schema version, payload, creation time, attempt count, status, and sanitized last error. Server time and database constraints determine authoritative ordering; device clocks are informational.
