# Testing Strategy

## Unit

Money and pricing, inventory calculations, credit balances, permission helpers, validation, and sync state transitions.

## Integration

POS to inventory, receipt, and marketplace availability; credit sale and repayment; marketplace enquiry; request response; authentication and RLS.

## End to end

Merchant onboarding, offline sale, crash/restart recovery, reconnect and sync, inventory publication, consumer discovery and enquiry, and admin moderation.

## Stress and recovery

Hours offline, hundreds of queued sales, duplicate retries, process termination during sale/upload, device restart, partial upload failure, stale inventory, two merchant devices, clock differences, image failures, low memory, and intermittent networks.

No financial or inventory transaction path ships without idempotency and recovery coverage.
