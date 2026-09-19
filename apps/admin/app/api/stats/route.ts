import { NextResponse } from 'next/server';
import { adminSupabase, isServiceConfigured } from '../../../lib/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isServiceConfigured) {
    return NextResponse.json({ configured: false });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [merchants, listings, salesToday, syncFailures] = await Promise.all([
    adminSupabase.from('businesses').select('id', { count: 'exact', head: true }),
    adminSupabase.from('marketplace_listings').select('listing_id', { count: 'exact', head: true }),
    adminSupabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .gte('occurred_at', today.toISOString()),
    adminSupabase
      .from('sync_operations')
      .select('id', { count: 'exact', head: true })
      .in('status', ['failed', 'conflict']),
  ]);

  const error =
    merchants.error?.message ??
    listings.error?.message ??
    salesToday.error?.message ??
    syncFailures.error?.message ??
    null;

  return NextResponse.json({
    configured: true,
    error,
    merchants: merchants.count ?? 0,
    listings: listings.count ?? 0,
    salesToday: salesToday.count ?? 0,
    syncFailures: syncFailures.count ?? 0,
  });
}
