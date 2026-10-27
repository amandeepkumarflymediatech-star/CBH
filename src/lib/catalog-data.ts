import { CatalogCategory, CatalogSubcategory, CatalogProductFamily, TechnicalVariant } from './catalog-types';

// ============================================================================
// FISCHER-STYLE CATALOG DATA STORE (with global caching for Next.js hot-reloads)
// ============================================================================

export const INITIAL_CATEGORIES: CatalogCategory[] = [
  {
    id: 'cat-steel',
    slug: 'steel-fixings',
    name: 'Steel fixings',
    tagline: 'High load capacity mechanical anchors for heavy duty construction',
    description: 'Fischer steel fixings are mechanical anchors engineered for transferring maximum tensile and shear loads into concrete, natural stone, and masonry.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
    subcategoriesCount: 4,
    productsCount: 38,
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'cat-chemical',
    slug: 'chemical-fixings',
    name: 'Chemical fixings',
    tagline: 'Injection resin systems for expansion-free heavy anchoring',
    description: 'Reaction resin mortar systems, injection cartridges, and capsule anchors for vibration-resistant, close-edge fixings in cracked and non-cracked concrete.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    subcategoriesCount: 3,
    productsCount: 24,
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'cat-high-perf',
    slug: 'high-performance-anchors',
    name: 'High performance anchors',
    tagline: 'Seismic C1/C2 approved heavy duty anchors for infrastructure',
    description: 'Specialized dynamic, seismic, and nuclear grade steel anchoring systems tested under extreme fatigue and shock loadings.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    subcategoriesCount: 2,
    productsCount: 16,
    featured: false,
    sortOrder: 3,
  },
  {
    id: 'cat-nylon',
    slug: 'standard-fixings',
    name: 'Standard nylon fixings',
    tagline: 'Versatile duo-component wall plugs for all building materials',
    description: 'High-grade nylon plugs that adapt dynamically: spread, fold, or knot depending on solid, hollow, or board substrate.',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    subcategoriesCount: 3,
    productsCount: 29,
    featured: false,
    sortOrder: 4,
  },
];

export const INITIAL_SUBCATEGORIES: CatalogSubcategory[] = [
  {
    id: 'sub-bolt-anchor',
    slug: 'bolt-anchor',
    categorySlug: 'steel-fixings',
    name: 'Bolt anchor',
    tagline: 'Heavy-duty expansion anchors for fast push-through installation in concrete',
    description: 'The Fischer bolt anchor series (FAZ II Plus, FBN II) provides ultimate pull-out capacities and maximum fixture versatility with minimal drill effort.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
    familiesCount: 3,
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'sub-concrete-screw',
    slug: 'concrete-screw',
    categorySlug: 'steel-fixings',
    name: 'Concrete screw',
    tagline: 'Self-tapping thread anchors for rapid removable fixings',
    description: 'ULTRACUT FBS II concrete screws cut cleanly into the borehole with zero expansion pressure, enabling minimal edge distances.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    familiesCount: 2,
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'sub-drop-in',
    slug: 'drop-in-anchor',
    categorySlug: 'steel-fixings',
    name: 'Drop-in anchor',
    tagline: 'Internal threaded anchors for temporary bolts and threaded rods',
    description: 'Hammerset flush anchor EA II with internal metric thread for MEP pipe clamps, cable trays, and diamond core drilling rigs.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    familiesCount: 2,
    featured: false,
    sortOrder: 3,
  },
  {
    id: 'sub-sleeve-anchor',
    slug: 'sleeve-anchor',
    categorySlug: 'steel-fixings',
    name: 'Sleeve anchor',
    tagline: 'Full sleeve expansion anchor for solid and multi-brick walls',
    description: 'Heavy duty through-bolt sleeve anchors designed for structural steel columns, gates, and safety railings.',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    familiesCount: 2,
    featured: false,
    sortOrder: 4,
  },
];

export const INITIAL_VARIANTS_FAZ_II_PLUS: TechnicalVariant[] = [
  {
    id: 'var-563458',
    itemNo: '563458',
    artName: 'FAZ II Plus 10/10 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 10,
    effectiveAnchorageDepthMm: 60,
    minDrillHoleDepthMm: 75,
    maxFixtureThicknessMm: 10,
    thread: 'M10 x 20',
    widthAcrossFlatsMm: 17,
    anchorageDepthMm: 68,
    installationTorqueNm: 45,
    totalLengthMm: 95,
    gtin: '4048962450019',
    salesUnit: '50 Pcs/Box',
    packQty: 50,
    unitPriceInr: 85,
    boxPriceInr: 4250,
    stockPcs: 14500,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563459',
    itemNo: '563459',
    artName: 'FAZ II Plus 10/20 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 10,
    effectiveAnchorageDepthMm: 60,
    minDrillHoleDepthMm: 75,
    maxFixtureThicknessMm: 20,
    thread: 'M10 x 20',
    widthAcrossFlatsMm: 17,
    anchorageDepthMm: 68,
    installationTorqueNm: 45,
    totalLengthMm: 105,
    gtin: '4048962450026',
    salesUnit: '50 Pcs/Box',
    packQty: 50,
    unitPriceInr: 92,
    boxPriceInr: 4600,
    stockPcs: 9800,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563460',
    itemNo: '563460',
    artName: 'FAZ II Plus 10/30 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 10,
    effectiveAnchorageDepthMm: 60,
    minDrillHoleDepthMm: 75,
    maxFixtureThicknessMm: 30,
    thread: 'M10 x 20',
    widthAcrossFlatsMm: 17,
    anchorageDepthMm: 68,
    installationTorqueNm: 45,
    totalLengthMm: 115,
    gtin: '4048962450033',
    salesUnit: '50 Pcs/Box',
    packQty: 50,
    unitPriceInr: 98,
    boxPriceInr: 4900,
    stockPcs: 6200,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563462',
    itemNo: '563462',
    artName: 'FAZ II Plus 12/10 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 12,
    effectiveAnchorageDepthMm: 70,
    minDrillHoleDepthMm: 90,
    maxFixtureThicknessMm: 10,
    thread: 'M12 x 25',
    widthAcrossFlatsMm: 19,
    anchorageDepthMm: 80,
    installationTorqueNm: 60,
    totalLengthMm: 110,
    gtin: '4048962450040',
    salesUnit: '20 Pcs/Box',
    packQty: 20,
    unitPriceInr: 145,
    boxPriceInr: 2900,
    stockPcs: 11000,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563463',
    itemNo: '563463',
    artName: 'FAZ II Plus 12/20 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 12,
    effectiveAnchorageDepthMm: 70,
    minDrillHoleDepthMm: 90,
    maxFixtureThicknessMm: 20,
    thread: 'M12 x 25',
    widthAcrossFlatsMm: 19,
    anchorageDepthMm: 80,
    installationTorqueNm: 60,
    totalLengthMm: 120,
    gtin: '4048962450057',
    salesUnit: '20 Pcs/Box',
    packQty: 20,
    unitPriceInr: 155,
    boxPriceInr: 3100,
    stockPcs: 8400,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563465',
    itemNo: '563465',
    artName: 'FAZ II Plus 12/50 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 12,
    effectiveAnchorageDepthMm: 70,
    minDrillHoleDepthMm: 90,
    maxFixtureThicknessMm: 50,
    thread: 'M12 x 25',
    widthAcrossFlatsMm: 19,
    anchorageDepthMm: 80,
    installationTorqueNm: 60,
    totalLengthMm: 150,
    gtin: '4048962450064',
    salesUnit: '20 Pcs/Box',
    packQty: 20,
    unitPriceInr: 180,
    boxPriceInr: 3600,
    stockPcs: 4500,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563470',
    itemNo: '563470',
    artName: 'FAZ II Plus 16/25 gvz',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'gvz',
    materialName: 'Zinc-plated steel',
    drillHoleDiameterMm: 16,
    effectiveAnchorageDepthMm: 85,
    minDrillHoleDepthMm: 110,
    maxFixtureThicknessMm: 25,
    thread: 'M16 x 30',
    widthAcrossFlatsMm: 24,
    anchorageDepthMm: 98,
    installationTorqueNm: 110,
    totalLengthMm: 148,
    gtin: '4048962450071',
    salesUnit: '10 Pcs/Box',
    packQty: 10,
    unitPriceInr: 295,
    boxPriceInr: 2950,
    stockPcs: 3600,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  // Stainless Steel A4 variants
  {
    id: 'var-563481',
    itemNo: '563481',
    artName: 'FAZ II Plus 10/10 A4',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'A4',
    materialName: 'Stainless steel A4',
    drillHoleDiameterMm: 10,
    effectiveAnchorageDepthMm: 60,
    minDrillHoleDepthMm: 75,
    maxFixtureThicknessMm: 10,
    thread: 'M10 x 20',
    widthAcrossFlatsMm: 17,
    anchorageDepthMm: 68,
    installationTorqueNm: 45,
    totalLengthMm: 95,
    gtin: '4048962450088',
    salesUnit: '50 Pcs/Box',
    packQty: 50,
    unitPriceInr: 240,
    boxPriceInr: 12000,
    stockPcs: 4200,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  {
    id: 'var-563484',
    itemNo: '563484',
    artName: 'FAZ II Plus 12/20 A4',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'A4',
    materialName: 'Stainless steel A4',
    drillHoleDiameterMm: 12,
    effectiveAnchorageDepthMm: 70,
    minDrillHoleDepthMm: 90,
    maxFixtureThicknessMm: 20,
    thread: 'M12 x 25',
    widthAcrossFlatsMm: 19,
    anchorageDepthMm: 80,
    installationTorqueNm: 60,
    totalLengthMm: 120,
    gtin: '4048962450095',
    salesUnit: '20 Pcs/Box',
    packQty: 20,
    unitPriceInr: 395,
    boxPriceInr: 7900,
    stockPcs: 2800,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
  // High Corrosion Resistant C variant
  {
    id: 'var-563495',
    itemNo: '563495',
    artName: 'FAZ II Plus 12/20 C (HCR)',
    familySlug: 'bolt-anchor-faz-ii-plus',
    materialCode: 'C',
    materialName: 'Highly corrosion-resistant steel (HCR)',
    drillHoleDiameterMm: 12,
    effectiveAnchorageDepthMm: 70,
    minDrillHoleDepthMm: 90,
    maxFixtureThicknessMm: 20,
    thread: 'M12 x 25',
    widthAcrossFlatsMm: 19,
    anchorageDepthMm: 80,
    installationTorqueNm: 60,
    totalLengthMm: 120,
    gtin: '4048962450101',
    salesUnit: '10 Pcs/Box',
    packQty: 10,
    unitPriceInr: 890,
    boxPriceInr: 8900,
    stockPcs: 650,
    inStock: true,
    etaApproved: true,
    iccApproved: true,
    seismicApproved: 'C1/C2',
    fireResistance: 'R 120',
  },
];

export const INITIAL_FAMILIES: CatalogProductFamily[] = [
  {
    id: 'fam-faz-ii-plus',
    slug: 'bolt-anchor-faz-ii-plus',
    name: 'Bolt anchor FAZ II Plus',
    categorySlug: 'steel-fixings',
    subcategorySlug: 'bolt-anchor',
    headline: 'The bolt anchor for the highest demands in cracked concrete and seismic action',
    claim: 'Maximum tension loads with variable anchorage depths for maximum application versatility',
    description: 'The Fischer bolt anchor FAZ II Plus is the powerful steel anchor for the highest demands in cracked concrete. With tension loads up to 10% higher than predecessors and variable embedment depths, it allows thinner concrete members and reduced drilling effort. Suitable for seismic applications in performance categories C1 and C2.',
    heroImageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    topFeatures: [
      'Up to 10% higher tension loads in cracked concrete compared to previous standards',
      'Variable anchorage depths allow millimeter-precise adaptation to actual loads',
      'First ETA evaluation with a working life of 120 years',
      'Seismic performance categories C1 and C2 certified',
      'Installation without borehole cleaning required (when using hollow drill bits)',
    ],
    advantages: [
      'The tried-and-tested expansion clip ensures maximum load-bearing capacity even in tough conditions.',
      'Reduced drilling and hammer blows save significant time and physical strain on site.',
      'Approval covers solid concrete from C12/15 up to high-strength C80/95.',
      'Available in zinc-plated steel, stainless steel A4, and highly corrosion-resistant steel (HCR 1.4529).',
    ],
    applications: [
      'Steel constructions & heavy industrial framework',
      'Railings, crash barriers, and balustrades',
      'Ladders, cable trays, and MEP brackets',
      'Heavy machinery & crane rail anchors',
      'Façade sub-structures and curtain wall fixings',
      'Temporary and permanent structural supports',
    ],
    buildingMaterials: [
      'Approved for: Cracked and non-cracked concrete C20/25 to C50/60',
      'Also suitable for: Concrete C12/15 and dense natural stone',
    ],
    materialsAvailable: [
      { id: 'gvz', name: 'Zinc-plated steel', code: 'gvz', badgeColor: '#3B82F6', description: 'Electrogalvanised min. 5 µm for indoor dry areas' },
      { id: 'A4', name: 'Stainless steel A4', code: 'A4', badgeColor: '#10B981', description: 'Corrosion resistance class III for outdoor and damp environments' },
      { id: 'C', name: 'Highly corrosion-resistant (HCR)', code: 'C', badgeColor: '#8B5CF6', description: 'Grade 1.4529 for indoor swimming pools, tunnels, and sea air' },
    ],
    approvals: [
      { id: 'app-eta', name: 'European Technical Assessment', code: 'ETA-19/0520', body: 'DIBt Berlin', badgeText: 'ETA Option 1', reportUrl: '#' },
      { id: 'app-icc', name: 'ICC-ES Evaluation Report', code: 'ESR-2948', body: 'ICC-ES USA', badgeText: 'ICC-ES Listed', reportUrl: '#' },
      { id: 'app-seismic', name: 'Seismic Performance', code: 'C1 / C2', body: 'EOTA TR 049', badgeText: 'Seismic C1/C2', reportUrl: '#' },
      { id: 'app-fire', name: 'Fire Resistance Rating', code: 'R 120', body: 'MPA Braunschweig', badgeText: 'Fire 120 min', reportUrl: '#' },
    ],
    installationSteps: [
      { step: 1, title: 'Drill Hole', instruction: 'Create drill hole perpendicular to base surface using standard hammer drill or hollow drill bit.' },
      { step: 2, title: 'Clean Borehole', instruction: 'Blow out dust 4 times and brush 4 times (skip if using hollow vacuum drill bit).' },
      { step: 3, title: 'Drive in Anchor', instruction: 'Drive anchor through fixture into hole using a hammer or machine setting tool until setting depth.' },
      { step: 4, title: 'Apply Torque', instruction: 'Tighten hexagonal nut using calibrated torque wrench to specified installation torque Tinst.' },
    ],
    documents: [
      { id: 'doc-eta', title: 'ETA-19/0520 Evaluation Certificate', category: 'ETA', fileType: 'PDF', fileSize: '2.4 MB', fileUrl: '#', language: 'EN' },
      { id: 'doc-dop', title: 'Declaration of Performance DoP 0244', category: 'DoP', fileType: 'PDF', fileSize: '780 KB', fileUrl: '#', language: 'EN' },
      { id: 'doc-cad', title: 'FAZ II Plus 3D STEP CAD Package', category: 'CAD', fileType: 'ZIP', fileSize: '14.8 MB', fileUrl: '#', language: 'Multi' },
      { id: 'doc-cat', title: 'Steel Fixings Engineering Guide 2026', category: 'Catalog', fileType: 'PDF', fileSize: '8.1 MB', fileUrl: '#', language: 'EN' },
    ],
    variants: INITIAL_VARIANTS_FAZ_II_PLUS,
    featured: true,
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fam-fbn-ii',
    slug: 'bolt-anchor-fbn-ii',
    name: 'Bolt anchor FBN II',
    categorySlug: 'steel-fixings',
    subcategorySlug: 'bolt-anchor',
    headline: 'The cost-effective steel anchor for flexible fixings in non-cracked concrete',
    claim: 'Standard anchor with long thread for tolerance compensation and standoff installations',
    description: 'The Fischer bolt anchor FBN II is an economical choice for static structural installations in non-cracked concrete where cracked assessment is not mandatory.',
    heroImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    ],
    topFeatures: [
      'Standard anchorage depth achieves high load capacities',
      'Reduced anchorage depth saves drilling time and reduces reinforcement hits',
      'Long thread provides flexibility for various fixture thicknesses',
    ],
    advantages: ['Economical choice for structural steel and non-cracked concrete.'],
    applications: ['Steel structures', 'Gates and fences', 'Cantilever brackets'],
    buildingMaterials: ['Non-cracked concrete C20/25 to C50/60'],
    materialsAvailable: [
      { id: 'gvz', name: 'Zinc-plated steel', code: 'gvz', badgeColor: '#3B82F6' },
      { id: 'A4', name: 'Stainless steel A4', code: 'A4', badgeColor: '#10B981' },
    ],
    approvals: [
      { id: 'app-eta-fbn', name: 'ETA Assessment', code: 'ETA-07/0211', body: 'DIBt', badgeText: 'ETA Option 7' },
    ],
    installationSteps: [
      { step: 1, title: 'Drill', instruction: 'Drill hole to specified depth.' },
      { step: 2, title: 'Clean', instruction: 'Blow dust out of hole.' },
      { step: 3, title: 'Insert', instruction: 'Hammer anchor into place.' },
      { step: 4, title: 'Torque', instruction: 'Tighten to specified torque.' },
    ],
    documents: [],
    variants: [
      {
        id: 'var-fbn-10-10',
        itemNo: '40943',
        artName: 'FBN II 10/10 (10x86)',
        familySlug: 'bolt-anchor-fbn-ii',
        materialCode: 'gvz',
        materialName: 'Zinc-plated steel',
        drillHoleDiameterMm: 10,
        effectiveAnchorageDepthMm: 50,
        minDrillHoleDepthMm: 65,
        maxFixtureThicknessMm: 10,
        thread: 'M10 x 20',
        widthAcrossFlatsMm: 17,
        installationTorqueNm: 30,
        totalLengthMm: 86,
        gtin: '4006209409435',
        salesUnit: '50 Pcs/Box',
        packQty: 50,
        unitPriceInr: 54,
        boxPriceInr: 2700,
        stockPcs: 18000,
        inStock: true,
        etaApproved: true,
      },
    ],
    featured: false,
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// GLOBAL IN-MEMORY PERSISTENCE ACROSS RE-RENDERS
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __cbhCatalogCategories: CatalogCategory[] | undefined;
  // eslint-disable-next-line no-var
  var __cbhCatalogSubcategories: CatalogSubcategory[] | undefined;
  // eslint-disable-next-line no-var
  var __cbhCatalogFamilies: CatalogProductFamily[] | undefined;
}

if (!global.__cbhCatalogCategories) {
  global.__cbhCatalogCategories = [...INITIAL_CATEGORIES];
}
if (!global.__cbhCatalogSubcategories) {
  global.__cbhCatalogSubcategories = [...INITIAL_SUBCATEGORIES];
}
if (!global.__cbhCatalogFamilies) {
  global.__cbhCatalogFamilies = [...INITIAL_FAMILIES];
}

export function getSubcategories(categorySlug?: string): CatalogSubcategory[] {
  if (!global.__cbhCatalogSubcategories) {
    global.__cbhCatalogSubcategories = [...INITIAL_SUBCATEGORIES];
  }
  const subs = global.__cbhCatalogSubcategories;
  if (!categorySlug) return subs;
  return subs.filter((s) => s.categorySlug === categorySlug);
}

export function getCategories(): CatalogCategory[] {
  if (!global.__cbhCatalogCategories) {
    global.__cbhCatalogCategories = [...INITIAL_CATEGORIES];
  }
  const subs = getSubcategories();
  return global.__cbhCatalogCategories.map((c) => ({
    ...c,
    subcategoriesCount: subs.filter((s) => s.categorySlug === c.slug).length,
  }));
}

export function getCategoryBySlug(slug: string): CatalogCategory | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function addCategory(category: CatalogCategory): CatalogCategory {
  if (!global.__cbhCatalogCategories) {
    global.__cbhCatalogCategories = [...INITIAL_CATEGORIES];
  }
  global.__cbhCatalogCategories.push(category);
  return category;
}

export function updateCategory(idOrSlug: string, updates: Partial<CatalogCategory>): CatalogCategory | null {
  if (!global.__cbhCatalogCategories) {
    global.__cbhCatalogCategories = [...INITIAL_CATEGORIES];
  }
  const idx = global.__cbhCatalogCategories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (idx === -1) return null;
  global.__cbhCatalogCategories[idx] = { ...global.__cbhCatalogCategories[idx], ...updates };
  return global.__cbhCatalogCategories[idx];
}

export function deleteCategory(idOrSlug: string): CatalogCategory | null {
  if (!global.__cbhCatalogCategories) {
    global.__cbhCatalogCategories = [...INITIAL_CATEGORIES];
  }
  const idx = global.__cbhCatalogCategories.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (idx === -1) return null;
  const removed = global.__cbhCatalogCategories.splice(idx, 1)[0];
  return removed;
}

export function getSubcategoryBySlug(slug: string, categorySlug?: string): CatalogSubcategory | undefined {
  const subs = getSubcategories(categorySlug);
  return subs.find((s) => s.slug === slug);
}

export function addSubcategory(subcategory: CatalogSubcategory): CatalogSubcategory {
  if (!global.__cbhCatalogSubcategories) {
    global.__cbhCatalogSubcategories = [...INITIAL_SUBCATEGORIES];
  }
  global.__cbhCatalogSubcategories.push(subcategory);
  return subcategory;
}

export function updateSubcategory(idOrSlug: string, updates: Partial<CatalogSubcategory>): CatalogSubcategory | null {
  if (!global.__cbhCatalogSubcategories) {
    global.__cbhCatalogSubcategories = [...INITIAL_SUBCATEGORIES];
  }
  const idx = global.__cbhCatalogSubcategories.findIndex((s) => s.id === idOrSlug || s.slug === idOrSlug);
  if (idx === -1) return null;
  global.__cbhCatalogSubcategories[idx] = { ...global.__cbhCatalogSubcategories[idx], ...updates };
  return global.__cbhCatalogSubcategories[idx];
}

export function deleteSubcategory(idOrSlug: string): CatalogSubcategory | null {
  if (!global.__cbhCatalogSubcategories) {
    global.__cbhCatalogSubcategories = [...INITIAL_SUBCATEGORIES];
  }
  const idx = global.__cbhCatalogSubcategories.findIndex((s) => s.id === idOrSlug || s.slug === idOrSlug);
  if (idx === -1) return null;
  const removed = global.__cbhCatalogSubcategories.splice(idx, 1)[0];
  return removed;
}

export function getFamilies(categorySlug?: string, subcategorySlug?: string): CatalogProductFamily[] {
  if (!global.__cbhCatalogFamilies) {
    global.__cbhCatalogFamilies = [...INITIAL_FAMILIES];
  }
  let list = global.__cbhCatalogFamilies;
  if (categorySlug) {
    list = list.filter((f) => f.categorySlug === categorySlug);
  }
  if (subcategorySlug) {
    list = list.filter((f) => f.subcategorySlug === subcategorySlug);
  }
  return list;
}

export function getFamilyBySlug(familySlug: string): CatalogProductFamily | undefined {
  if (!global.__cbhCatalogFamilies) {
    global.__cbhCatalogFamilies = [...INITIAL_FAMILIES];
  }
  return global.__cbhCatalogFamilies.find((f) => f.slug === familySlug);
}

export function resetCatalogToDefault() {
  global.__cbhCatalogCategories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
  global.__cbhCatalogSubcategories = JSON.parse(JSON.stringify(INITIAL_SUBCATEGORIES));
  global.__cbhCatalogFamilies = JSON.parse(JSON.stringify(INITIAL_FAMILIES));
}
