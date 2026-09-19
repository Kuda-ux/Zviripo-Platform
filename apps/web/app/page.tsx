'use client';

import { useEffect, useState } from 'react';
import { listMarketplace, type MarketplaceListing } from '@comodities/database';
import { AuthLink } from '../components/auth-link';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const tones = ['green', 'gold', 'blue', 'ink'];

function formatPrice(listing: MarketplaceListing) {
  const amount = listing.price_minor / 100;
  if (listing.currency_code === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `Z$ ${amount.toFixed(2)}`;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadListings(search?: string) {
    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load live listings.',
      );
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: loadError } = await listMarketplace(supabase, {
      query: search,
      limit: 24,
    });
    if (loadError) {
      setError(loadError.message);
      setListings([]);
    } else {
      setListings(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadListings();
  }, []);

  const toggleSaved = (id: string) =>
    setSaved((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );

  const featured = listings[0];

  return (
    <main>
      <nav>
        <a className="brand" href="#">
          Zviripo
        </a>
        <div className="nav-links">
          <a href="#nearby">Discover</a>
          <a href="#opportunities">Requests</a>
          <a href="#business">For business</a>
        </div>
        <AuthLink />
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZVIRIPO · ZIMBABWE’S CONNECTED EVERYDAY ECONOMY</p>
          <h1>Find what you need, closer to home.</h1>
          <p className="lede">
            Search local products, trusted shops, skilled services and real opportunities—without
            the clutter.
          </p>
          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              const term = query.trim();
              setNotice(term ? `Searching for “${term}”…` : 'Showing all nearby listings.');
              loadListings(term || undefined);
              document.querySelector('#nearby')?.scrollIntoView();
            }}
          >
            <span>⌕</span>
            <input
              aria-label="Search products, shops, and services"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Chicken feed, a plumber, school shoes..."
            />
            <button type="submit">Search nearby</button>
          </form>
          <div className="quick">
            {[
              ['Buy', '#nearby'],
              ['Sell', '#business'],
              ['Request', '#opportunities'],
              ['Services', '#opportunities'],
            ].map(([action, href]) => (
              <a key={action} href={href}>
                {action}
                <span>→</span>
              </a>
            ))}
          </div>
        </div>
        <div className="signal-card">
          <div className="signal-top">
            <span>LIVE NEAR YOU</span>
            <span className="online">● Updated</span>
          </div>
          {featured ? (
            <div className="signal-main">
              <small>{featured.business_area ?? 'NEARBY'}</small>
              <strong>{featured.product_name}</strong>
              <p>{featured.business_name}</p>
              <div>
                <b>{formatPrice(featured)}</b>
                <span>{featured.available_quantity} in stock</span>
              </div>
            </div>
          ) : (
            <div className="signal-main">
              <small>MARKETPLACE</small>
              <strong>No live listings yet</strong>
              <p>Merchants will appear here as they publish stock.</p>
            </div>
          )}
          <p className="signal-note">Availability updates as local shops sell and restock.</p>
        </div>
      </section>
      <section className="section" id="nearby">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NEAR YOU</p>
            <h2>Useful things, locally available.</h2>
          </div>
          <button className="text-action" onClick={() => loadListings()}>
            View everything →
          </button>
        </div>
        {notice ? (
          <div className="notice" role="status">
            {notice}
            <button aria-label="Dismiss message" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        ) : null}
        {error ? (
          <div className="notice" role="alert">
            {error}
            <button aria-label="Dismiss error" onClick={() => setError('')}>
              ×
            </button>
          </div>
        ) : null}
        {loading ? (
          <div className="product-grid">
            {[0, 1, 2].map((i) => (
              <article className="product" key={i}>
                <div className="product-image">
                  <span>…</span>
                </div>
                <div className="product-body">
                  <div>
                    <strong>Loading</strong>
                    <small>FETCHING</small>
                  </div>
                  <h3>Loading…</h3>
                  <p>Fetching live inventory</p>
                  <span>Please wait</span>
                </div>
              </article>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="notice" role="status">
            No public marketplace listings are available yet. Merchants will appear here as they
            publish stock.
          </div>
        ) : (
          <div className="product-grid">
            {listings.map((listing, index) => (
              <article className="product" key={listing.listing_id}>
                <div className={`product-image ${tones[index % tones.length]}`}>
                  <span>{listing.product_name[0]}</span>
                  <button
                    aria-label={`${saved.includes(listing.listing_id) ? 'Remove' : 'Save'} ${listing.product_name}`}
                    onClick={() => toggleSaved(listing.listing_id)}
                  >
                    {saved.includes(listing.listing_id) ? '♥' : '♡'}
                  </button>
                </div>
                <button
                  className="product-body"
                  onClick={() =>
                    setNotice(
                      `${listing.product_name} from ${listing.business_name} is available for ${formatPrice(listing)}.`,
                    )
                  }
                >
                  <div>
                    <strong>{formatPrice(listing)}</strong>
                    <small>{listing.business_name}</small>
                  </div>
                  <h3>{listing.product_name}</h3>
                  <p>{listing.category_name ?? 'General'}</p>
                  <span>
                    {listing.business_area ?? 'Nearby'} · {listing.available_quantity} in stock
                  </span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="request-section" id="opportunities">
        <div>
          <p className="eyebrow light">REVERSE MARKETPLACE</p>
          <h2>Can’t find it? Ask for it.</h2>
          <p>
            Post what you need, your area, timing and budget. Relevant local businesses and service
            providers can respond.
          </p>
          <button
            onClick={() =>
              setNotice(
                'Request creation will open in the mobile app. Your draft has been started.',
              )
            }
          >
            Post a request
          </button>
        </div>
        <div className="requests">
          <article>
            <small>PRODUCT REQUEST</small>
            <strong>50 bags of cement</strong>
            <p>Highfield · Needed this week</p>
            <span>4 responses</span>
          </article>
          <article>
            <small>SERVICE REQUEST</small>
            <strong>Plumber needed tomorrow</strong>
            <p>Mbare · Urgent</p>
            <span>2 providers nearby</span>
          </article>
        </div>
      </section>
      <section className="business-section" id="business">
        <div className="business-copy">
          <p className="eyebrow">BUILT FOR EVERYDAY BUSINESS</p>
          <h2>Your shop keeps working when the internet doesn’t.</h2>
          <p>
            Fast sales, accurate stock, customer credit and digital receipts—designed for
            inexpensive Android devices and unreliable connectivity.
          </p>
          <button
            className="dark-action"
            onClick={() => setNotice('Business setup is ready to continue in the mobile app.')}
          >
            Set up my business
          </button>
        </div>
        <div className="dashboard">
          <header>
            <div>
              <small>GOOD MORNING</small>
              <strong>Mbare Value Store</strong>
            </div>
            <span>● Everything synced</span>
          </header>
          <div className="today">
            <small>TODAY’S BUSINESS</small>
            <b>$184.50</b>
            <p>32 transactions · 47 items sold</p>
          </div>
          <div className="dashboard-grid">
            <div>
              <small>OUTSTANDING CREDIT</small>
              <strong>$68</strong>
              <p>5 customers</p>
            </div>
            <div>
              <small>LOW STOCK</small>
              <strong>4</strong>
              <p>Review inventory</p>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <strong>Zviripo</strong>
        <p>Find it. Sell it. Need it. Build with it.</p>
        <span>Built for Zimbabwe’s everyday economy.</span>
      </footer>
    </main>
  );
}
