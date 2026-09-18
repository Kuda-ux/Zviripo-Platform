export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BusinessMemberRole = 'owner' | 'manager' | 'cashier';
export type BusinessStatus = 'draft' | 'active' | 'suspended' | 'closed';
export type InventoryMovementType =
  | 'opening'
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return'
  | 'reversal';
export type SaleStatus = 'completed' | 'voided' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit' | 'other';
export type SyncOperationStatus = 'pending' | 'uploading' | 'retry' | 'conflict' | 'synced';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          phone: string | null;
          phone_verified: boolean;
          area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          phone: string | null;
          area: string | null;
          latitude: number | null;
          longitude: number | null;
          status: BusinessStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          phone?: string | null;
          area?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: BusinessStatus;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      business_members: {
        Row: {
          business_id: string;
          profile_id: string;
          role: BusinessMemberRole;
          active: boolean;
          created_at: string;
        };
        Insert: {
          business_id: string;
          profile_id: string;
          role: BusinessMemberRole;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_members']['Insert']>;
      };
      product_categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          brand: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          brand?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      business_products: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          sku: string | null;
          price_minor: number;
          currency_code: 'USD' | 'ZWG';
          active: boolean;
          is_listed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          sku?: string | null;
          price_minor: number;
          currency_code: 'USD' | 'ZWG';
          active?: boolean;
          is_listed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['business_products']['Insert']>;
      };
      inventory: {
        Row: {
          business_product_id: string;
          quantity: number;
          low_stock_threshold: number | null;
          version: number;
          updated_at: string;
        };
        Insert: {
          business_product_id: string;
          quantity?: number;
          low_stock_threshold?: number | null;
          version?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
      };
      devices: {
        Row: {
          id: string;
          profile_id: string;
          business_id: string | null;
          platform: 'android' | 'ios' | 'web';
          app_version: string;
          last_seen_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          profile_id: string;
          business_id?: string | null;
          platform: 'android' | 'ios' | 'web';
          app_version: string;
          last_seen_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['devices']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          business_id: string;
          device_id: string;
          operation_id: string;
          receipt_number: string;
          status: SaleStatus;
          currency_code: 'USD' | 'ZWG';
          subtotal_minor: number;
          discount_minor: number;
          total_minor: number;
          occurred_at: string;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          device_id: string;
          operation_id: string;
          receipt_number: string;
          status?: SaleStatus;
          currency_code: 'USD' | 'ZWG';
          subtotal_minor: number;
          discount_minor?: number;
          total_minor: number;
          occurred_at: string;
          recorded_by: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          business_product_id: string;
          product_name: string;
          quantity: number;
          unit_price_minor: number;
          line_total_minor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          business_product_id: string;
          product_name: string;
          quantity: number;
          unit_price_minor: number;
          line_total_minor: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          sale_id: string;
          method: PaymentMethod;
          amount_minor: number;
          currency_code: 'USD' | 'ZWG';
          reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          method: PaymentMethod;
          amount_minor: number;
          currency_code: 'USD' | 'ZWG';
          reference?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      receipts: {
        Row: {
          id: string;
          sale_id: string;
          public_token_hash: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          public_token_hash: string;
          issued_at?: string;
        };
        Update: Partial<Database['public']['Tables']['receipts']['Insert']>;
      };
      inventory_movements: {
        Row: {
          id: string;
          business_id: string;
          business_product_id: string;
          sale_id: string | null;
          operation_id: string;
          movement_type: InventoryMovementType;
          quantity_delta: number;
          resulting_quantity: number;
          occurred_at: string;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          business_product_id: string;
          sale_id?: string | null;
          operation_id: string;
          movement_type: InventoryMovementType;
          quantity_delta: number;
          resulting_quantity: number;
          occurred_at: string;
          recorded_by: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_movements']['Insert']>;
      };
      sync_operations: {
        Row: {
          operation_id: string;
          device_id: string;
          business_id: string;
          entity_type: string;
          operation_type: string;
          payload_version: number;
          payload: Json;
          client_created_at: string;
          attempt_count: number;
          status: SyncOperationStatus;
          last_error_code: string | null;
          server_created_at: string;
          synced_at: string | null;
        };
        Insert: {
          operation_id: string;
          device_id: string;
          business_id: string;
          entity_type: string;
          operation_type: string;
          payload_version: number;
          payload: Json;
          client_created_at: string;
          attempt_count?: number;
          status?: SyncOperationStatus;
          last_error_code?: string | null;
          server_created_at?: string;
          synced_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['sync_operations']['Insert']>;
      };
    };
    Views: {
      marketplace_listings: {
        Row: {
          listing_id: string;
          business_id: string;
          business_name: string;
          business_slug: string | null;
          business_area: string | null;
          business_latitude: number | null;
          business_longitude: number | null;
          product_id: string;
          product_name: string;
          product_description: string | null;
          product_brand: string | null;
          category_name: string | null;
          sku: string | null;
          price_minor: number;
          currency_code: 'USD' | 'ZWG';
          available_quantity: number;
          is_listed: boolean;
          product_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      is_business_creator: { Args: { target_business_id: string }; Returns: boolean };
      is_business_member: { Args: { target_business_id: string }; Returns: boolean };
      has_business_role: {
        Args: {
          target_business_id: string;
          allowed_roles: BusinessMemberRole[];
        };
        Returns: boolean;
      };
    };
    Enums: {
      business_member_role: BusinessMemberRole;
      business_status: BusinessStatus;
      inventory_movement_type: InventoryMovementType;
      sale_status: SaleStatus;
      payment_method: PaymentMethod;
      sync_operation_status: SyncOperationStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];
