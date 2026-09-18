# Security Model

Supabase Auth owns identity. Business access is granted through server-protected membership records. Every private table must enable RLS and have positive authorization tests proving users cannot access another business's sales, inventory, customers, credit, devices, or sync operations.

Admin authorization is separate from merchant roles, server-controlled, least-privilege, and audited. Sensitive mutations run in database functions or Edge Functions. Clients receive only anonymous public credentials. Service-role and AI credentials never enter mobile or browser bundles.

Uploads validate ownership, file type, and size. Private files use controlled paths or signed access. User input is validated at the client boundary for UX and again at the server boundary for security. Logs, Sentry, and analytics exclude personal messages, customer debt details, financial payloads, credentials, and unnecessary identifiers.
