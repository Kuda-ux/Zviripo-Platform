-- Atomic business creation: inserts the business and the owner membership in
-- one call. SECURITY DEFINER runs as the function owner, so RLS on
-- businesses/business_members does not block the two-step client flow.
create or replace function public.create_business(
  business_name text,
  business_area text default null,
  business_phone text default null
)
returns public.businesses
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_business public.businesses;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.businesses (name, area, phone, status, created_by)
  values (business_name, business_area, business_phone, 'active', uid)
  returning * into new_business;

  insert into public.business_members (business_id, profile_id, role)
  values (new_business.id, uid, 'owner');

  return new_business;
end;
$$;

grant execute on function public.create_business(text, text, text) to authenticated;
