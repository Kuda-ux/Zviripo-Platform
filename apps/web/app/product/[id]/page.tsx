import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMarketplaceListing } from '@comodities/database';
import { formatMinor } from '@comodities/utils';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured) return { title: 'Product' };
  const { data } = await getMarketplaceListing(supabase, id);
  if (!data) return { title: 'Product not found' };
  return {
    title: `${data.product_name} — ${data.business_name}`,
    description: `${data.product_name} for ${formatMinor(data.price_minor, data.currency_code)} at ${data.business_name}${data.business_area ? `, ${data.business_area}` : ''}.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (!isSupabaseConfigured) notFound();
  const { data, error } = await getMarketplaceListing(supabase, id);
  if (error || !data) notFound();

  const inStock = data.available_quantity > 0;
  const phone = data.business_phone?.trim();

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
        <div className="detail-grid">
          <div className="detail-image">
            <span>{data.product_name[0]}</span>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">{(data.category_name ?? 'Product').toUpperCase()}</p>
            <h1 className="detail-title">{data.product_name}</h1>
            {data.product_brand ? <p className="muted-line">Brand: {data.product_brand}</p> : null}
            {data.product_description ? (
              <p className="detail-description">{data.product_description}</p>
            ) : null}
            <div className="detail-price-row">
              <b>{formatMinor(data.price_minor, data.currency_code)}</b>
              <span className={inStock ? 'stock-pill' : 'stock-pill out'}>
                {inStock ? `${data.available_quantity} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="seller-card">
              <small>SELLER</small>
              <strong>{data.business_name}</strong>
              <p>{data.business_area ?? 'Zimbabwe'}</p>
              <div className="seller-actions">
                <Link className="seller-link" href={`/business/${data.business_id}`}>
                  View shop →
                </Link>
                {phone ? (
                  <a className="seller-call" href={`tel:${phone}`}>
                    Call {phone}
                  </a>
                ) : null}
              </div>
            </div>
            <p className="detail-note">
              Contact the shop directly to confirm availability before you travel.
            </p>
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
