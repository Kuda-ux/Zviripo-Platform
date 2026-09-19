import {
  getMarketplaceListing,
  listMarketplace,
  type MarketplaceListing,
} from '@comodities/database';
import { isSupabaseConfigured, supabase } from './supabase';
import type { ProductPreview } from '../data/demo';

const notConfigured =
  'Supabase is not configured. Add your project URL and anon key to .env.local.';

const tones = ['#dff5e9', '#fff0d8', '#e5ecff', '#ffe3e0'];

export function toProductPreview(listing: MarketplaceListing, index = 0): ProductPreview {
  const price =
    listing.currency_code === 'USD'
      ? `$${(listing.price_minor / 100).toFixed(2)}`
      : `Z$ ${(listing.price_minor / 100).toFixed(2)}`;

  return {
    id: listing.listing_id,
    name: listing.product_name,
    shop: listing.business_name,
    price,
    area: listing.business_area ?? 'Nearby',
    distance: 'local',
    tag: `${listing.available_quantity} in stock`,
    tone: tones[index % tones.length],
  };
}

export async function fetchMarketplace(query?: string) {
  if (!isSupabaseConfigured) {
    return { items: [] as ProductPreview[], error: notConfigured };
  }
  const { data, error } = await listMarketplace(supabase, {
    query,
    limit: 30,
  });
  return {
    items: data.map((listing, index) => toProductPreview(listing, index)),
    error: error?.message ?? null,
  };
}

export async function fetchMarketplaceListing(listingId: string) {
  if (!isSupabaseConfigured) {
    return { listing: null, error: notConfigured };
  }
  const { data, error } = await getMarketplaceListing(supabase, listingId);
  return { listing: data, error: error?.message ?? null };
}
