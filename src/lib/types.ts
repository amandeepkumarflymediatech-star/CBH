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
  weightPerPcKg: number; // e.g. 0.0601 kg
  weightPer1000PcsKg?: number;
  
  // Dual Pricing
  pricePerPiece: number;
  originalPricePerPiece?: number;
  pricePerKg: number;
  originalPricePerKg?: number;
  price100Pcs?: number;
  price1000Pcs?: number;
  
  // Stock & Inventory
  stockPcs: number;
  stockKg: number;
  stockUom?: string;
  isInStock: boolean;
  isSurplus?: boolean;
  surplusDiscountPct?: number;
  moq?: string;
  leadTimeDays?: number;
  productionDays?: number;
  packingDays?: number;
  minStockLevel?: string | number;
  maxStockLevel?: string | number;

  // Packaging
  pcsPerBox?: number | string;
  smallBoxWeightKg?: number;
  pcsPerMasterCtn?: number | string;
  masterCtnWeightKg?: number;

  // Commercial & Compliance
  brand?: string;
  hsnCode?: string;

  // Media
  imageUrl: string;
  drawingUrl?: string;
  gdriveImageUrl?: string;
  descriptionHtml?: string;
  description?: string;
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
  imageUrl?: string;
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
  gstin?: string;
  deliveryPincode?: string;
  paymentStatus?: string;
  grossAmount?: number;
  gstAmount?: number;
  discountAmount?: number;
  deliveryInstructions?: string;
  erpnextSalesOrderId?: string;
  items?: Array<{
    sku: string;
    name: string;
    standard?: string;
    quantity: number;
    rate: number;
    unit?: string;
    rowTotal?: number;
    weightKg?: number;
    uom?: string;
    imageUrl?: string;
  }>;
}

export interface BulkQuotation {
  id: string;
  rfqNumber: string;
  date: string;
  customerName?: string;
  companyName?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  itemsCount: number;
  totalWeightKg?: number;
  grossAmount: number;
  discountPct: number;
  netTotal: number;
  status: 'PENDING' | 'IN_REVIEW' | 'QUOTED' | 'APPROVED' | 'PO_ISSUED' | 'CONVERTED_TO_PO' | 'REJECTED';
  validUntil: string;
  erpnextQuoteId?: string;
  erpnextSalesOrderId?: string;
  items?: Array<{ sku: string; name: string; quantity: number; rate: number; weightKg?: number }>;
}

export interface UserAccount {
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
  joinedDate?: string;
  ordersCount?: number;
}

export interface SurplusLot {
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


export type ApprovalType = 
  | 'ETA Option 1 (Cracked Concrete)'
  | 'ETA Option 7'
  | 'ICC-ES ESR'
  | 'Seismic C1 & C2'
  | 'Fire Resistance R120'
  | 'VdS Approved'
  | 'CE Marking'
  | 'FM Approved';

export interface TechnicalDocument {
  id: string;
  title: string;
  category: 'ETA_APPROVAL' | 'TECHNICAL_DATA_SHEET' | 'DECLARATION_OF_PERFORMANCE' | 'CAD_BIM_3D' | 'INSTALLATION_MANUAL' | 'MTC_CERTIFICATE';
  docNumber?: string;
  fileSize: string;
  fileFormat: 'PDF' | 'DWG' | 'STEP' | 'BIM' | 'ZIP';
  fileUrl: string;
  language: string;
}

export interface InstallationStep {
  stepNumber: number;
  title: string;
  description: string;
  toolRequired?: string;
  imageUrl?: string;
}

export interface LoadSpecification {
  anchorSize: string; // e.g. "M10"
  effectiveEmbedmentDepthMm: number; // h_ef
  minBaseThicknessMm: number; // h_min
  crackedConcreteTensionKn: number; // N_Rd
  crackedConcreteShearKn: number; // V_Rd
  nonCrackedConcreteTensionKn: number;
  nonCrackedConcreteShearKn: number;
  installationTorqueNm: number; // T_inst
  minEdgeDistanceMm: number; // c_min
  minSpacingMm: number; // s_min
}

export interface TechnicalProductVariant {
  id: string | number;
  articleNumber: string; // e.g. "564580"
  designation: string; // e.g. "FAZ II Plus 10/20 zp"
  slug: string;
  
  // Dimensions matching Fischer specifications
  drillDiameterD0: number; // [mm] d_0
  minDrillHoleDepthH2: number; // [mm] h_2
  maxFixtureThicknessTfix: string; // [mm] t_fix e.g. "20 / 40"
  anchorLengthL: number; // [mm] l
  thread: string; // e.g. "M10 x 63"
  widthAcrossNutSW: number; // [mm] SW
  installationTorqueTinst: number; // [Nm] T_inst
  packagingPcs: number; // [pcs]
  gtin: string; // EAN
  
  // Finish & Approvals
  materialFinish: 'Zinc Plated (zp)' | 'Stainless Steel A4 (R)' | 'High Corrosion (HCR)' | 'Hot-Dip Galvanized (HDG)';
  etaApproval: boolean;
  iccApproval: boolean;
  seismicApproval: 'C1' | 'C2' | 'C1 / C2' | '—';
  fireProtection: boolean;
  
  // Pricing & Stock
  pricePerPiece: number;
  pricePerBox: number;
  stockPcs: number;
  hasCAD: boolean;
  hasDrawing: boolean;
  drawingUrl?: string;
  imageUrl?: string;
}

export interface ProductFamily {
  id: string;
  slug: string; // e.g. "bolt-anchor-faz-ii-plus"
  name: string; // e.g. "Bolt anchor FAZ II Plus"
  categorySlug: string; // e.g. "steel-fixings"
  categoryName: string; // e.g. "Steel fixings"
  subCategorySlug: string; // e.g. "bolt-anchor"
  subCategoryName: string; // e.g. "Bolt anchors"
  
  marketingClaim: string; // e.g. "For highest demands. Powerful and flexible."
  description: string;
  heroImage: string;
  galleryImages: string[];
  videoThumbnail?: string;
  videoUrl?: string;
  
  topFeatures: string[];
  advantages: string[];
  applications: string[];
  baseMaterials: string[];
  approvals: ApprovalType[];
  
  // Engineering & Docs
  installationSteps: InstallationStep[];
  loadSpecs: LoadSpecification[];
  documents: TechnicalDocument[];
  
  // Matrix Table
  variants: TechnicalProductVariant[];
}

export interface ProductSubCategory {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  featuredFamilies: string[]; // slugs
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  iconName: string;
  badge?: string;
  subcategories: ProductSubCategory[];
  familiesCount: number;
  totalSkus: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  featured?: boolean;
  status: 'PUBLISHED' | 'DRAFT';
  views?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type CustomRequestStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'ADDED_TO_CATALOG' | 'REJECTED';

export interface CustomProductRequest {
  id: number;
  requestNumber: string;
  customerId?: number | null;
  customerName: string;
  companyName?: string;
  customerEmail: string;
  customerPhone: string;
  shippingPincode?: string;
  productName: string;
  category: string;
  subCategory?: string;
  standard: string;
  grade: string;
  finish: string;
  threadType: string;
  diameter: string;
  lengthMm: number;
  pitchMm: number;
  sizeFormatted: string;
  quantityRequired: number;
  quantityUom: string;
  targetPrice?: number;
  urgencyLevel: 'SURPLUS_IMMEDIATE' | 'STANDARD' | 'SCHEDULED';
  drawingUrl?: string;
  sampleImageUrl?: string;
  notes?: string;
  status: CustomRequestStatus;
  adminNotes?: string;
  convertedProductId?: number;
  convertedSku?: string;
  erpnextItemCode?: string;
  createdAt: string;
  updatedAt: string;
}



