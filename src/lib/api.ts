// API Configuration for Coffee PuLa
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.coffee-pula.com/api'  // Production API
  : 'http://localhost:8081/api';       // Development Go Backend

// API Endpoints
const API_ENDPOINTS = {
  // Menu
  categories: '/categories',
  menu: '/menu',
  
  // Orders
  orders: '/orders',
  
  // Inventory
  ingredients: '/inventory/ingredients',
  stockMovements: '/inventory/movements',
  adjustStock: '/inventory/adjust-stock',
  
  // Recipes
  recipes: '/recipes',
  
  // Promotions
  promotions: '/promotions',
  activePromotions: '/promotions/active',
  calculateDiscount: '/promotions/calculate-discount',
  applyPromotion: '/promotions/apply',
  promotionUsage: '/promotions/usage',
  
  // Coupons
  coupons: '/coupons',
  validateCoupon: '/coupons/validate',
  
  // Receipts
  receipts: '/receipts',
  printReceipt: '/receipts',
  voidReceipt: '/receipts',
  
  // Printers
  printers: '/printers',
  printJobs: '/print-jobs',
  
  // Loyalty Program
  members: '/loyalty/members',
  memberByNumber: '/loyalty/members/number',
  earnPoints: '/loyalty/earn-points',
  redeemPoints: '/loyalty/redeem-points',
  rewards: '/loyalty/rewards',
  memberStats: '/loyalty/stats',
  pointHistory: '/loyalty/members',
  
  // Cost Management
  productCosts: '/cost/products',
  updateProductCost: '/cost/products',
  dailyProfitReport: '/cost/reports/daily',
  productProfitReport: '/cost/reports/products',
  profitAnalytics: '/cost/analytics',
} as const;

// API Helper Functions
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const menuAPI = {
  getCategories: () => apiCall(API_ENDPOINTS.categories),
  getMenu: () => apiCall(API_ENDPOINTS.menu),
  createProduct: (product: any) => apiCall(API_ENDPOINTS.menu, {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  updateProduct: (id: string, product: any) => apiCall(`${API_ENDPOINTS.menu}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  deleteProduct: (id: string) => apiCall(`${API_ENDPOINTS.menu}/${id}`, {
    method: 'DELETE',
  }),
};

export const orderAPI = {
  getOrders: () => apiCall(API_ENDPOINTS.orders),
  createOrder: (order: any) => apiCall(API_ENDPOINTS.orders, {
    method: 'POST',
    body: JSON.stringify(order),
  }),
};

export const inventoryAPI = {
  getIngredients: () => apiCall(API_ENDPOINTS.ingredients),
  createIngredient: (ingredient: any) => apiCall(API_ENDPOINTS.ingredients, {
    method: 'POST',
    body: JSON.stringify(ingredient),
  }),
  getStockMovements: () => apiCall(API_ENDPOINTS.stockMovements),
  adjustStock: (adjustment: any) => apiCall(API_ENDPOINTS.adjustStock, {
    method: 'POST',
    body: JSON.stringify(adjustment),
  }),
};

// Recipe API
export const recipeAPI = {
  getRecipes: () => apiCall(API_ENDPOINTS.recipes),
  createRecipe: (data: any) => apiCall(API_ENDPOINTS.recipes, { method: 'POST', body: JSON.stringify(data) }),
  updateRecipe: (id: string, data: any) => apiCall(`${API_ENDPOINTS.recipes}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecipe: (id: string) => apiCall(`${API_ENDPOINTS.recipes}/${id}`, { method: 'DELETE' }),
};

// Promotion API
export const promotionAPI = {
  getPromotions: () => apiCall(API_ENDPOINTS.promotions),
  getActivePromotions: () => apiCall(API_ENDPOINTS.activePromotions),
  createPromotion: (data: any) => apiCall(API_ENDPOINTS.promotions, { method: 'POST', body: JSON.stringify(data) }),
  updatePromotion: (id: string, data: any) => apiCall(`${API_ENDPOINTS.promotions}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePromotion: (id: string) => apiCall(`${API_ENDPOINTS.promotions}/${id}`, { method: 'DELETE' }),
  calculateDiscount: (data: any) => apiCall(API_ENDPOINTS.calculateDiscount, { method: 'POST', body: JSON.stringify(data) }),
  applyPromotion: (data: any) => apiCall(API_ENDPOINTS.applyPromotion, { method: 'POST', body: JSON.stringify(data) }),
  getUsage: () => apiCall(API_ENDPOINTS.promotionUsage),
};

// Coupon API
export const couponAPI = {
  getCoupons: () => apiCall(API_ENDPOINTS.coupons),
  createCoupon: (data: any) => apiCall(API_ENDPOINTS.coupons, { method: 'POST', body: JSON.stringify(data) }),
  validateCoupon: (code: string) => apiCall(`${API_ENDPOINTS.validateCoupon}/${code}`),
};

// Receipt API
export const receiptAPI = {
  getReceipts: () => apiCall(API_ENDPOINTS.receipts),
  getReceiptById: (id: string) => apiCall(`${API_ENDPOINTS.receipts}/${id}`),
  createReceipt: (data: any) => apiCall(API_ENDPOINTS.receipts, { method: 'POST', body: JSON.stringify(data) }),
  printReceipt: (id: string, data: any) => apiCall(`${API_ENDPOINTS.receipts}/${id}/print`, { method: 'POST', body: JSON.stringify(data) }),
  voidReceipt: (id: string, data: any) => apiCall(`${API_ENDPOINTS.receipts}/${id}/void`, { method: 'POST', body: JSON.stringify(data) }),
};

// Printer API
export const printerAPI = {
  getPrinters: () => apiCall(API_ENDPOINTS.printers),
  createPrinter: (data: any) => apiCall(API_ENDPOINTS.printers, { method: 'POST', body: JSON.stringify(data) }),
  updatePrinter: (id: string, data: any) => apiCall(`${API_ENDPOINTS.printers}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrinter: (id: string) => apiCall(`${API_ENDPOINTS.printers}/${id}`, { method: 'DELETE' }),
  getPrintJobs: () => apiCall(API_ENDPOINTS.printJobs),
};

// Loyalty Program API
export const loyaltyAPI = {
  // Members
  getMembers: (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(API_ENDPOINTS.members + query);
  },
  getMemberById: (id: string) => apiCall(`${API_ENDPOINTS.members}/${id}`),
  getMemberByNumber: (number: string) => apiCall(`${API_ENDPOINTS.memberByNumber}/${number}`),
  createMember: (data: any) => apiCall(API_ENDPOINTS.members, { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id: string, data: any) => apiCall(`${API_ENDPOINTS.members}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Points
  earnPoints: (memberId: string, data: any) => apiCall(API_ENDPOINTS.earnPoints, { method: 'POST', body: JSON.stringify({ member_id: memberId, ...data }) }),
  redeemPoints: (data: any) => apiCall(API_ENDPOINTS.redeemPoints, { method: 'POST', body: JSON.stringify(data) }),
  getPointHistory: (memberId: string, params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`${API_ENDPOINTS.members}/${memberId}/history${query}`);
  },
  
  // Rewards
  getRewards: (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(API_ENDPOINTS.rewards + query);
  },
  
  // Statistics
  getStats: () => apiCall(API_ENDPOINTS.memberStats),
};

// Cost Management API
export const costAPI = {
  // Product Costs
  getProductCosts: () => apiCall(API_ENDPOINTS.productCosts),
  updateProductCost: (productId: string, data: any) => apiCall(`${API_ENDPOINTS.updateProductCost}/${productId}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Reports
  getDailyProfitReport: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiCall(API_ENDPOINTS.dailyProfitReport + query);
  },
  getProductProfitReport: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiCall(API_ENDPOINTS.productProfitReport + query);
  },
  
  // Analytics
  getProfitAnalytics: (days?: number) => {
    const query = days ? `?days=${days}` : '';
    return apiCall(API_ENDPOINTS.profitAnalytics + query);
  },
};

export default API_ENDPOINTS;
