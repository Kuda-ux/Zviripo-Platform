import {
  getMarketplaceListing,
  listMarketplace,
  type MarketplaceListing,
} from '@comodities/database';
import { isSupabaseConfigured, supabase } from './supabase';
import type { BusinessSummary } from '../components/commerce';

const notConfigured = new Error(
  'Supabase is not configured. Add your project URL and anon key to .env.',
);

export interface MarketplaceResult {
  listings: MarketplaceListing[];
  error: unknown | null;
}

export async function fetchMarketplace(query?: string, limit = 30): Promise<MarketplaceResult> {
  if (!isSupabaseConfigured) return { listings: [], error: notConfigured };
  try {
    const { data, error } = await listMarketplace(supabase, { query, limit });
    return { listings: data, error };
  } catch (error) {
    return { listings: [], error };
  }
}

export async function fetchMarketplaceListing(listingId: string) {
  if (!isSupabaseConfigured) return { listing: null, error: notConfigured };
  try {
    const { data, error } = await getMarketplaceListing(supabase, listingId);
    return { listing: data, error };
  } catch (error) {
    return { listing: null, error };
  }
}

/** Groups listings into businesses for "Shops near you" — derived from real data only. */
export function businessesFrom(listings: MarketplaceListing[]): BusinessSummary[] {
  const map = new Map<string, BusinessSummary>();
  for (const l of listings) {
    const current = map.get(l.business_id);
    if (current) current.listingCount += 1;
    else
      map.set(l.business_id, {
        id: l.business_id,
        name: l.business_name,
        area: l.business_area,
        listingCount: 1,
      });
  }
  return [...map.values()];
}
