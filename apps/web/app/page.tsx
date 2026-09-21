import Image from 'next/image';
import Link from 'next/link';
import { listMarketplace, type MarketplaceListing } from '@comodities/database';
import { formatMinor } from '@comodities/utils';
import { AuthLink } from '../components/auth-link';
import { SaveButton } from '../components/save-button';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const tones = ['green', 'gold', 'blue', 'ink'];

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  let listings: MarketplaceListing[] = [];
  let error = '';
  if (!isSupabaseConfigured) {
    error =
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load live listings.';
  } else {
    const { data, error: loadError } = await listMarketplace(supabase, {
      query: query || undefined,
      limit: 24,
    });
    if (loadError) error = 'We could not load listings right now. Try again in a moment.';
    else listings = data;
  }

  const featured = listings[0];

  return (
    <main>
      <nav>
        <a className="brand" href="/">
          <Image
            alt=""
            className="brand-mark"
            height={34}
            src="/brand/zviripo-mark-night-192.png"
            width={34}
          />
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
          <form action="/#nearby" className="search" method="get" role="search">
            <span>⌕</span>
            <input
              aria-label="Search products, shops, and services"
              defaultValue={query}
              name="q"
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
            <span className="online">● Live stock</span>
          </div>
          {featured ? (
            <div className="signal-main">
              <small>{featured.business_area ?? 'NEARBY'}</small>
              <strong>{featured.product_name}</strong>
              <p>{featured.business_name}</p>
              <div>
                <b>{formatMinor(featured.price_minor, featured.currency_code)}</b>
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
            <h2>{query ? `Results for “${query}”` : 'Useful things, locally available.'}</h2>
          </div>
          {query ? (
            <a className="text-action" href="/#nearby">
              View everything →
            </a>
          ) : null}
        </div>
        {error ? (
          <div className="notice" role="alert">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="notice" role="status">
            {query
              ? `We could not find “${query}” yet. Need it? Post a request and let nearby businesses know.`
              : 'No public marketplace listings are available yet. Merchants will appear here as they publish stock.'}
          </div>
        ) : (
          <div className="product-grid">
            {listings.map((listing, index) => (
              <article className="product" key={listing.listing_id}>
                <div className={`product-image ${tones[index % tones.length]}`}>
                  <span>{listing.product_name[0]}</span>
                  <SaveButton id={listing.listing_id} label={listing.product_name} />
                </div>
                <Link className="product-body" href={`/product/${listing.listing_id}`}>
                  <div>
                    <strong>{formatMinor(listing.price_minor, listing.currency_code)}</strong>
                    <small>{listing.business_name.toUpperCase()}</small>
                  </div>
                  <h3>{listing.product_name}</h3>
                  <p>{listing.category_name ?? 'General'}</p>
                  <span>
                    {listing.business_area ?? 'Nearby'} · {listing.available_quantity} in stock
                  </span>
                </Link>
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
          <Link className="request-cta" href="/sign-in">
            Post a request
          </Link>
        </div>
        <div className="requests">
          <p className="example-tag">EXAMPLE</p>
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
          <Link className="dark-action" href="/sign-in">
            Set up my business
          </Link>
        </div>
        <div className="dashboard">
          <header>
            <div>
              <small>GOOD MORNING</small>
              <strong>Mbare Value Store</strong>
            </div>
            <span>Example</span>
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
