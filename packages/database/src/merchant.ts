import type { TypedSupabaseClient, Tables, Inserts } from './index.js';

export type Business = Tables<'businesses'>;
export type BusinessMember = Tables<'business_members'>;
export type Product = Tables<'products'>;
export type BusinessProduct = Tables<'business_products'>;
export type Inventory = Tables<'inventory'>;
export type Sale = Tables<'sales'>;
export type SaleItem = Tables<'sale_items'>;
export type Payment = Tables<'payments'>;
export type InventoryMovement = Tables<'inventory_movements'>;

export async function getBusinessesForProfile(client: TypedSupabaseClient, profileId: string) {
  const { data, error } = await client
    .from('business_members')
    .select('role, businesses(*)')
    .eq('profile_id', profileId)
    .eq('active', true);
  return {
    data:
      data?.map((row) => ({
        role: row.role,
        business: row.businesses as unknown as Business,
      })) ?? [],
    error,
  };
}

export async function createBusiness(
  client: TypedSupabaseClient,
  business: Omit<Inserts<'businesses'>, 'created_by'>,
) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { data: null, error: userError };

  const { data, error } = await client
    .from('businesses')
    .insert({ ...business, created_by: userData.user.id })
    .select()
    .single();
  return { data, error };
}

export async function listBusinessProducts(client: TypedSupabaseClient, businessId: string) {
  const { data, error } = await client
    .from('business_products')
    .select('*, products(*), inventory(*)')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  return {
    data:
      data?.map((row) => ({
        ...row,
        product: row.products as unknown as Product | undefined,
        inventory: row.inventory as unknown as Inventory | undefined,
      })) ?? [],
    error,
  };
}

export async function createProduct(
  client: TypedSupabaseClient,
  input: {
    product: Omit<Inserts<'products'>, 'created_by'>;
    businessProduct: Omit<Inserts<'business_products'>, 'product_id' | 'created_by'>;
    initialStock?: number;
    lowStockThreshold?: number;
  },
) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { data: null, error: userError };

  const profileId = userData.user.id;

  const { data: product, error: productError } = await client
    .from('products')
    .insert({ ...input.product, created_by: profileId })
    .select()
    .single();
  if (productError || !product) return { data: null, error: productError };

  const { data: businessProduct, error: bpError } = await client
    .from('business_products')
    .insert({
      ...input.businessProduct,
      product_id: product.id,
    })
    .select()
    .single();
  if (bpError || !businessProduct) {
    return { data: null, error: bpError };
  }

  if (input.initialStock !== undefined && input.initialStock > 0) {
    const { error: invError } = await client.from('inventory').insert({
      business_product_id: businessProduct.id,
      quantity: input.initialStock,
      low_stock_threshold: input.lowStockThreshold ?? null,
    });
    if (invError) return { data: null, error: invError };

    const { error: movementError } = await client.from('inventory_movements').insert({
      business_id: input.businessProduct.business_id,
      business_product_id: businessProduct.id,
      operation_id: crypto.randomUUID(),
      movement_type: 'opening',
      quantity_delta: input.initialStock,
      resulting_quantity: input.initialStock,
      occurred_at: new Date().toISOString(),
      recorded_by: profileId,
    });
    if (movementError) return { data: null, error: movementError };
  }

  return { data: { product, businessProduct }, error: null };
}

export async function updateStock(
  client: TypedSupabaseClient,
  input: {
    businessId: string;
    businessProductId: string;
    delta: number;
    reason: InventoryMovement['movement_type'];
  },
) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { data: null, error: userError };

  const { data: current, error: currentError } = await client
    .from('inventory')
    .select('quantity')
    .eq('business_product_id', input.businessProductId)
    .single();
  if (currentError || !current) return { data: null, error: currentError };

  const resulting = Number(current.quantity) + input.delta;
  if (resulting < 0) {
    return { data: null, error: new Error('Stock cannot go negative') };
  }

  const { error: updateError } = await client
    .from('inventory')
    .update({ quantity: resulting })
    .eq('business_product_id', input.businessProductId);
  if (updateError) return { data: null, error: updateError };

  const { error: movementError } = await client.from('inventory_movements').insert({
    business_id: input.businessId,
    business_product_id: input.businessProductId,
    operation_id: crypto.randomUUID(),
    movement_type: input.reason,
    quantity_delta: input.delta,
    resulting_quantity: resulting,
    occurred_at: new Date().toISOString(),
    recorded_by: userData.user.id,
  });
  if (movementError) return { data: null, error: movementError };

  return { data: { resulting }, error: null };
}

export async function toggleListed(
  client: TypedSupabaseClient,
  businessProductId: string,
  isListed: boolean,
) {
  const { data, error } = await client
    .from('business_products')
    .update({ is_listed: isListed })
    .eq('id', businessProductId)
    .select()
    .single();
  return { data, error };
}

export interface SaleInput {
  businessId: string;
  deviceId: string;
  operationId: string;
  receiptNumber: string;
  currencyCode: 'USD' | 'ZWG';
  subtotalMinor: number;
  discountMinor?: number;
  totalMinor: number;
  occurredAt: string;
  items: Array<{
    businessProductId: string;
    productName: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
  }>;
  payment: {
    method: Payment['method'];
    amountMinor: number;
    reference?: string;
  };
}

export async function recordSale(client: TypedSupabaseClient, input: SaleInput) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { data: null, error: userError };

  const profileId = userData.user.id;

  const saleInsert: Inserts<'sales'> = {
    id: crypto.randomUUID(),
    business_id: input.businessId,
    device_id: input.deviceId,
    operation_id: input.operationId,
    receipt_number: input.receiptNumber,
    currency_code: input.currencyCode,
    subtotal_minor: input.subtotalMinor,
    discount_minor: input.discountMinor ?? 0,
    total_minor: input.totalMinor,
    occurred_at: input.occurredAt,
    recorded_by: profileId,
  };

  const { data: sale, error: saleError } = await client
    .from('sales')
    .insert(saleInsert)
    .select()
    .single();
  if (saleError || !sale) return { data: null, error: saleError };

  const saleItems: Inserts<'sale_items'>[] = input.items.map((item) => ({
    sale_id: sale.id,
    business_product_id: item.businessProductId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price_minor: item.unitPriceMinor,
    line_total_minor: item.lineTotalMinor,
  }));

  const { error: itemsError } = await client.from('sale_items').insert(saleItems);
  if (itemsError) return { data: null, error: itemsError };

  const paymentInsert: Inserts<'payments'> = {
    sale_id: sale.id,
    method: input.payment.method,
    amount_minor: input.payment.amountMinor,
    currency_code: input.currencyCode,
    reference: input.payment.reference ?? null,
  };
  const { error: paymentError } = await client.from('payments').insert(paymentInsert);
  if (paymentError) return { data: null, error: paymentError };

  for (const item of input.items) {
    const { data: inv, error: invError } = await client
      .from('inventory')
      .select('quantity')
      .eq('business_product_id', item.businessProductId)
      .single();
    if (invError || !inv) return { data: null, error: invError };

    const resulting = Number(inv.quantity) - item.quantity;
    if (resulting < 0) {
      return { data: null, error: new Error('Insufficient stock') };
    }

    const { error: updateError } = await client
      .from('inventory')
      .update({ quantity: resulting })
      .eq('business_product_id', item.businessProductId);
    if (updateError) return { data: null, error: updateError };

    const { error: movementError } = await client.from('inventory_movements').insert({
      business_id: input.businessId,
      business_product_id: item.businessProductId,
      sale_id: sale.id,
      operation_id: crypto.randomUUID(),
      movement_type: 'sale',
      quantity_delta: -item.quantity,
      resulting_quantity: resulting,
      occurred_at: input.occurredAt,
      recorded_by: profileId,
    });
    if (movementError) return { data: null, error: movementError };
  }

  return { data: sale, error: null };
}

export async function getSales(client: TypedSupabaseClient, businessId: string, limit = 50) {
  const { data, error } = await client
    .from('sales')
    .select('*, sale_items(*), payments(*)')
    .eq('business_id', businessId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}
