// ============================================================================
// FISCHER-STYLE DYNAMIC CATALOG TYPES
// Hierarchical 4-Level Architecture:
// Root Products -> Categories -> Subcategories -> Product Families (with Technical Matrix Variants)
// ============================================================================

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  subcategoriesCount?: number;
  productsCount?: number;
  featured?: boolean;
  sortOrder: number;
}

export interface CatalogSubcategory {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  familiesCount?: number;
  featured?: boolean;
  sortOrder: number;
}

export interface ApprovalBadge {
  id: string;
  name: string;
  code: string;
  body: string;
  badgeText: string;
  validUntil?: string;
  reportUrl?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'ETA' | 'DoP' | 'Approval' | 'CAD' | 'Catalog' | 'Test Report';
  fileType: string;
  fileSize: string;
  fileUrl: string;
  language: string;
}

export interface InstallationStep {
  step: number;
  title: string;
  instruction: string;
  imageUrl?: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  code: string;
  badgeColor: string;
  description?: string;
}

export interface TechnicalVariant {
  id: string;
  itemNo: string; // Fischer Item number / SKU, e.g. "563458"
  artName: string; // e.g. "FAZ II Plus 10/10 gvz"
  familySlug: string;
  materialCode: string; // e.g. 'gvz' (Zinc Plated), 'A4' (Stainless Steel), 'C' (HCR)
  materialName: string; // e.g. "Zinc-plated steel", "Stainless steel A4"
  
  // Fischer technical parameters
  drillHoleDiameterMm: number; // d0 [mm]
  effectiveAnchorageDepthMm: number; // hef [mm]
  minDrillHoleDepthMm: number; // h2 [mm]
  maxFixtureThicknessMm: number; // tfix [mm]
  thread: string; // Thread (e.g. M10 x 20)
  widthAcrossFlatsMm: number; // SW [mm]
  anchorageDepthMm?: number; // hnom [mm]
  installationTorqueNm: number; // Tinst [Nm]
  totalLengthMm: number; // l [mm]
  
  // Commercial attributes
  gtin: string; // EAN / GTIN code
  salesUnit: string; // e.g. "100 Pcs", "25 Pcs", "1 Box"
  packQty: number; // e.g. 50
  unitPriceInr: number;
  boxPriceInr: number;
  stockPcs: number;
  inStock: boolean;
  etaApproved: boolean;
  iccApproved?: boolean;
  seismicApproved?: 'C1' | 'C2' | 'C1/C2' | 'None';
  fireResistance?: string; // e.g. "R 120"
}

export interface CatalogProductFamily {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  subcategorySlug: string;
  headline: string;
  claim: string;
  description: string;
  heroImageUrl: string;
  galleryImages: string[];
  cadModelUrl?: string;
  videoUrl?: string;
  
  topFeatures: string[];
  advantages: string[];
  applications: string[];
  buildingMaterials: string[];
  
  materialsAvailable: MaterialOption[];
  approvals: ApprovalBadge[];
  installationSteps: InstallationStep[];
  documents: DocumentItem[];
  variants: TechnicalVariant[];
  
  featured?: boolean;
  sortOrder: number;
  updatedAt: string;
}
