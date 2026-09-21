import { NextResponse } from 'next/server';
import { adminSupabase, isServiceConfigured } from '../../../lib/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isServiceConfigured) {
    return NextResponse.json({ configured: false });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    merchants,
    listings,
    salesToday,
    users,
    syncPending,
    syncFailures,
    outOfStock,
    recentMerchants,
    recentListings,
  ] = await Promise.all([
    adminSupabase.from('businesses').select('id', { count: 'exact', head: true }),
    adminSupabase.from('marketplace_listings').select('listing_id', { count: 'exact', head: true }),
    adminSupabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .gte('occurred_at', today.toISOString()),
    adminSupabase.from('profiles').select('id', { count: 'exact', head: true }),
    adminSupabase
      .from('sync_operations')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'uploading', 'retry']),
    adminSupabase
      .from('sync_operations')
      .select('id', { count: 'exact', head: true })
      .in('status', ['conflict']),
    adminSupabase.from('inventory').select('id', { count: 'exact', head: true }).eq('quantity', 0),
    adminSupabase
      .from('businesses')
      .select('id, name, area, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    adminSupabase
      .from('marketplace_listings')
      .select('listing_id, product_name, business_name, available_quantity, price_minor, currency_code')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const error =
    merchants.error?.message ??
    listings.error?.message ??
    salesToday.error?.message ??
    users.error?.message ??
    syncPending.error?.message ??
    syncFailures.error?.message ??
    outOfStock.error?.message ??
    recentMerchants.error?.message ??
    recentListings.error?.message ??
    null;

  return NextResponse.json({
    configured: true,
    error,
    merchants: merchants.count ?? 0,
    listings: listings.count ?? 0,
    salesToday: salesToday.count ?? 0,
    users: users.count ?? 0,
    syncPending: syncPending.count ?? 0,
    syncFailures: syncFailures.count ?? 0,
    outOfStock: outOfStock.count ?? 0,
    recentMerchants: recentMerchants.data ?? [],
    recentListings: recentListings.data ?? [],
  });
}
