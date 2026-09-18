-- Expose a public, read-only marketplace view without leaking private inventory state.

alter table public.business_products
  add column if not exists is_listed boolean not null default false;

-- Update the business_products manager update policy already covers all columns,
-- but we add a dedicated check so managers can list/unlist their products.
create or replace policy business_products_update_manager
  on public.business_products
  for update
  to authenticated
  using (public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[]))
  with check (public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[]));

-- Public marketplace view. Security invoker is disabled so underlying RLS is bypassed
-- and the view owner (a privileged role) controls exactly what is exposed.
create or replace view public.marketplace_listings
with (security_invoker = false) as
select
  bp.id as listing_id,
  bp.business_id,
  b.name as business_name,
  b.slug as business_slug,
  b.area as business_area,
  b.latitude as business_latitude,
  b.longitude as business_longitude,
  p.id as product_id,
  p.name as product_name,
  p.description as product_description,
  p.brand as product_brand,
  pc.name as category_name,
  bp.sku,
  bp.price_minor,
  bp.currency_code,
  coalesce(i.quantity, 0) as available_quantity,
  bp.is_listed,
  bp.active as product_active,
  bp.created_at,
  bp.updated_at
from public.business_products bp
join public.products p on p.id = bp.product_id
left join public.product_categories pc on pc.id = p.category_id
join public.businesses b on b.id = bp.business_id
left join public.inventory i on i.business_product_id = bp.id
where bp.active = true
  and bp.is_listed = true
  and b.status = 'active';

-- Allow public browsing as well as authenticated discovery.
grant select on public.marketplace_listings to anon, authenticated;

comment on view public.marketplace_listings is
  'Read-only public marketplace catalog. Quantity is derived from canonical inventory.';
