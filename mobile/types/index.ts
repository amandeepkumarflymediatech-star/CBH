// ============================================================================
// CBH FASTENERS MOBILE APP - TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'customer' | 'admin';

export interface MobileAuthUser {
  id: number | string;
  email: string;
  fullName: string;
  companyName: string;
  gstin?: string;
  phone?: string;
  role: UserRole;
  tier?: string;
  tierDiscountPct?: number;
  creditLimit?: number;
  avatar?: string;
  pan?: string;
  msmeRegistrationNumber?: string;
  address?: string;
}

export type GlobalUnit = 'PCS' | 'KGS';

export interface MobileProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  subGroup?: string;
  subCategory?: string;
  standard: string;
  din?: string;
  isoStandard?: string;
  bsStandard?: string;
  asmeStandard?: string;
  grade: string;
  finish: string;
  threadType: string;
  threadLength?: string;
  diameter: string;
  lengthMm: number;
  pitchMm: number;
  sizeFormatted?: string;
  weightPerPcKg: number;
  weightPer1000PcsKg?: number;
  pricePerPiece: number;
  originalPricePerPiece?: number;
  pricePerKg: number;
  originalPricePerKg?: number;
  price100Pcs?: number;
  price1000Pcs?: number;
  stockPcs: number;
  stockKg: number;
  stockUom?: string;
  isInStock: boolean;
  isSurplus?: boolean;
  surplusDiscountPct?: number;
  moq?: string;
  pcsPerBox?: number | string;
  smallBoxWeightKg?: number;
  pcsPerMasterCtn?: number | string;
  masterCtnWeightKg?: number;
  leadTimeDays?: number;
  productionDays?: number;
  packingDays?: number;
  brand?: string;
  imageUrl: string;
  drawingUrl?: string;
  description?: string;
  hsnCode?: string;
}

export interface MobileCartItem {
  product: MobileProduct;
  unit: GlobalUnit;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  totalWeightKg: number;
}

export interface MobileOrder {
  id: string;
  orderNumber: string;
  date: string;
  itemsCount: number;
  totalWeightKg: number;
  netAmount: number;
  status: 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  carrier: string;
  trackingNumber: string;
  dispatchDate: string;
  shippingAddress: string;
  mtcCertNumber: string;
  customerName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  erpnextSalesOrderId?: string;
  items?: Array<{
    sku: string;
    name: string;
    quantity: number;
    rate: number;
    weightKg?: number;
    uom?: string;
  }>;
}

export interface MobileRfq {
  id: string;
  rfqNumber: string;
  date: string;
  customerName?: string;
  companyName?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  shippingPincode?: string;
  itemsCount: number;
  totalWeightKg?: number;
  grossAmount: number;
  discountPct: number;
  netTotal: number;
  status: 'PENDING' | 'IN_REVIEW' | 'QUOTED' | 'APPROVED' | 'PO_ISSUED' | 'CONVERTED_TO_PO' | 'REJECTED';
  validUntil: string;
  globalUnit?: 'PCS' | 'KGS';
  erpnextQuoteId?: string;
  erpnextSalesOrderId?: string;
  items?: Array<{
    sku: string;
    name: string;
    quantity: number;
    rate: number;
    weightKg?: number;
  }>;
}

export interface MobileUserAccount {
  id: number;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  gstin: string;
  role: 'CUSTOMER' | 'ADMIN' | 'METALLURGIST';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'VIP';
  tierDiscountPct: number;
  creditLimit: number;
  isVerified: boolean;
  city?: string;
  createdAt: string;
  ordersCount?: number;
}

export interface MobileSurplusLot {
  id: number;
  sku: string;
  name: string;
  standard: string;
  grade: string;
  excessQtyPcs: number;
  excessQtyKg: number;
  regularPriceKg: number;
  clearanceDiscountPct: number;
  clearancePriceKg: number;
  locationHub: string;
  isActive: boolean;
}

export interface MobileCertificate {
  id: string;
  certNumber: string;
  standard: string;
  grade: string;
  heatNumber: string;
  orderNumber: string;
  issueDate: string;
  productName: string;
  nablLab: string;
  chemicalAnalysis: {
    carbon: string;
    manganese: string;
    phosphorus: string;
    sulfur: string;
    chromium?: string;
  };
  mechanicalTest: {
    tensileStrengthMpa: number;
    yieldStrengthMpa: number;
    elongationPct: number;
    hardnessHrc: string;
  };
}

export interface MobileCategory {
  id?: string | number;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  subcategoriesCount?: number;
  productsCount?: number;
  featured?: boolean;
}

export interface PhonePeConfigMobile {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  enableSimulator: boolean;
  defaultCallbackUrl: string;
  defaultRedirectUrl: string;
  autoConfirmOrders: boolean;
}

export interface ErpNextConfigMobile {
  erpUrl: string;
  apiKey: string;
  apiSecret: string;
  priceList: string;
  warehouse: string;
  autoSync: boolean;
}

export interface MobileApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

