import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMarketplaceByBusiness } from '@comodities/database';
import { formatMinor } from '@comodities/utils';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured) return { title: 'Shop' };
  const { data } = await getMarketplaceByBusiness(supabase, id);
  if (!data.length) return { title: 'Shop not found' };
  const business = data[0];
  return {
    title: business.business_name,
    description: `${business.business_name}${business.business_area ? ` in ${business.business_area}` : ''} — ${data.length} ${data.length === 1 ? 'product' : 'products'} on Zviripo.`,
  };
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;
  if (!isSupabaseConfigured) notFound();
  const { data, error } = await getMarketplaceByBusiness(supabase, id);
  if (error || !data.length) notFound();

  const business = data[0];
  const phone = business.business_phone?.trim();

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
        <a className="nav-action" href="/sign-in">
          Sign in
        </a>
      </nav>
      <section className="detail">
        <Link className="back-link" href="/#nearby">
          ← Back to marketplace
        </Link>
        <header className="business-header">
          <p className="eyebrow">SHOP</p>
          <h1 className="detail-title">{business.business_name}</h1>
          <p className="muted-line">
            {business.business_area ?? 'Zimbabwe'} · {data.length}{' '}
            {data.length === 1 ? 'product' : 'products'} in stock
          </p>
          {phone ? (
            <a className="seller-call" href={`tel:${phone}`}>
              Call {phone}
            </a>
          ) : null}
        </header>
        <div className="product-grid">
          {data.map((listing, index) => (
            <article className="product" key={listing.listing_id}>
              <div className={`product-image ${['green', 'gold', 'blue', 'ink'][index % 4]}`}>
                <span>{listing.product_name[0]}</span>
              </div>
              <Link className="product-body" href={`/product/${listing.listing_id}`}>
                <div>
                  <strong>{formatMinor(listing.price_minor, listing.currency_code)}</strong>
                  <small>{listing.available_quantity} in stock</small>
                </div>
                <h3>{listing.product_name}</h3>
                <p>{listing.category_name ?? 'General'}</p>
              </Link>
            </article>
          ))}
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
