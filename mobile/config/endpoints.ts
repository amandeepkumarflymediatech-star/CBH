// ============================================================================
// CBH FASTENERS MOBILE APP - ALL WEBSITE API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication & Security
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    CHECK_EMAIL: '/api/auth/check-email',
    RESEND_VERIFICATION: '/api/auth/resend',
  },

  // Products & Inventory Catalog
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: number | string) => `/api/products?id=${id}`,
    CREATE: '/api/products',
    UPDATE: '/api/products',
    DELETE: (id: number | string) => `/api/products?id=${id}`,
    BULK_UPLOAD: '/api/products/bulk-upload',
  },

  // Structured Catalog Taxonomies
  CATALOG: {
    CATEGORIES: '/api/catalog/categories',
    SUBCATEGORIES: '/api/catalog/subcategories',
    FAMILIES: '/api/catalog/families',
    VARIANTS: '/api/catalog/variants',
  },

  // Orders & Dispatch Telemetry
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders?id=${id}`,
    CREATE: '/api/orders',
    UPDATE_STATUS: '/api/orders',
    DELETE: (id: string | number) => `/api/orders?id=${id}`,
  },

  // RFQ (Request for Quotation) & Bulk Quotes
  RFQ: {
    LIST: '/api/rfq',
    DETAIL: (id: string) => `/api/rfq?id=${id}`,
    CREATE: '/api/rfq',
    UPDATE: '/api/rfq',
    DELETE: (id: string | number) => `/api/rfq?id=${id}`,
    CONVERT_TO_PO: '/api/rfq',
  },

  // B2B Enterprise Users & Accounts
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: number) => `/api/users?id=${id}`,
    CREATE: '/api/users',
    UPDATE: '/api/users',
    DELETE: (id: string | number) => `/api/users?id=${id}`,
  },

  // Factory Clearance & Surplus Inventory
  SURPLUS: {
    LIST: '/api/surplus',
    CREATE: '/api/surplus',
    UPDATE: '/api/surplus',
    DELETE: (id: string | number) => `/api/surplus?id=${id}`,
  },

  // ERPNext Integration & Webhook Sync
  ERPNEXT: {
    STATUS: '/api/erpnext/status',
    SYNC: '/api/erpnext/sync',
    WEBHOOK: '/api/erpnext/webhook',
  },

  // PhonePe Payment Gateway
  PAYMENT: {
    PHONEPE_INITIATE: '/api/payment/phonepe/initiate',
    PHONEPE_STATUS: '/api/payment/phonepe/status',
    PHONEPE_CONFIG: '/api/payment/phonepe/config',
    PHONEPE_CALLBACK: '/api/payment/phonepe/callback',
    PHONEPE_REDIRECT: '/api/payment/phonepe/redirect',
  },

  // Content & Media
  BLOGS: '/api/blogs',
  SEO: '/api/seo',
  UPLOAD: '/api/upload',
} as const;

export default API_ENDPOINTS;

