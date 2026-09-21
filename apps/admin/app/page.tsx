'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { formatMinor } from '@comodities/utils';

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

interface RecentMerchant {
  id: string;
  name: string;
  area: string | null;
  status: string;
  created_at: string;
}

interface RecentListing {
  listing_id: string;
  product_name: string;
  business_name: string;
  available_quantity: number;
  price_minor: number;
  currency_code: 'USD' | 'ZWG';
}

interface Stats {
  configured: boolean;
  error?: string | null;
  merchants?: number;
  listings?: number;
  salesToday?: number;
  users?: number;
  syncPending?: number;
  syncFailures?: number;
  outOfStock?: number;
  recentMerchants?: RecentMerchant[];
  recentListings?: RecentListing[];
}

const descriptions: Record<string, string> = {
  Overview:
    'Platform-wide aggregate counts from Supabase. Privileged actions remain gated behind admin authentication.',
  Users: 'Registered profiles on the platform. Per-user controls require admin authentication.',
  Merchants:
    'Recently registered businesses. Verification and suspension actions require admin authentication.',
  Listings:
    'Newest products visible on the public marketplace, derived from merchant inventory.',
  Moderation:
    'Reported content and factual risk signals will be handled here with an auditable decision trail. No reports exist yet.',
  Verification:
    'Identity and business verification requests will be reviewed using least-privilege access. No verification queue exists yet.',
  'Sync health':
    'Offline sale queues moving through sync_operations. Conflicts need review; pending items are still in flight.',
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

  const live = Boolean(stats?.configured);
  const num = (value?: number) => (live ? String(value ?? 0) : '—');

  const metrics: [string, string][] = [
    ['Active merchants', num(stats?.merchants)],
    ['Marketplace listings', num(stats?.listings)],
    ['Sales today', num(stats?.salesToday)],
    ['Registered users', num(stats?.users)],
    ['Out of stock', num(stats?.outOfStock)],
    ['Sync conflicts', num(stats?.syncFailures)],
  ];

  return (
    <main>
      <aside>
        <div className="side-brand">
          <Image
            alt=""
            className="brand-mark"
            height={30}
            src="/brand/zviripo-mark-night-192.png"
            width={30}
          />
          <strong>Zviripo</strong>
        </div>
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
          <span>{live ? 'Live data' : 'Development environment'}</span>
        </header>
        <div className="metrics">
          {metrics.map(([label, value]) => (
            <article key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{live ? 'Live from Supabase' : 'Awaiting data connection'}</small>
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
          <h2>{active}</h2>
          <p>{descriptions[active]}</p>
          {active === 'Merchants' && live && stats?.recentMerchants?.length ? (
            <ul className="rows">
              {stats.recentMerchants.map((m) => (
                <li key={m.id}>
                  <div>
                    <strong>{m.name}</strong>
                    <span>{m.area ?? 'Area not set'}</span>
                  </div>
                  <em className={`status status-${m.status}`}>{m.status}</em>
                </li>
              ))}
            </ul>
          ) : null}
          {active === 'Listings' && live && stats?.recentListings?.length ? (
            <ul className="rows">
              {stats.recentListings.map((l) => (
                <li key={l.listing_id}>
                  <div>
                    <strong>{l.product_name}</strong>
                    <span>
                      {l.business_name} · {l.available_quantity} in stock
                    </span>
                  </div>
                  <em>{formatMinor(l.price_minor, l.currency_code)}</em>
                </li>
              ))}
            </ul>
          ) : null}
          {active === 'Sync health' && live ? (
            <div className="sync-grid">
              <article>
                <p>In flight</p>
                <strong>{stats?.syncPending ?? 0}</strong>
                <small>Pending, uploading or retrying</small>
              </article>
              <article>
                <p>Conflicts</p>
                <strong>{stats?.syncFailures ?? 0}</strong>
                <small>Need review before they can sync</small>
              </article>
            </div>
          ) : null}
          <div className="admin-state" role="status">
            <strong>{live ? 'Live metrics connected' : 'Frontend flow connected'}</strong>
            <span>
              {live
                ? 'Metrics are aggregated counts from Supabase. Privileged actions remain gated behind admin authentication.'
                : 'Live data and privileged actions remain safely unavailable until admin authentication and Supabase are configured.'}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
