// ============================================================================
// CBH FASTENERS - TYPESCRIPT TYPE DEFINITIONS
// ============================================================================

export type GlobalUnit = 'PCS' | 'KGS';

export type StandardType = 
  | 'DIN 933' 
  | 'DIN 931' 
  | 'DIN 912' 
  | 'DIN 934' 
  | 'ISO 4017' 
  | 'ASTM A193';

export type GradeType = 
  | '4.6' 
  | '5.8' 
  | '8.8' 
  | '10.9' 
  | '12.9' 
  | 'SS 304' 
  | 'SS 316';

export type FinishType = 
  | 'Black Passivated (BP)' 
  | 'Black Zinc Phosphated (Blkzp)' 
  | 'Hot Dip Galvanized (HDG)' 
  | 'Clear Zinc' 
  | 'Self Natural';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  standard: string;
  grade: string;
  finish: string;
  threadType: string;
  diameter: string;
  lengthMm: number;
  pitchMm: number;
  weightPerPcKg: number; // e.g. 0.0601 kg
  
  // Dual Pricing
  pricePerPiece: number;
  originalPricePerPiece?: number;
  pricePerKg: number;
  originalPricePerKg?: number;
  
  stockPcs: number;
  stockKg: number;
  isInStock: boolean;
  isSurplus?: boolean;
  surplusDiscountPct?: number;
  imageUrl: string;
}

export interface RfqLineItem {
  id: string | number;
  productId: number;
  sku: string;
  name: string;
  standard: string;
  unit: GlobalUnit;
  unitRate: number;
  quantity: number;
  weightPerPcKg: number;
  totalWeightKg: number;
  rowTotal: number;
}

export interface RfqSummary {
  grossAmount: number;
  slabDiscountPct: number;
  slabDiscountAmount: number;
  freightAmount: number;
  gstRatePct: number;
  gstAmount: number;
  netTotal: number;
  totalWeightKg: number;
  tierLabel: string;
  nextTierDelta: number;
  progressPercent: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  itemsCount: number;
  totalWeightKg: number;
  netAmount: number;
  status: 'PROCESSING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  carrier: string;
  trackingNumber: string;
  dispatchDate: string;
  shippingAddress: string;
  mtcCertNumber: string;
}

export interface BulkQuotation {
  id: string;
  rfqNumber: string;
  date: string;
  itemsCount: number;
  grossAmount: number;
  discountPct: number;
  netTotal: number;
  status: 'PENDING' | 'QUOTED' | 'APPROVED' | 'PO_ISSUED';
  validUntil: string;
}
