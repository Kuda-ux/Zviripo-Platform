-- ============================================================================
-- Zviripo demo seed — Mbare, Harare
--
-- What this creates:
--   8 product categories
--   5 real-feeling Mbare businesses (tuckshop, fresh produce, phones,
--     fashion, hardware)
--   ~25 products with realistic Zimbabwean USD prices, stock levels and
--     low-stock thresholds — most published to the public marketplace
--   1 device, 3 completed sales with items + payments + inventory movements
--     so the merchant dashboard shows real numbers today
--
-- How to run:
--   1. Apply both migrations first (core commerce + marketplace listings).
--   2. Sign up in the app once — the seed attaches everything to the first
--      profile it finds, so you become the owner of the demo businesses.
--   3. Supabase Dashboard -> SQL Editor -> paste this file -> Run.
--   Safe to re-run: all inserts use fixed ids + ON CONFLICT DO NOTHING.
-- ============================================================================

do $$
declare
  owner uuid;
begin
  select id into owner from public.profiles order by created_at limit 1;
  if owner is null then
    raise exception 'No profiles found. Sign up in the Zviripo app first, then re-run this seed.';
  end if;

  -- ------------------------------------------------------------------------
  -- Categories
  -- ------------------------------------------------------------------------
  insert into public.product_categories (id, name, slug, sort_order) values
    ('ca000000-0000-4000-8000-000000000001', 'Groceries & Food',   'groceries-food',   1),
    ('ca000000-0000-4000-8000-000000000002', 'Fresh Produce',      'fresh-produce',    2),
    ('ca000000-0000-4000-8000-000000000003', 'Electronics',        'electronics',      3),
    ('ca000000-0000-4000-8000-000000000004', 'Clothing & Fashion', 'clothing-fashion', 4),
    ('ca000000-0000-4000-8000-000000000005', 'Hardware & Building','hardware-building',5),
    ('ca000000-0000-4000-8000-000000000006', 'Household',          'household',       6),
    ('ca000000-0000-4000-8000-000000000007', 'Health & Beauty',    'health-beauty',   7),
    ('ca000000-0000-4000-8000-000000000008', 'Services',           'services',        8)
  on conflict (id) do nothing;

  -- ------------------------------------------------------------------------
  -- Businesses (Mbare, Harare — coordinates around Mbare Musika)
  -- ------------------------------------------------------------------------
  insert into public.businesses
    (id, name, slug, description, phone, area, latitude, longitude, status, created_by)
  values
    ('b0000000-0000-4000-8000-000000000001',
     'Mbare Value Store', 'mbare-value-store',
     'General dealer opposite Mbare Musika rank. Groceries, airtime, and household basics at fair prices.',
     '+263 77 210 4521', 'Mbare, Harare', -17.8589, 31.0467, 'active', owner),
    ('b0000000-0000-4000-8000-000000000002',
     'Musika Fresh Produce', 'musika-fresh-produce',
     'Farm-fresh vegetables and fruit straight from the musika. Tomatoes, rape, onions and seasonal fruit daily.',
     '+263 78 556 9032', 'Mbare Musika, Harare', -17.8601, 31.0452, 'active', owner),
    ('b0000000-0000-4000-8000-000000000003',
     'TechPoint Mobile', 'techpoint-mobile',
     'Phones, accessories and repairs. Genuine handsets with receipt — Samsung, itel, Tecno and more.',
     '+263 71 834 6610', 'Mbare, Harare', -17.8575, 31.0489, 'active', owner),
    ('b0000000-0000-4000-8000-000000000004',
     'Ruvheneko Fashions', 'ruvheneko-fashions',
     'Ladies, mens and school wear. New stock every Friday — cash and lay-by accepted.',
     '+263 77 902 3354', 'Mbare, Harare', -17.8594, 31.0481, 'active', owner),
    ('b0000000-0000-4000-8000-000000000005',
     'DuraBuild Hardware', 'durabuild-hardware',
     'Cement, bricks, timber and tools for builders and home improvers. Delivery around Mbare and Southerton.',
     '+263 78 118 7742', 'Mbare, Harare', -17.8612, 31.0503, 'active', owner)
  on conflict (id) do nothing;

  insert into public.business_members (business_id, profile_id, role) values
    ('b0000000-0000-4000-8000-000000000001', owner, 'owner'),
    ('b0000000-0000-4000-8000-000000000002', owner, 'owner'),
    ('b0000000-0000-4000-8000-000000000003', owner, 'owner'),
    ('b0000000-0000-4000-8000-000000000004', owner, 'owner'),
    ('b0000000-0000-4000-8000-000000000005', owner, 'owner')
  on conflict (business_id, profile_id) do nothing;

  -- ------------------------------------------------------------------------
  -- Products (catalogue — created_by the demo owner)
  -- ------------------------------------------------------------------------
  insert into public.products (id, category_id, name, description, brand, created_by) values
    ('e0000000-0000-4000-8000-000000000001', 'ca000000-0000-4000-8000-000000000001',
     'Roller Meal 10kg', 'Refined maize meal, staple for sadza. Milled this week.', 'National Foods', owner),
    ('e0000000-0000-4000-8000-000000000002', 'ca000000-0000-4000-8000-000000000001',
     'Cooking Oil 2L', 'Pure vegetable cooking oil. Family size.', 'Roil', owner),
    ('e0000000-0000-4000-8000-000000000003', 'ca000000-0000-4000-8000-000000000001',
     'Sugar 2kg', 'White granulated sugar.', 'Huletts', owner),
    ('e0000000-0000-4000-8000-000000000004', 'ca000000-0000-4000-8000-000000000001',
     'Rice 2kg', 'Long grain white rice.', 'Mahatma', owner),
    ('e0000000-0000-4000-8000-000000000005', 'ca000000-0000-4000-8000-000000000001',
     'Mazoe Orange 2L', 'The original orange crush cordial.', 'Mazoe', owner),
    ('e0000000-0000-4000-8000-000000000006', 'ca000000-0000-4000-8000-000000000006',
     'Laundry Soap Bar', 'Blue bar soap, 500g. Washes clean.', 'Boom', owner),
    ('e0000000-0000-4000-8000-000000000007', 'ca000000-0000-4000-8000-000000000006',
     'Candles (pack of 6)', 'Reliable light during load shedding.', null, owner),
    ('e0000000-0000-4000-8000-000000000008', 'ca000000-0000-4000-8000-000000000001',
     'EcoCash Airtime $5', 'Instant airtime top-up for any Econet line.', 'Econet', owner),
    ('e0000000-0000-4000-8000-000000000009', 'ca000000-0000-4000-8000-000000000002',
     'Fresh Tomatoes 1kg', 'Grade A tomatoes, delivered this morning.', null, owner),
    ('e0000000-0000-4000-8000-000000000010', 'ca000000-0000-4000-8000-000000000002',
     'Rape Bunch', 'Fresh leafy rape, cut today.', null, owner),
    ('e0000000-0000-4000-8000-000000000011', 'ca000000-0000-4000-8000-000000000002',
     'Onions 1kg', 'Firm brown onions, keeps well.', null, owner),
    ('e0000000-0000-4000-8000-000000000012', 'ca000000-0000-4000-8000-000000000002',
     'Bananas 1kg', 'Sweet ripe bananas.', null, owner),
    ('e0000000-0000-4000-8000-000000000013', 'ca000000-0000-4000-8000-000000000003',
     'Samsung Galaxy A15', '128GB, dual SIM, 5000mAh battery. Boxed with charger and 12-month warranty.', 'Samsung', owner),
    ('e0000000-0000-4000-8000-000000000014', 'ca000000-0000-4000-8000-000000000003',
     'itel A50', '64GB Android Go phone. Great battery life.', 'itel', owner),
    ('e0000000-0000-4000-8000-000000000015', 'ca000000-0000-4000-8000-000000000003',
     'Bluetooth Earphones', 'Wireless earbuds with charging case.', null, owner),
    ('e0000000-0000-4000-8000-000000000016', 'ca000000-0000-4000-8000-000000000003',
     'Solar Charger 20W', 'Panel + power bank combo. Charge phones off-grid.', null, owner),
    ('e0000000-0000-4000-8000-000000000017', 'ca000000-0000-4000-8000-000000000004',
     'Men''s Denim Jeans', 'Straight fit, sizes 30–40.', null, owner),
    ('e0000000-0000-4000-8000-000000000018', 'ca000000-0000-4000-8000-000000000004',
     'School Shirt (White)', 'Boys and girls sizes. Hard-wearing fabric.', null, owner),
    ('e0000000-0000-4000-8000-000000000019', 'ca000000-0000-4000-8000-000000000004',
     'Ladies Summer Dress', 'Ankara print, sizes S–XL.', null, owner),
    ('e0000000-0000-4000-8000-000000000020', 'ca000000-0000-4000-8000-000000000005',
     'PPC Cement 50kg', 'SureBuild 42.5N general purpose cement.', 'PPC', owner),
    ('e0000000-0000-4000-8000-000000000021', 'ca000000-0000-4000-8000-000000000005',
     'Common Bricks (each)', 'Standard clay commons. Bulk discounts over 500.', null, owner),
    ('e0000000-0000-4000-8000-000000000022', 'ca000000-0000-4000-8000-000000000005',
     'Roofing Sheet 3m', 'IBR galvanised sheet, 0.47mm.', null, owner),
    ('e0000000-0000-4000-8000-000000000023', 'ca000000-0000-4000-8000-000000000005',
     'Claw Hammer 500g', 'Steel shaft, rubber grip.', null, owner),
    ('e0000000-0000-4000-8000-000000000024', 'ca000000-0000-4000-8000-000000000007',
     'Petroleum Jelly 250ml', 'Skin protection, household essential.', 'Vaseline', owner),
    ('e0000000-0000-4000-8000-000000000025', 'ca000000-0000-4000-8000-000000000001',
     'Maputi (packet)', 'Roasted maize snack, locally packed.', null, owner)
  on conflict (id) do nothing;

  -- ------------------------------------------------------------------------
  -- Business products (price in minor units, USD cents) + is_listed
  -- ------------------------------------------------------------------------
  insert into public.business_products
    (id, business_id, product_id, sku, price_minor, currency_code, is_listed)
  values
    -- Mbare Value Store (groceries & household)
    ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'RM10',   850, 'USD', true),
    ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'CO2L',   420, 'USD', true),
    ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'SUG2',   280, 'USD', true),
    ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004', 'RICE2',  320, 'USD', true),
    ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000005', 'MAZ2L',  260, 'USD', true),
    ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000006', 'SOAP',    90, 'USD', true),
    ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000007', 'CAND6',  150, 'USD', true),
    ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000008', 'AIR5',   500, 'USD', true),
    ('c0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000024', 'PJ250',  210, 'USD', true),
    ('c0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000025', 'MAPUTI',  50, 'USD', true),
    -- Musika Fresh Produce
    ('c0000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000009', 'TOM1K',  120, 'USD', true),
    ('c0000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000010', 'RAPE',    50, 'USD', true),
    ('c0000000-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000011', 'ONI1K',  150, 'USD', true),
    ('c0000000-0000-4000-8000-000000000014', 'b0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000012', 'BAN1K',  100, 'USD', true),
    -- TechPoint Mobile
    ('c0000000-0000-4000-8000-000000000015', 'b0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000013', 'A15',  16500, 'USD', true),
    ('c0000000-0000-4000-8000-000000000016', 'b0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000014', 'ITELA50', 5900, 'USD', true),
    ('c0000000-0000-4000-8000-000000000017', 'b0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000015', 'EARBUD',  800, 'USD', true),
    ('c0000000-0000-4000-8000-000000000018', 'b0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000016', 'SOLAR20', 2500, 'USD', true),
    -- Ruvheneko Fashions
    ('c0000000-0000-4000-8000-000000000019', 'b0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000017', 'JEANS', 1200, 'USD', true),
    ('c0000000-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000018', 'SCHSHIRT', 600, 'USD', true),
    ('c0000000-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000019', 'DRESS', 1500, 'USD', true),
    -- DuraBuild Hardware (brick unlisted on purpose — shows merchant-only stock)
    ('c0000000-0000-4000-8000-000000000022', 'b0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000020', 'CEM50', 1250, 'USD', true),
    ('c0000000-0000-4000-8000-000000000023', 'b0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000021', 'BRICK',   35, 'USD', false),
    ('c0000000-0000-4000-8000-000000000024', 'b0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000022', 'IBR3M', 2200, 'USD', true),
    ('c0000000-0000-4000-8000-000000000025', 'b0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000023', 'HAMMER', 700, 'USD', true)
  on conflict (id) do nothing;

  -- ------------------------------------------------------------------------
  -- Inventory (low_stock_threshold drives the dashboard "Attention" section)
  -- ------------------------------------------------------------------------
  insert into public.inventory (business_product_id, quantity, low_stock_threshold) values
    ('c0000000-0000-4000-8000-000000000001', 38,  10),
    ('c0000000-0000-4000-8000-000000000002',  2,   5),  -- cooking oil low: shows in Attention
    ('c0000000-0000-4000-8000-000000000003', 24,   8),
    ('c0000000-0000-4000-8000-000000000004', 19,   6),
    ('c0000000-0000-4000-8000-000000000005', 15,   6),
    ('c0000000-0000-4000-8000-000000000006', 60,  15),
    ('c0000000-0000-4000-8000-000000000007', 45,  12),
    ('c0000000-0000-4000-8000-000000000008', 999,  0),
    ('c0000000-0000-4000-8000-000000000009', 30,   8),
    ('c0000000-0000-4000-8000-000000000010', 80,  20),
    ('c0000000-0000-4000-8000-000000000011', 90,  20),
    ('c0000000-0000-4000-8000-000000000012', 120, 30),
    ('c0000000-0000-4000-8000-000000000013', 55,  15),
    ('c0000000-0000-4000-8000-000000000014', 70,  20),
    ('c0000000-0000-4000-8000-000000000015',  6,   2),
    ('c0000000-0000-4000-8000-000000000016', 14,   4),
    ('c0000000-0000-4000-8000-000000000017', 25,   8),
    ('c0000000-0000-4000-8000-000000000018',  9,   3),
    ('c0000000-0000-4000-8000-000000000019', 33,  10),
    ('c0000000-0000-4000-8000-000000000020', 41,  10),
    ('c0000000-0000-4000-8000-000000000021', 18,   5),
    ('c0000000-0000-4000-8000-000000000022', 64,  15),
    ('c0000000-0000-4000-8000-000000000023', 4200, 500),
    ('c0000000-0000-4000-8000-000000000024', 22,   6),
    ('c0000000-0000-4000-8000-000000000025', 17,   5)
  on conflict (business_product_id) do update
    set quantity = excluded.quantity,
        low_stock_threshold = excluded.low_stock_threshold;

  -- ------------------------------------------------------------------------
  -- One registered device so seeded sales satisfy the sales RLS shape
  -- ------------------------------------------------------------------------
  insert into public.devices (id, profile_id, business_id, platform, app_version, last_seen_at)
  values ('d0000000-0000-4000-8000-000000000001', owner,
          'b0000000-0000-4000-8000-000000000001', 'android', '0.1.0', now())
  on conflict (id) do nothing;

  -- ------------------------------------------------------------------------
  -- Three completed sales at Mbare Value Store today
  -- (total_minor = subtotal_minor - discount_minor is enforced by a check)
  -- ------------------------------------------------------------------------
  insert into public.sales
    (id, business_id, device_id, operation_id, receipt_number, currency_code,
     subtotal_minor, discount_minor, total_minor, occurred_at, recorded_by)
  values
    ('5a000000-0000-4000-8000-000000000001',
     'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
     'aa000000-0000-4000-8000-000000000001', 'R-DEMO-001', 'USD',
     1270, 0, 1270, now() - interval '4 hours', owner),
    ('5a000000-0000-4000-8000-000000000002',
     'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
     'aa000000-0000-4000-8000-000000000002', 'R-DEMO-002', 'USD',
     430, 0, 430, now() - interval '2 hours', owner),
    ('5a000000-0000-4000-8000-000000000003',
     'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
     'aa000000-0000-4000-8000-000000000003', 'R-DEMO-003', 'USD',
     1290, 0, 1290, now() - interval '25 minutes', owner)
  on conflict (id) do nothing;

  -- Sale 1: roller meal + cooking oil
  insert into public.sale_items
    (id, sale_id, business_product_id, product_name, quantity, unit_price_minor, line_total_minor)
  values
    ('5b000000-0000-4000-8000-000000000001', '5a000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000001', 'Roller Meal 10kg', 1, 850, 850),
    ('5b000000-0000-4000-8000-000000000002', '5a000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000002', 'Cooking Oil 2L', 1, 420, 420),
    -- Sale 2: sugar + candles
    ('5b000000-0000-4000-8000-000000000003', '5a000000-0000-4000-8000-000000000002',
     'c0000000-0000-4000-8000-000000000003', 'Sugar 2kg', 1, 280, 280),
    ('5b000000-0000-4000-8000-000000000004', '5a000000-0000-4000-8000-000000000002',
     'c0000000-0000-4000-8000-000000000007', 'Candles (pack of 6)', 1, 150, 150),
    -- Sale 3: rice + 4 maputi + airtime + 3 soap bars
    ('5b000000-0000-4000-8000-000000000005', '5a000000-0000-4000-8000-000000000003',
     'c0000000-0000-4000-8000-000000000004', 'Rice 2kg', 1, 320, 320),
    ('5b000000-0000-4000-8000-000000000006', '5a000000-0000-4000-8000-000000000003',
     'c0000000-0000-4000-8000-000000000010', 'Maputi (packet)', 4, 50, 200),
    ('5b000000-0000-4000-8000-000000000007', '5a000000-0000-4000-8000-000000000003',
     'c0000000-0000-4000-8000-000000000008', 'EcoCash Airtime $5', 1, 500, 500),
    ('5b000000-0000-4000-8000-000000000008', '5a000000-0000-4000-8000-000000000003',
     'c0000000-0000-4000-8000-000000000006', 'Laundry Soap Bar', 3, 90, 270)
  on conflict (id) do nothing;

  -- Payments matching each sale (cash + one EcoCash mobile money)
  insert into public.payments
    (id, sale_id, method, amount_minor, currency_code, reference)
  values
    ('5c000000-0000-4000-8000-000000000001', '5a000000-0000-4000-8000-000000000001',
     'cash', 1270, 'USD', null),
    ('5c000000-0000-4000-8000-000000000002', '5a000000-0000-4000-8000-000000000002',
     'mobile_money', 430, 'USD', 'EcoCash 0772104521'),
    ('5c000000-0000-4000-8000-000000000003', '5a000000-0000-4000-8000-000000000003',
     'cash', 1290, 'USD', null)
  on conflict (id) do nothing;

  -- Inventory movements for each sold line (resulting_quantity matches the
  -- inventory table seeded above — stock already reflects these sales)
  insert into public.inventory_movements
    (id, business_id, business_product_id, sale_id, operation_id, movement_type,
     quantity_delta, resulting_quantity, occurred_at, recorded_by)
  values
    ('5d000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000001', '5a000000-0000-4000-8000-000000000001',
     'ae000000-0000-4000-8000-000000000001', 'sale', -1, 38, now() - interval '4 hours', owner),
    ('5d000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000002', '5a000000-0000-4000-8000-000000000001',
     'ae000000-0000-4000-8000-000000000002', 'sale', -1, 2, now() - interval '4 hours', owner),
    ('5d000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000003', '5a000000-0000-4000-8000-000000000002',
     'ae000000-0000-4000-8000-000000000003', 'sale', -1, 24, now() - interval '2 hours', owner),
    ('5d000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000007', '5a000000-0000-4000-8000-000000000002',
     'ae000000-0000-4000-8000-000000000004', 'sale', -1, 45, now() - interval '2 hours', owner),
    ('5d000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000004', '5a000000-0000-4000-8000-000000000003',
     'ae000000-0000-4000-8000-000000000005', 'sale', -1, 19, now() - interval '25 minutes', owner),
    ('5d000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000010', '5a000000-0000-4000-8000-000000000003',
     'ae000000-0000-4000-8000-000000000006', 'sale', -4, 80, now() - interval '25 minutes', owner),
    ('5d000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000008', '5a000000-0000-4000-8000-000000000003',
     'ae000000-0000-4000-8000-000000000007', 'sale', -1, 999, now() - interval '25 minutes', owner),
    ('5d000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001',
     'c0000000-0000-4000-8000-000000000006', '5a000000-0000-4000-8000-000000000003',
     'ae000000-0000-4000-8000-000000000008', 'sale', -3, 60, now() - interval '25 minutes', owner)
  on conflict (id) do nothing;
end $$;
