'use client';

import { useState } from 'react';

const products = [
  {
    name: 'Roller meal 10kg',
    shop: 'Mbare Value Store',
    price: '$8.50',
    meta: '1.2 km · In stock',
    tone: 'green',
  },
  {
    name: 'Broiler starter feed',
    shop: 'Sunrise Agro',
    price: '$29.00',
    meta: '3.4 km · 12 available',
    tone: 'gold',
  },
  {
    name: 'School shoes · Size 5',
    shop: 'Tariro Fashion',
    price: '$18.00',
    meta: '4.1 km · New',
    tone: 'blue',
  },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const toggleSaved = (name: string) =>
    setSaved((items) =>
      items.includes(name) ? items.filter((item) => item !== name) : [...items, name],
    );
  return (
    <main>
      <nav>
        <a className="brand" href="#">
          Comodities
        </a>
        <div className="nav-links">
          <a href="#nearby">Discover</a>
          <a href="#opportunities">Requests</a>
          <a href="#business">For business</a>
        </div>
        <a className="nav-action" href="#business">
          Get started
        </a>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ZIMBABWE COMMERCE, CONNECTED</p>
          <h1>Find what you need, closer to home.</h1>
          <p className="lede">
            Search local products, trusted shops, skilled services and real opportunities—without
            the clutter.
          </p>
          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(
                query.trim()
                  ? `Showing nearby matches for “${query.trim()}”`
                  : 'Enter something to search for nearby.',
              );
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
          <div className="signal-main">
            <small>MBARE · 1.2 KM</small>
            <strong>Roller meal 10kg</strong>
            <p>Mbare Value Store</p>
            <div>
              <b>$8.50</b>
              <span>In stock</span>
            </div>
          </div>
          <p className="signal-note">Availability updates as local shops sell and restock.</p>
        </div>
      </section>
      <section className="section" id="nearby">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NEAR YOU</p>
            <h2>Useful things, locally available.</h2>
          </div>
          <button
            className="text-action"
            onClick={() => setNotice('All available demonstration listings are shown below.')}
          >
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
        <div className="product-grid">
          {products.map((product) => (
            <article className="product" key={product.name}>
              <div className={`product-image ${product.tone}`}>
                <span>{product.name[0]}</span>
                <button
                  aria-label={`${saved.includes(product.name) ? 'Remove' : 'Save'} ${product.name}`}
                  onClick={() => toggleSaved(product.name)}
                >
                  {saved.includes(product.name) ? '♥' : '♡'}
                </button>
              </div>
              <button
                className="product-body"
                onClick={() =>
                  setNotice(
                    `${product.name} from ${product.shop} is available for ${product.price}.`,
                  )
                }
              >
                <div>
                  <strong>{product.price}</strong>
                  <small>VERIFIED SHOP</small>
                </div>
                <h3>{product.name}</h3>
                <p>{product.shop}</p>
                <span>{product.meta}</span>
              </button>
            </article>
          ))}
        </div>
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
        <strong>Comodities</strong>
        <p>Find it. Sell it. Need it. Build with it.</p>
        <span>Built for Zimbabwe’s everyday economy.</span>
      </footer>
    </main>
  );
}
