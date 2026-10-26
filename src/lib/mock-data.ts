// ============================================================================
// CBH FASTENERS - PRODUCT CATALOG & INITIAL REPOSITORY DATA
// Based on exact extracted data from https://cbh.store
// ============================================================================

import { Product, CustomerOrder, BulkQuotation, UserAccount, SurplusLot, BlogPost } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'CBH-933-M10-100-BP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X100M-Grade 5.8 Bp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 BP',
    finish: 'Black Passivated (BP)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 100,
    pitchMm: 1.5,
    weightPerPcKg: 0.0601,
    pricePerPiece: 5.39,
    originalPricePerPiece: 6.36,
    pricePerKg: 89.64,
    originalPricePerKg: 105.78,
    stockPcs: 15400,
    stockKg: 925.5,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 2,
    sku: 'CBH-933-M10-110-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X110M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 110,
    pitchMm: 1.5,
    weightPerPcKg: 0.0631,
    pricePerPiece: 9.14,
    originalPricePerPiece: 9.14,
    pricePerKg: 144.78,
    originalPricePerKg: 144.78,
    stockPcs: 18200,
    stockKg: 1148.4,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 3,
    sku: 'CBH-933-M10-120-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X120M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 120,
    pitchMm: 1.5,
    weightPerPcKg: 0.0680,
    pricePerPiece: 9.84,
    originalPricePerPiece: 9.84,
    pricePerKg: 144.78,
    originalPricePerKg: 144.78,
    stockPcs: 22000,
    stockKg: 1496.0,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 4,
    sku: 'CBH-933-M10-125-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X125M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 125,
    pitchMm: 1.5,
    weightPerPcKg: 0.0721,
    pricePerPiece: 10.44,
    originalPricePerPiece: 10.44,
    pricePerKg: 144.78,
    originalPricePerKg: 144.78,
    stockPcs: 14500,
    stockKg: 1045.4,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 5,
    sku: 'CBH-933-M10-12-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X12M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 12,
    pitchMm: 1.5,
    weightPerPcKg: 0.0164,
    pricePerPiece: 2.49,
    originalPricePerPiece: 2.49,
    pricePerKg: 151.62,
    originalPricePerKg: 151.62,
    stockPcs: 45000,
    stockKg: 738.0,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 6,
    sku: 'CBH-933-M10-130-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X130M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 130,
    pitchMm: 1.5,
    weightPerPcKg: 0.0746,
    pricePerPiece: 10.80,
    originalPricePerPiece: 10.80,
    pricePerKg: 144.78,
    originalPricePerKg: 144.78,
    stockPcs: 11000,
    stockKg: 820.6,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 7,
    sku: 'CBH-933-M10-140-BZP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X140M-Grade 5.8 Blkzp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 Blkzp',
    finish: 'Black Zinc Phosphated (Blkzp)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 140,
    pitchMm: 1.5,
    weightPerPcKg: 0.0775,
    pricePerPiece: 10.62,
    originalPricePerPiece: 26.54,
    pricePerKg: 137.00,
    originalPricePerKg: 343.00,
    stockPcs: 28000,
    stockKg: 2170.0,
    isInStock: true,
    isSurplus: true,
    surplusDiscountPct: 60,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 8,
    sku: 'CBH-933-M10-150-BP',
    name: 'Hex Screws-(Din 933)-Full Thread-M10X1.5X150M-Grade 5.8 Bp',
    category: 'Hex Screws',
    standard: 'DIN 933',
    grade: '5.8 BP',
    finish: 'Black Passivated (BP)',
    threadType: 'Full Thread',
    diameter: 'M10',
    lengthMm: 150,
    pitchMm: 1.5,
    weightPerPcKg: 0.0820,
    pricePerPiece: 7.49,
    originalPricePerPiece: 7.49,
    pricePerKg: 91.30,
    originalPricePerKg: 91.30,
    stockPcs: 16500,
    stockKg: 1353.0,
    isInStock: true,
    imageUrl: '/assets/bolt_zinc.jpg',
  },
  {
    id: 9,
    sku: 'CBH-934-M10-8-ZP',
    name: 'Hexagon Full Nuts-(Din 934)-M10X1.5-Property Class 8 Zinc Plated',
    category: 'Hex Nuts',
    standard: 'DIN 934',
    grade: 'Class 8',
    finish: 'Zinc Plated (Clear)',
    threadType: 'Full Internal Thread',
    diameter: 'M10',
    lengthMm: 8,
    pitchMm: 1.5,
    weightPerPcKg: 0.0116,
    pricePerPiece: 1.85,
    originalPricePerPiece: 2.10,
    pricePerKg: 159.50,
    originalPricePerKg: 181.00,
    stockPcs: 85000,
    stockKg: 986.0,
    isInStock: true,
    imageUrl: '/assets/products/1B3YPhv4meudo8NQZMwBf_v98rARQxJlM.png',
  }
];

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'CBH-ORD-2025-9281',
    date: '2025-10-18',
    customerName: 'Rajesh Sharma',
    companyName: 'Apex Heavy Infra Ltd.',
    itemsCount: 3,
    totalWeightKg: 485.5,
    netAmount: 76180.00,
    status: 'IN_TRANSIT',
    carrier: 'TCI Freight Express',
    trackingNumber: 'TCI-BLR-8849201',
    dispatchDate: '2025-10-20',
    shippingAddress: 'Apex Heavy Infra Ltd., Plot 44, Peenya Phase 2, Bengaluru, KA',
    mtcCertNumber: 'MTC-CBH-2025-4491-NABL',
  },
  {
    id: 'ord-2',
    orderNumber: 'CBH-ORD-2025-8842',
    date: '2025-09-29',
    customerName: 'Vikramaditya Sengupta',
    companyName: 'Larsen & Infra Works Ltd.',
    itemsCount: 5,
    totalWeightKg: 1250.0,
    netAmount: 184500.00,
    status: 'DELIVERED',
    carrier: 'Blue Dart Logistics',
    trackingNumber: 'BD-DEL-5591024',
    dispatchDate: '2025-09-30',
    shippingAddress: 'Larsen Fabrication Yard, Sector 8, Gandhinagar, GJ',
    mtcCertNumber: 'MTC-CBH-2025-3810-NABL',
  },
  {
    id: 'ord-3',
    orderNumber: 'CBH-ORD-2025-9412',
    date: '2025-10-22',
    customerName: 'Sunil Nair',
    companyName: 'BHEL Heavy Machinery Division',
    itemsCount: 8,
    totalWeightKg: 890.0,
    netAmount: 142800.00,
    status: 'PROCESSING',
    carrier: 'Safechem Express',
    trackingNumber: 'SF-BPL-110293',
    dispatchDate: '2025-10-25',
    shippingAddress: 'BHEL Foundry Plant, BHEL Township, Bhopal, MP',
    mtcCertNumber: 'MTC-CBH-2025-9412-NABL',
  }
];

export const INITIAL_QUOTES: BulkQuotation[] = [
  {
    id: 'quote-1',
    rfqNumber: 'RFQ-CBH-2025-9831',
    date: '2025-10-22',
    customerName: 'Rajesh Sharma',
    companyName: 'Apex Heavy Infra Ltd.',
    gstin: '29AABCA1234F1Z5',
    phone: '+91 98880 21000',
    email: 'procurement@apexinfra.com',
    itemsCount: 3,
    totalWeightKg: 485.5,
    grossAmount: 64235.00,
    discountPct: 15,
    netTotal: 64427.70,
    status: 'QUOTED',
    validUntil: '2025-11-05',
  },
  {
    id: 'quote-2',
    rfqNumber: 'RFQ-CBH-2025-9710',
    date: '2025-10-14',
    customerName: 'Anil Kirloskar',
    companyName: 'Kirloskar Transmission Ltd.',
    gstin: '27AAACK5520D1ZR',
    phone: '+91 98221 44550',
    email: 'purchasing@kirloskareng.com',
    itemsCount: 6,
    totalWeightKg: 1450.0,
    grossAmount: 142000.00,
    discountPct: 25,
    netTotal: 125670.00,
    status: 'APPROVED',
    validUntil: '2025-10-31',
  },
  {
    id: 'quote-3',
    rfqNumber: 'RFQ-CBH-2025-9945',
    date: '2025-10-23',
    customerName: 'Priya Sundaram',
    companyName: 'Tata Projects Industrial Division',
    gstin: '33AABCT9981G1Z3',
    phone: '+91 94441 88320',
    email: 'fasteners@tataprojects.com',
    itemsCount: 4,
    totalWeightKg: 3200.0,
    grossAmount: 384000.00,
    discountPct: 20,
    netTotal: 362880.00,
    status: 'PENDING',
    validUntil: '2025-11-12',
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    fullName: 'Harpreet Singh',
    companyName: 'CBH Fasteners Tech Pvt. Ltd.',
    email: 'admin@cbh.store',
    phone: '+91 98880 21000',
    gstin: '03AABCC1234F1Z0',
    role: 'ADMIN',
    tier: 'VIP',
    tierDiscountPct: 25,
    creditLimit: 5000000,
    isVerified: true,
    city: 'Ludhiana, PB',
    createdAt: '2024-01-10',
  },
  {
    id: 101,
    fullName: 'Rajesh Sharma',
    companyName: 'Apex Heavy Infrastructure Ltd.',
    email: 'procurement@apexinfra.com',
    phone: '+91 98220 54321',
    gstin: '29AABCA1234F1Z5',
    role: 'CUSTOMER',
    tier: 'DIAMOND',
    tierDiscountPct: 18,
    creditLimit: 2500000,
    isVerified: true,
    city: 'Bengaluru, KA',
    createdAt: '2024-03-15',
  },
  {
    id: 102,
    fullName: 'Sunil Nair',
    companyName: 'BHEL Heavy Machinery Division',
    email: 'snair@bhelindia.com',
    phone: '+91 98765 43210',
    gstin: '23AAACB0001P1Z9',
    role: 'CUSTOMER',
    tier: 'VIP',
    tierDiscountPct: 22,
    creditLimit: 7500000,
    isVerified: true,
    city: 'Bhopal, MP',
    createdAt: '2024-05-20',
  },
  {
    id: 103,
    fullName: 'Priya Sundaram',
    companyName: 'Tata Projects Industrial Division',
    email: 'fasteners@tataprojects.com',
    phone: '+91 94441 88320',
    gstin: '33AABCT9981G1Z3',
    role: 'CUSTOMER',
    tier: 'PLATINUM',
    tierDiscountPct: 15,
    creditLimit: 1500000,
    isVerified: false,
    city: 'Chennai, TN',
    createdAt: '2024-08-01',
  }
];

export const INITIAL_SURPLUS_LOTS: SurplusLot[] = [
  {
    id: 1,
    sku: 'SURP-DIN933-M12-100-8.8',
    name: 'Hex Head Screws DIN 933 M12x100mm Grade 8.8 Black Phosphate',
    standard: 'DIN 933',
    grade: '8.8 HT',
    excessQtyPcs: 14500,
    excessQtyKg: 1087.5,
    regularPriceKg: 165.0,
    clearanceDiscountPct: 40,
    clearancePriceKg: 99.0,
    locationHub: 'Bhiwandi Hub (MH)',
    isActive: true,
  },
  {
    id: 2,
    sku: 'SURP-DIN912-M16-80-12.9',
    name: 'Socket Head Cap Screws DIN 912 M16x80mm Grade 12.9 High Tensile',
    standard: 'DIN 912',
    grade: '12.9 Alloy',
    excessQtyPcs: 8200,
    excessQtyKg: 1148.0,
    regularPriceKg: 210.0,
    clearanceDiscountPct: 45,
    clearancePriceKg: 115.5,
    locationHub: 'Ludhiana Central Depot (PB)',
    isActive: true,
  },
  {
    id: 3,
    sku: 'SURP-SS316-M10-60-A4',
    name: 'Marine Grade Stainless Hex Bolts SS 316 (A4-70) M10x60mm',
    standard: 'ISO 4017',
    grade: 'SS 316 (A4)',
    excessQtyPcs: 6400,
    excessQtyKg: 384.0,
    regularPriceKg: 490.0,
    clearanceDiscountPct: 35,
    clearancePriceKg: 318.5,
    locationHub: 'Chennai Harbour Depot (TN)',
    isActive: true,
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'din-vs-iso-vs-astm',
    slug: 'din-vs-iso-vs-astm',
    title: 'Fastener Standards Explained: Complete Guide to DIN, ISO, and ASTM Equivalencies',
    excerpt: 'Navigate standard harmonization differences between DIN 933, ISO 4017, and ASTM A193. Learn key dimensional tolerances, thread pitch variations, and material marking regulations.',
    category: 'Standards & Compliance',
    readTime: '6 min read',
    date: 'Oct 20, 2024',
    author: 'Technical Engineering Team',
    image: '/assets/exhibitions/exhibition_stand_branded.jpg',
    featured: true,
    status: 'PUBLISHED',
    views: 1420,
    tags: ['DIN 933', 'ISO 4017', 'ASTM A193', 'Harmonization', 'Fastener Standards'],
    content: `## The Evolution of Industrial Fastener Standards

In modern precision engineering, specifying the correct fastener standard is not merely a formality—it dictates assembly clearances, wrench fitment, tensile safety factors, and international legal compliance. For decades, the German Institute for Standardization (**DIN**) established the global benchmark for metric fasteners. However, the International Organization for Standardization (**ISO**) initiated standard harmonization to create unified worldwide specifications, resulting in minor but critical dimensional alterations.

Concurrent with metric harmonization, American Society for Testing and Materials (**ASTM**) standards remain the supreme authority across oil, gas, chemical processing, and ASME pressure vessel fabrications. Understanding the precise overlaps and distinctions between these three frameworks is mandatory for procurement engineers and design offices.

---

### Key Dimensional Differences: DIN 933 vs. ISO 4017

While both DIN 933 and ISO 4017 specify **fully threaded hexagon head screws**, key dimensions diverge across standard metric diameters:

1. **Width Across Flats ($s$ Dimension)**:
   - **M10**: DIN specifies $s = 17\\text{ mm}$, whereas ISO 4017 specifies $s = 16\\text{ mm}$.
   - **M12**: DIN specifies $s = 19\\text{ mm}$, whereas ISO 4017 specifies $s = 18\\text{ mm}$.
   - **M14**: DIN specifies $s = 22\\text{ mm}$, whereas ISO 4017 specifies $s = 21\\text{ mm}$.
   - **M22**: DIN specifies $s = 32\\text{ mm}$, whereas ISO 4017 specifies $s = 34\\text{ mm}$.

> **Critical Procurement Risk**: Supplying ISO-dimension bolts to an automated assembly line or robotic socket station designed around legacy DIN dimensions can result in tool misalignment, stripped wrench sockets, and assembly stoppages.

---

### ASTM A193 Grade B7: High-Temperature Pressure Applications

Unlike DIN and ISO metric standards, **ASTM A193 Grade B7** governs chromium-molybdenum alloy steel (AISI 4140/4142) heat-treated bolts specifically designed for high-temperature and high-pressure service in boilers, flanged piping systems, and pressure vessels.

- **Minimum Tensile Strength**: $860\\text{ MPa}$ ($125\\text{ ksi}$) for diameters up to 2.5 inches.
- **Minimum Yield Strength**: $720\\text{ MPa}$ ($105\\text{ ksi}$).
- **Operating Temperature Rating**: Continuous reliability up to $425^\\circ\\text{C}$ ($800^\\circ\\text{F}$).

When specifying studs for industrial refineries, ASTM A193 B7 continuous threaded rods paired with **ASTM A194 Grade 2H heavy hex nuts** constitute the mandatory ASME standard pairing.

---

### Summary Checklist for Procurement Managers

- Always verify whether the client engineering BOM specifies **DIN 933** or **ISO 4017** on M10 and M12 sizes.
- Verify head stamping: ISO requires grade and manufacturer code stamped on heads $\\ge\\text{M5}$.
- Ensure Material Test Certificates (EN 10204 Type 3.1) verify chemical composition and mechanical proof loads against the exact standard specified.`
  },
  {
    id: 'ss304-vs-ss316-corrosion',
    slug: 'ss304-vs-ss316-corrosion',
    title: 'SS 304 vs SS 316 Fasteners: Corrosion Resistance in Marine & Chemical Infrastructure',
    excerpt: 'Why 2-3% molybdenum content in Grade A4 (SS 316) prevents pitting corrosion under severe chloride exposure and seawater mist environments.',
    category: 'Material Metallurgy',
    readTime: '5 min read',
    date: 'Oct 14, 2024',
    author: 'Er. R. K. Singla',
    image: '/assets/exhibitions/exhibition_conversation.jpg',
    featured: false,
    status: 'PUBLISHED',
    views: 980,
    tags: ['SS304', 'SS316', 'Corrosion Resistance', 'A2 vs A4', 'Marine Metallurgy'],
    content: `## The Metallurgy of Austenitic Stainless Steel Fasteners

Austenitic stainless steels are the predominant choice for non-magnetic, corrosion-resistant fastening assemblies. Within metric industrial terminology (ISO 3506-1), these grades are designated as:

- **Grade A2**: Commonly corresponding to AISI 304 (18% Chromium, 8% Nickel).
- **Grade A4**: Corresponding to AISI 316 (18% Chromium, 10-12% Nickel, and 2-3% Molybdenum).

While both grades exhibit outstanding general atmospheric resistance, the microscopic presence of **Molybdenum** in Grade A4 fundamentally alters performance in harsh chemical and marine saline environments.

---

### Pitting Corrosion & Chloride Attack

Stainless steel relies on an ultra-thin, self-healing **chromium oxide passive film** (approx. 1-3 nm) for corrosion resistance. However, chloride ions (found in marine spray, de-icing salts, and chemical washdowns) can penetrate micro-crevices in this passive layer.

In SS 304, chloride penetration initiates localized **pitting and crevice corrosion**, leading to catastrophic micro-cracking and loss of fastener clamping force. In contrast, the 2-3% molybdenum in SS 316 stabilizes the chromium oxide layer against halide ion disruption:

$$\\text{PREN} = \\%\\text{Cr} + 3.3(\\%\\text{Mo}) + 16(\\%\\text{N})$$

- **SS 304 PREN Score**: Approximately 18.0 - 19.5
- **SS 316 PREN Score**: Approximately 23.0 - 25.0

---

### Real-World Field Performance Comparison

1. **Marine Environments (< 5 km from shoreline)**:
   - SS 304 will display visible "tea staining" and red oxide spotting within 6 to 12 months.
   - SS 316 maintains structural and aesthetic integrity over decades of continuous salt mist exposure.

2. **Pharmaceutical & Food Processing**:
   - Both grades resist common detergents, but SS 316 is mandated for CIP (Clean-In-Place) systems utilizing sanitizers containing chlorine or harsh acidic rinses.

---

### Procurement Recommendation
For non-coastal structural installations, SS 304 delivers optimal economic balance (typically 25-35% lower cost). For ports, chemical refineries, wastewater treatment facilities, and coastal solar mounting structures, specifying SS 316 (A4-70 or A4-80) is non-negotiable for 25+ year structural longevity.`
  },
  {
    id: 'high-tensile-grade-8-8-10-9-12-9',
    slug: 'high-tensile-grade-8-8-10-9-12-9',
    title: 'High-Tensile Fasteners: When to Specify Grade 8.8, 10.9, or 12.9 in Structural Assemblies',
    excerpt: 'Understanding proof load, yield strength, and hydrogen embrittlement risks in electroplated high-tensile fasteners subjected to heavy cyclic loads.',
    category: 'Engineering & Design',
    readTime: '8 min read',
    date: 'Oct 02, 2024',
    author: 'Quality Testing Lab',
    image: '/assets/exhibitions/exhibition_stand_photo.jpg',
    featured: false,
    status: 'PUBLISHED',
    views: 1250,
    tags: ['Grade 8.8', 'Grade 10.9', 'Grade 12.9', 'High Tensile', 'Proof Load'],
    content: `## Deciphering the Metric Property Class Designation

Metric high-tensile steel fasteners are categorized by two numbers separated by a dot (e.g., 8.8, 10.9, 12.9) according to **ISO 898-1**:

1. **First Number**: Represents $1/100$th of the nominal tensile strength in megapascals ($\\text{MPa}$):
   - Grade 8.8: Nominal tensile strength $\\ge 800\\text{ MPa}$
   - Grade 10.9: Nominal tensile strength $\\ge 1000\\text{ MPa}$
   - Grade 12.9: Nominal tensile strength $\\ge 1200\\text{ MPa}$

2. **Second Number**: Multiplied by 10, gives the yield ratio percentage relative to tensile strength:
   - Grade 8.8: Yield strength is $80\\%$ of $800\\text{ MPa} = 640\\text{ MPa}$
   - Grade 10.9: Yield strength is $90\\%$ of $1000\\text{ MPa} = 900\\text{ MPa}$
   - Grade 12.9: Yield strength is $90\\%$ of $1200\\text{ MPa} = 1080\\text{ MPa}$

---

### Hydrogen Embrittlement: The Silent Danger in Grade 10.9 & 12.9

When high-tensile fasteners are electroplated (such as bright zinc or chrome plating), atomic hydrogen can diffuse into the high-strength martensitic grain boundaries during pickling and acid baths. Under sustained clamping tension, this atomic hydrogen causes sudden, delayed catastrophic shear failure without prior plastic deformation.

**Standard Mitigation Protocols**:
- **Baking Requirement**: ISO 4042 mandates that all electroplated fasteners with hardness $> 320\\text{ HV}$ (standard for Grade 10.9 and 12.9) must undergo post-plating de-embrittlement baking at $200^\\circ\\text{C}$ within 4 hours of plating.
- **Non-Electrolytic Alternatives**: For critical structural applications, CBH engineers recommend **Geomet® zinc flake coatings** or **Black Phosphating (BP)**, which generate zero atomic hydrogen during coating deposition.

---

### Engineering Application Selection Matrix

- **Grade 8.8**: The undisputed structural workhorse. Ideal for commercial steel frameworks, automotive chassis, and pre-engineered buildings.
- **Grade 10.9**: Required for suspension assemblies, heavy automotive bolting, wind turbine towers, and safety-critical machinery where joint weight must be minimized through higher clamp force.
- **Grade 12.9**: Specially formulated for high-pressure hydraulic cylinders, engine head bolts, and machine tool tooling. Must NEVER be electroplated without strict metallurgical baking certification.`
  },
  {
    id: 'bis-mandatory-qco-fasteners',
    slug: 'bis-mandatory-qco-fasteners',
    title: 'Mandatory BIS Quality Control Orders (QCO) for Fasteners in India: What OEMs Must Verify',
    excerpt: 'A comprehensive review of the Ministry of Commerce & Industry Quality Control Order for hex bolts, screws, and structural fasteners imported or distributed in India.',
    category: 'Standards & Compliance',
    readTime: '4 min read',
    date: 'Sep 24, 2024',
    author: 'Compliance Cell',
    image: '/assets/certificates/cert_ce.webp',
    featured: false,
    status: 'PUBLISHED',
    views: 740,
    tags: ['BIS Certification', 'QCO', 'DPIIT', 'Make in India', 'Quality Compliance'],
    content: `## The New Regulatory Landscape for Fasteners in India

The Ministry of Commerce and Industry, through the Department for Promotion of Industry and Internal Trade (**DPIIT**), issued the mandatory **Fasteners (Quality Control) Order**. Under this order, standard carbon steel and alloy steel fasteners sold, imported, or stocked in India must conform to relevant **Bureau of Indian Standards (BIS)** specifications and bear the Standard Mark (ISI mark).

---

### Covered Fastener Standards

The order mandates compliance across key Indian Standards harmonized with international norms:

1. **IS 1363 (Parts 1-3)**: Hexagon head bolts, screws, and nuts of product grade C.
2. **IS 1364 (Parts 1-5)**: Hexagon head bolts, screws, and nuts of product grades A and B.
3. **IS 1367 (Series)**: Technical supply conditions for threaded steel fasteners, including mechanical properties, decarburization tests, and surface discontinuity limits.

---

### What Procurement Teams Must Inspect

To avoid customs detentions and regulatory liabilities, Indian OEMs and EPC contractors must require:

1. **BIS License Number**: The physical carton and master pallet packaging must display the valid CML license number issued to the manufacturing unit.
2. **Standard Mark on Fastener Heads**: Fasteners of nominal diameter $\\ge\\text{M5}$ must bear the manufacturer's recognized trademark alongside the property class.
3. **Type 3.1 NABL-Accredited MTC**: An accompanying inspection certificate validating chemical spectral analysis, proof load testing, and Vickers/Rockwell hardness testing.`
  },
  {
    id: 'pcs-to-kgs-dual-unit-procurement',
    slug: 'pcs-to-kgs-dual-unit-procurement',
    title: 'Dual-Unit Procurement Guide: How to Accurately Convert PCS to KGS for Bulk Tenders',
    excerpt: 'Eliminate freight discrepancies and billing friction with CBH’s mathematical weight lookup algorithms for standard metric fasteners.',
    category: 'Procurement Insights',
    readTime: '4 min read',
    date: 'Sep 15, 2024',
    author: 'Supply Chain Operations',
    image: '/assets/exhibitions/exhibition_stand_branded.jpg',
    featured: false,
    status: 'PUBLISHED',
    views: 890,
    tags: ['Dual Unit', 'PCS to KGS', 'Freight Calculation', 'Bulk Procurement', 'Tenders'],
    content: `## Overcoming the PCS vs. KGS Friction in Heavy Fastener Procurement

A recurring operational dilemma in industrial manufacturing lies in unit translation:
- **Design & Assembly Teams** calculate bills of materials strictly in **Pieces (PCS)**.
- **Logistics, Freight Carriers & Raw Material Traders** price, transport, and invoice in **Kilograms (KGS)** or Metric Tonnes (MT).

When purchasing 500,000 hex screws, small percentage variances in piece weight can result in freight billing discrepancies of hundreds of kilograms.

---

### The Mathematical Formula for Metric Fastener Mass

The theoretical mass of a standard fastener can be determined by subdividing the geometry into cylindrical, hexagonal, and chamfered segments:

$$M_{\\text{total}} = \\rho_{\\text{steel}} \\cdot \\left( V_{\\text{head}} + V_{\\text{shank}} + V_{\\text{threads}} \\right)$$

Where nominal steel density $\\rho_{\\text{steel}} = 7.85\\text{ g/cm}^3$.

Because thread pitch cuts reduce the nominal diameter to the stress area $A_s$, precision lookup tables (such as DIN EN ISO 898-1 standard weight matrices) are far superior to approximate manual calculations.

---

### How the CBH Dual-Pricing Engine Solves This

CBH Fasteners integrates real-time weight algorithms directly into the ordering interface:
- Instant conversion between **₹/Piece** and **₹/Kg**.
- Automated aggregate cargo tonnage calculation for direct truckload (FTL/LTL) freight estimation.
- Transparent tare pallet allowances ensuring billing aligns with actual weighbridge receipts.`
  },
  {
    id: 'cold-forging-vs-machined-bolts',
    slug: 'cold-forging-vs-machined-bolts',
    title: 'Cold Forging vs Machined Fasteners: Grain Flow Analysis & Tensile Fatigue Life',
    excerpt: 'Why cold-headed fasteners exhibit superior shear and tensile fatigue performance compared to lathe-machined counterparts due to continuous metallurgical grain orientation.',
    category: 'Material Metallurgy',
    readTime: '7 min read',
    date: 'Sep 05, 2024',
    author: 'Technical Engineering Team',
    image: '/assets/exhibitions/exhibition_stand_photo.jpg',
    featured: false,
    status: 'PUBLISHED',
    views: 1100,
    tags: ['Cold Heading', 'CNC Machining', 'Grain Flow', 'Fatigue Life', 'Tensile Strength'],
    content: `## Manufacturing Method Dictates Microstructural Strength

When designing bolts for heavy vibrating machinery, automotive transmissions, or rail infrastructure, the manufacturing method is just as critical as the raw material grade. Fasteners are primarily produced through one of two methods:

1. **Cold Forging (Cold Heading & Thread Rolling)**
2. **Subtractive Machining (CNC Lathe Turning & Thread Cutting)**

---

### The Power of Continuous Metallurgical Grain Flow

Under microscopic metallurgical etching, cold-headed fasteners reveal an uninterrupted, continuous grain flow that contours around the junction of the head and shank (the radius fillet) and cascades along the rolled thread crests and roots.

In contrast, subtractive CNC machining cuts across the steel bar's natural grain boundaries, introducing **microscopic stress risers** at thread roots and under the bolt head.

**Engineering Consequences**:
- **Fatigue Endurance**: Rolled threads exhibit up to **300% greater dynamic fatigue life** under cyclic tensile loading than cut threads.
- **Work Hardening**: Cold deformation increases surface hardness and compressive residual stresses at thread roots, naturally impeding fatigue crack initiation.
- **Material Efficiency**: Cold forging produces nearly zero scrap metal, whereas CNC turning generates 40-60% swarf waste.

---

### When is Machining Justified?
Machining remains necessary for short prototype runs (< 500 pcs), extra-large custom diameters (> M48), or complex custom geometries where tooling setup costs for multi-station heading dies are economically unviable.`
  }
];

