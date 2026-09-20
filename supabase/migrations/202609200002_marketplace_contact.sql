-- Expose the business contact phone on public listings so consumers can
-- reach a shop directly. Additive: CREATE OR REPLACE VIEW appends the
-- new column at the end without breaking existing consumers.
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
  bp.updated_at,
  b.phone as business_phone
from public.business_products bp
join public.products p on p.id = bp.product_id
left join public.product_categories pc on pc.id = p.category_id
join public.businesses b on b.id = bp.business_id
left join public.inventory i on i.business_product_id = bp.id
where bp.active = true
  and bp.is_listed = true
  and b.status = 'active';

grant select on public.marketplace_listings to anon, authenticated;
