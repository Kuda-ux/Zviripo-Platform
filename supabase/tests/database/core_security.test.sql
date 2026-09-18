begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

select has_table('public', 'profiles');
select has_table('public', 'businesses');
select has_table('public', 'business_members');
select has_table('public', 'business_products');
select has_table('public', 'inventory');
select has_table('public', 'sales');
select has_table('public', 'inventory_movements');
select has_table('public', 'sync_operations');

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.businesses'::regclass),
  true,
  'businesses has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.business_members'::regclass),
  true,
  'business_members has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.business_products'::regclass),
  true,
  'business_products has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.inventory'::regclass),
  true,
  'inventory has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.sales'::regclass),
  true,
  'sales has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.sale_items'::regclass),
  true,
  'sale_items has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.payments'::regclass),
  true,
  'payments has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.receipts'::regclass),
  true,
  'receipts has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.inventory_movements'::regclass),
  true,
  'inventory_movements has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.devices'::regclass),
  true,
  'devices has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.sync_operations'::regclass),
  true,
  'sync_operations has RLS enabled'
);

select has_function('public', 'is_business_creator', array['uuid']);
select has_function('public', 'is_business_member', array['uuid']);
select has_function('public', 'has_business_role', array['uuid', 'business_member_role[]']);

select col_is_unique('public', 'sales', 'operation_id');

select * from finish();
rollback;
