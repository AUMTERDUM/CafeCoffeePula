// Base types for Coffee PuLa system

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category extends BaseModel {
  name: string;
  description?: string;
}

// Product types
export interface Product extends BaseModel {
  name: string;
  description?: string;
  price: number;
  image?: string;
  available: boolean;
  category_id: string;
  category?: Category;
}

// Order types
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CREDIT';

export interface OrderItem extends BaseModel {
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  order_id: string;
  product_id: string;
  order?: Order;
  product?: Product;
}

export interface Order extends BaseModel {
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  items: OrderItem[];
}

// Inventory types
export interface Ingredient extends BaseModel {
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  supplier?: string;
  notes?: string;
}

export interface Recipe extends BaseModel {
  product_id: string;
  product?: Product;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient extends BaseModel {
  recipe_id: string;
  ingredient_id: string;
  quantity_needed: number;
  recipe?: Recipe;
  ingredient?: Ingredient;
}

export interface StockMovement extends BaseModel {
  ingredient_id: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  ingredient?: Ingredient;
}

// Promotion types
export type PromotionType = 'DISCOUNT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'HAPPY_HOUR' | 'MIN_SPEND';

export interface Promotion extends BaseModel {
  name: string;
  description?: string;
  type: PromotionType;
  discount_percentage?: number;
  discount_amount?: number;
  buy_quantity?: number;
  get_quantity?: number;
  min_spend_amount?: number;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  applicable_categories?: string[];
  applicable_products?: string[];
}

export interface Coupon extends BaseModel {
  code: string;
  promotion_id: string;
  is_used: boolean;
  used_at?: string;
  used_by?: string;
  expires_at?: string;
  promotion?: Promotion;
}

export interface PromotionUsage extends BaseModel {
  promotion_id: string;
  order_id: string;
  coupon_id?: string;
  discount_amount: number;
  promotion?: Promotion;
  order?: Order;
  coupon?: Coupon;
}

// Receipt types
export type ReceiptType = 'FULL' | 'SIMPLE' | 'KITCHEN';
export type ReceiptStatus = 'PENDING' | 'PRINTED' | 'VOIDED';

export interface Receipt extends BaseModel {
  order_id: string;
  order?: Order;
  receipt_number: string;
  type: ReceiptType;
  status: ReceiptStatus;
  company_name: string;
  company_address?: string;
  company_phone?: string;
  company_tax_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_tax_id?: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  qr_code_data?: string;
  qr_code_image_url?: string;
  printed_at?: string;
  printed_by?: string;
  printer_name?: string;
  print_count: number;
  notes?: string;
  footer_message?: string;
  is_voided: boolean;
  voided_at?: string;
  voided_by?: string;
  void_reason?: string;
}

// Printer types
export type ConnectionType = 'USB' | 'NETWORK' | 'BLUETOOTH' | 'SERIAL';

export interface PrinterConfig extends BaseModel {
  name: string;
  type?: string;
  brand?: string;
  model: string;
  connection_type: ConnectionType;
  ip_address?: string;
  port?: number;
  device_path?: string;
  paper_width: number;
  char_per_line: number;
  is_default: boolean;
  is_active: boolean;
  settings?: string; // JSON string for additional settings
}

export interface PrintJob extends BaseModel {
  receipt_id: string;
  receipt?: Receipt;
  printer_id?: string;
  printer?: PrinterConfig;
  status: string;
  content: string;
  copies: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Component Props types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  lowStockItems: number;
  activePromotions: number;
}

// Loyalty Program types
export type MemberTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type PointHistoryType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'BONUS' | 'ADJUST';
export type RewardType = 'FREE_ITEM' | 'DISCOUNT' | 'BUY_X_GET_Y';
export type RedemptionStatus = 'PENDING' | 'USED' | 'EXPIRED' | 'CANCELLED';

export interface Member extends BaseModel {
  member_number: string;
  name: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  total_points: number;
  available_points: number;
  used_points: number;
  total_spent: number;
  total_orders: number;
  last_visit?: string;
  tier: MemberTier;
  is_active: boolean;
  point_histories?: PointHistory[];
  reward_redemptions?: RewardRedemption[];
}

export interface PointHistory extends BaseModel {
  member_id: string;
  member?: Member;
  order_id?: string;
  order?: Order;
  type: PointHistoryType;
  points: number;
  description: string;
  expires_at?: string;
  is_expired: boolean;
  reference_type?: string;
  reference_id?: string;
}

export interface Reward extends BaseModel {
  name: string;
  description?: string;
  type: RewardType;
  point_cost: number;
  required_tier?: MemberTier;
  free_product_id?: string;
  free_product?: Product;
  discount_amount?: number;
  discount_percent?: number;
  buy_quantity?: number;
  get_quantity?: number;
  applicable_products?: string[];
  is_active: boolean;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
  total_redemptions: number;
  redemptions?: RewardRedemption[];
}

export interface RewardRedemption extends BaseModel {
  member_id: string;
  member?: Member;
  reward_id: string;
  reward?: Reward;
  order_id?: string;
  order?: Order;
  points_used: number;
  status: RedemptionStatus;
  used_at?: string;
  expires_at?: string;
  notes?: string;
}

export interface MemberStats {
  total_members: number;
  active_members: number;
  bronze_members: number;
  silver_members: number;
  gold_members: number;
  platinum_members: number;
  total_points_issued: number;
  total_points_redeemed: number;
}

// Cost Management Types
export interface ProductCost extends BaseModel {
  product_id: string;
  product?: Product;
  cost_per_unit: number;
  effective_date: string;
  raw_material_cost?: number;
  labor_cost?: number;
  overhead_cost?: number;
  notes?: string;
  is_active: boolean;
}

export interface DailyProfitReport extends BaseModel {
  report_date: string;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  total_orders: number;
  total_items: number;
  average_order_value: number;
  top_selling_products: string[];
  product_sales_details?: any;
  generated_at: string;
}

export interface ProductProfitReport extends BaseModel {
  product_id: string;
  product?: Product;
  report_date: string;
  quantity_sold: number;
  revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_per_unit: number;
  profit_margin: number;
  generated_at: string;
}

export interface ProfitAnalytics {
  summary: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    total_orders: number;
    average_margin: number;
  };
  daily_profits: Array<{
    date: string;
    profit: number;
    revenue: number;
    cost: number;
    margin: number;
  }>;
  top_profitable_products: Array<{
    product_name: string;
    total_profit: number;
    quantity_sold: number;
    profit_per_unit: number;
    profit_margin: number;
  }>;
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
}
