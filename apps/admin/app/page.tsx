'use client';

import { useState } from 'react';

const sections = [
  'Overview',
  'Users',
  'Merchants',
  'Listings',
  'Moderation',
  'Verification',
  'Sync health',
  'Audit logs',
];
const metrics = [
  ['Active merchants', '—'],
  ['Marketplace listings', '—'],
  ['Sales today', '—'],
  ['Sync failures', '—'],
];
const descriptions: Record<string, string> = {
  Overview:
    'Authentication, role-based access, moderation queues and privacy-safe aggregate metrics are ready for connection.',
  Users:
    'Search, user status, trust signals and account controls will appear here after Supabase is connected.',
  Merchants:
    'Merchant activation, verification, inventory publication and operating health will appear here.',
  Listings:
    'Review marketplace availability, listing quality and reports from one operational queue.',
  Moderation:
    'Reported content and factual risk signals will be handled here with an auditable decision trail.',
  Verification:
    'Identity and business verification requests will be reviewed using least-privilege access.',
  'Sync health':
    'Device queues, retries, conflicts and stale app versions will be monitored without exposing transaction payloads.',
  'Audit logs': 'Sensitive administrative actions will be immutable, attributable and searchable.',
};

export default function AdminHome() {
  const [active, setActive] = useState('Overview');
  return (
    <main>
      <aside>
        <strong>Comodities</strong>
        <p>Operations</p>
        {sections.map((item) => (
          <button
            className={active === item ? 'active' : ''}
            key={item}
            onClick={() => setActive(item)}
          >
            {item}
          </button>
        ))}
      </aside>
      <section>
        <header>
          <div>
            <small>COMMAND CENTER</small>
            <h1>{active}</h1>
          </div>
          <span>Development environment</span>
        </header>
        <div className="metrics">
          {metrics.map(([label, value]) => (
            <article key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>Awaiting data connection</small>
            </article>
          ))}
        </div>
        <div className="panel">
          <h2>{active} foundation</h2>
          <p>{descriptions[active]}</p>
          <div className="admin-state" role="status">
            <strong>Frontend flow connected</strong>
            <span>
              Live data and privileged actions remain safely unavailable until admin authentication
              and Supabase are configured.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
