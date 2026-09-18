create extension if not exists pgcrypto;

create type public.business_member_role as enum ('owner', 'manager', 'cashier');
create type public.business_status as enum ('draft', 'active', 'suspended', 'closed');
create type public.inventory_movement_type as enum ('opening', 'purchase', 'sale', 'adjustment', 'return', 'reversal');
create type public.sale_status as enum ('completed', 'voided', 'refunded');
create type public.payment_method as enum ('cash', 'card', 'mobile_money', 'bank_transfer', 'credit', 'other');
create type public.sync_operation_status as enum ('pending', 'uploading', 'retry', 'conflict', 'synced');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 120),
  phone text,
  phone_verified boolean not null default false,
  area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text unique check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 2000),
  phone text,
  area text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status public.business_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.business_member_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (business_id, profile_id)
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.product_categories(id),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id),
  name text not null check (char_length(name) between 1 and 200),
  description text check (description is null or char_length(description) <= 4000),
  brand text check (brand is null or char_length(brand) <= 120),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id),
  sku text,
  price_minor bigint not null check (price_minor >= 0),
  currency_code text not null check (currency_code in ('USD', 'ZWG')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, product_id),
  unique nulls not distinct (business_id, sku)
);

create table public.inventory (
  business_product_id uuid primary key references public.business_products(id) on delete cascade,
  quantity numeric(18, 3) not null default 0,
  low_stock_threshold numeric(18, 3) check (low_stock_threshold is null or low_stock_threshold >= 0),
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'web')),
  app_version text not null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key,
  business_id uuid not null references public.businesses(id),
  device_id uuid not null references public.devices(id),
  operation_id uuid not null unique,
  receipt_number text not null,
  status public.sale_status not null default 'completed',
  currency_code text not null check (currency_code in ('USD', 'ZWG')),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  occurred_at timestamptz not null,
  recorded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (business_id, receipt_number),
  check (total_minor = subtotal_minor - discount_minor)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id),
  business_product_id uuid not null references public.business_products(id),
  product_name text not null,
  quantity numeric(18, 3) not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_total_minor bigint not null check (line_total_minor >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id),
  method public.payment_method not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency_code text not null check (currency_code in ('USD', 'ZWG')),
  reference text,
  created_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null unique references public.sales(id),
  public_token_hash text not null unique,
  issued_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  business_product_id uuid not null references public.business_products(id),
  sale_id uuid references public.sales(id),
  operation_id uuid not null unique,
  movement_type public.inventory_movement_type not null,
  quantity_delta numeric(18, 3) not null check (quantity_delta <> 0),
  resulting_quantity numeric(18, 3) not null,
  occurred_at timestamptz not null,
  recorded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.sync_operations (
  operation_id uuid primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  operation_type text not null check (char_length(operation_type) between 1 and 80),
  payload_version integer not null check (payload_version > 0),
  payload jsonb not null,
  client_created_at timestamptz not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  status public.sync_operation_status not null default 'pending',
  last_error_code text,
  server_created_at timestamptz not null default now(),
  synced_at timestamptz
);

create index business_members_profile_idx on public.business_members(profile_id) where active;
create index business_products_business_idx on public.business_products(business_id) where active;
create index sales_business_occurred_idx on public.sales(business_id, occurred_at desc);
create index inventory_movements_product_idx on public.inventory_movements(business_product_id, occurred_at desc);
create index sync_operations_device_status_idx on public.sync_operations(device_id, status, client_created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''), new.phone);
  return new;
end;
$$;

create function public.is_business_creator(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.businesses
    where id = target_business_id
      and created_by = (select auth.uid())
  );
$$;

create function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and profile_id = (select auth.uid())
      and active
  );
$$;

create function public.has_business_role(target_business_id uuid, allowed_roles public.business_member_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and profile_id = (select auth.uid())
      and role = any(allowed_roles)
      and active
  );
$$;

grant execute on function public.is_business_creator(uuid) to authenticated;
grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.has_business_role(uuid, public.business_member_role[]) to authenticated;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger businesses_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger business_products_updated_at before update on public.business_products for each row execute function public.set_updated_at();
create trigger inventory_updated_at before update on public.inventory for each row execute function public.set_updated_at();
create trigger auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.business_products enable row level security;
alter table public.inventory enable row level security;
alter table public.devices enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.sync_operations enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy businesses_select_member on public.businesses for select to authenticated using (public.is_business_member(id));
create policy businesses_insert_creator on public.businesses for insert to authenticated with check (created_by = (select auth.uid()));
create policy businesses_update_manager on public.businesses for update to authenticated using (public.has_business_role(id, array['owner', 'manager']::public.business_member_role[])) with check (public.has_business_role(id, array['owner', 'manager']::public.business_member_role[]));

create policy members_select_business on public.business_members for select to authenticated using (public.is_business_member(business_id));
create policy members_insert_owner on public.business_members for insert to authenticated with check (public.has_business_role(business_id, array['owner']::public.business_member_role[]) or (profile_id = (select auth.uid()) and role = 'owner' and public.is_business_creator(business_id)));
create policy members_update_owner on public.business_members for update to authenticated using (public.has_business_role(business_id, array['owner']::public.business_member_role[])) with check (public.has_business_role(business_id, array['owner']::public.business_member_role[]));
create policy members_delete_owner on public.business_members for delete to authenticated using (public.has_business_role(business_id, array['owner']::public.business_member_role[]) and not (profile_id = (select auth.uid()) and role = 'owner'));

create policy categories_read_authenticated on public.product_categories for select to authenticated using (active);
create policy products_read_authenticated on public.products for select to authenticated using (true);
create policy products_insert_authenticated on public.products for insert to authenticated with check (created_by = (select auth.uid()));
create policy products_update_creator on public.products for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

create policy business_products_select_member on public.business_products for select to authenticated using (public.is_business_member(business_id));
create policy business_products_insert_manager on public.business_products for insert to authenticated with check (public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[]));
create policy business_products_update_manager on public.business_products for update to authenticated using (public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[])) with check (public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[]));

create policy inventory_select_member on public.inventory for select to authenticated using (exists (select 1 from public.business_products where id = business_product_id and public.is_business_member(business_id)));
create policy inventory_insert_manager on public.inventory for insert to authenticated with check (exists (select 1 from public.business_products where id = business_product_id and public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[])));
create policy inventory_update_manager on public.inventory for update to authenticated using (exists (select 1 from public.business_products where id = business_product_id and public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[]))) with check (exists (select 1 from public.business_products where id = business_product_id and public.has_business_role(business_id, array['owner', 'manager']::public.business_member_role[])));

create policy devices_select_own on public.devices for select to authenticated using (profile_id = (select auth.uid()) and (business_id is null or public.is_business_member(business_id)));
create policy devices_insert_own on public.devices for insert to authenticated with check (profile_id = (select auth.uid()) and (business_id is null or public.is_business_member(business_id)));
create policy devices_update_own on public.devices for update to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()) and (business_id is null or public.is_business_member(business_id)));

create policy sales_select_member on public.sales for select to authenticated using (public.is_business_member(business_id));
create policy sales_insert_member on public.sales for insert to authenticated with check (public.is_business_member(business_id) and recorded_by = (select auth.uid()) and exists (select 1 from public.devices where id = device_id and profile_id = (select auth.uid()) and devices.business_id = sales.business_id));

create policy sale_items_select_member on public.sale_items for select to authenticated using (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));
create policy sale_items_insert_member on public.sale_items for insert to authenticated with check (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));

create policy payments_select_member on public.payments for select to authenticated using (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));
create policy payments_insert_member on public.payments for insert to authenticated with check (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));

create policy receipts_select_member on public.receipts for select to authenticated using (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));
create policy receipts_insert_member on public.receipts for insert to authenticated with check (exists (select 1 from public.sales where id = sale_id and public.is_business_member(business_id)));

create policy movements_select_member on public.inventory_movements for select to authenticated using (public.is_business_member(business_id));
create policy movements_insert_member on public.inventory_movements for insert to authenticated with check (public.is_business_member(business_id) and recorded_by = (select auth.uid()) and exists (select 1 from public.business_products where id = business_product_id and business_products.business_id = inventory_movements.business_id));

create policy sync_select_own_device on public.sync_operations for select to authenticated using (public.is_business_member(business_id) and exists (select 1 from public.devices where id = device_id and profile_id = (select auth.uid())));
create policy sync_insert_own_device on public.sync_operations for insert to authenticated with check (public.is_business_member(business_id) and exists (select 1 from public.devices where id = device_id and profile_id = (select auth.uid()) and devices.business_id = sync_operations.business_id));
