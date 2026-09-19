'use client';

import { useEffect, useState } from 'react';

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

interface Stats {
  configured: boolean;
  error?: string | null;
  merchants?: number;
  listings?: number;
  salesToday?: number;
  syncFailures?: number;
}

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((response) => response.json())
      .then((data: Stats) => setStats(data))
      .catch(() => setStatsError('Could not load platform metrics.'));
  }, []);

  const metrics: [string, string][] = [
    ['Active merchants', stats?.configured ? String(stats.merchants ?? 0) : '—'],
    ['Marketplace listings', stats?.configured ? String(stats.listings ?? 0) : '—'],
    ['Sales today', stats?.configured ? String(stats.salesToday ?? 0) : '—'],
    ['Sync failures', stats?.configured ? String(stats.syncFailures ?? 0) : '—'],
  ];

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
          <span>{stats?.configured ? 'Live data' : 'Development environment'}</span>
        </header>
        <div className="metrics">
          {metrics.map(([label, value]) => (
            <article key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{stats?.configured ? 'Live from Supabase' : 'Awaiting data connection'}</small>
            </article>
          ))}
        </div>
        {statsError || stats?.error ? (
          <div className="admin-state" role="alert">
            <strong>Metrics error</strong>
            <span>{statsError ?? stats?.error}</span>
          </div>
        ) : null}
        <div className="panel">
          <h2>{active} foundation</h2>
          <p>{descriptions[active]}</p>
          <div className="admin-state" role="status">
            <strong>
              {stats?.configured ? 'Live metrics connected' : 'Frontend flow connected'}
            </strong>
            <span>
              {stats?.configured
                ? 'Metrics are aggregated counts from Supabase. Privileged actions remain gated behind admin authentication.'
                : 'Live data and privileged actions remain safely unavailable until admin authentication and Supabase are configured.'}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
