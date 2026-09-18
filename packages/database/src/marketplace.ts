import type { TypedSupabaseClient, Views } from './index';

export type MarketplaceListing = Views<'marketplace_listings'>;

export interface MarketplaceFilters {
  query?: string;
  area?: string;
  category?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  currency?: 'USD' | 'ZWG';
  limit?: number;
  offset?: number;
}

export async function listMarketplace(
  client: TypedSupabaseClient,
  filters: MarketplaceFilters = {},
) {
  let builder = client
    .from('marketplace_listings')
    .select('*')
    .gt('available_quantity', 0)
    .order('created_at', { ascending: false });

  if (filters.query) {
    builder = builder.or(
      `product_name.ilike.%${filters.query}%,product_description.ilike.%${filters.query}%,business_name.ilike.%${filters.query}%`,
    );
  }
  if (filters.area) {
    builder = builder.eq('business_area', filters.area);
  }
  if (filters.category) {
    builder = builder.eq('category_name', filters.category);
  }
  if (filters.currency) {
    builder = builder.eq('currency_code', filters.currency);
  }
  if (filters.minPriceMinor !== undefined) {
    builder = builder.gte('price_minor', filters.minPriceMinor);
  }
  if (filters.maxPriceMinor !== undefined) {
    builder = builder.lte('price_minor', filters.maxPriceMinor);
  }

  builder = builder.range(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 20) - 1);

  const { data, error } = await builder;
  return { data: data ?? [], error };
}

export async function getMarketplaceListing(client: TypedSupabaseClient, listingId: string) {
  const { data, error } = await client
    .from('marketplace_listings')
    .select('*')
    .eq('listing_id', listingId)
    .single();
  return { data, error };
}

export async function getMarketplaceByBusiness(client: TypedSupabaseClient, businessId: string) {
  const { data, error } = await client
    .from('marketplace_listings')
    .select('*')
    .eq('business_id', businessId)
    .gt('available_quantity', 0)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}
