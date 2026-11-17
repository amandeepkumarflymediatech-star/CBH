export interface VirtualStoreZone {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  aisleCode: string;
  skuCount: number;
  camPos: [number, number, number];
  camLook: [number, number, number];
  hotspotPos: [number, number, number];
  color: string;
  isActive: boolean;
  sortOrder: number;
  featuredSku?: string;
  featuredProduct: {
    sku: string;
    name: string;
    standard: string;
    grade: string;
    price: number;
    weightKg: number;
    stock: string;
    leadTime: string;
    details: string;
    approvals: string[];
    imageUrl?: string;
  };
}

export const DEFAULT_ZONES: VirtualStoreZone[] = [
  {
    id: 'bay-hex-screws',
    name: 'Bay 01: Hex Head Screws',
    subtitle: 'DIN 933 / ISO 4017 Full-Thread High-Tensile Screws (Grade 8.8, 10.9, 12.9)',
    category: 'HEX SCREWS',
    aisleCode: 'AISLE 1-A',
    skuCount: 16167,
    camPos: [-12, 8, -12],
    camLook: [-4, 2, -6],
    hotspotPos: [-4, 2.5, -6],
    color: '#0052CC',
    isActive: true,
    sortOrder: 1,
    featuredSku: 'HEX SCREWS-(CBH-26-0448)-FULL THREAD-M12X1.75X200M-GRADE 8.8-SELF-STD PACKED-STAMP-CBH 8.8',
    featuredProduct: {
      sku: 'CBH-DIN933-M12-200-88',
      name: 'Hexagon Head Screws Full Thread M12x200 Grade 8.8',
      standard: 'DIN 933 / ISO 4017',
      grade: 'Grade 8.8 High-Tensile',
      price: 120.0,
      weightKg: 0.178,
      stock: '15,000 pcs in stock (Bhiwandi Bay 01)',
      leadTime: 'Same-day dispatch',
      details: 'Precision cold-forged full-thread hexagonal screws for heavy engineering, industrial machinery, and structural steel connections.',
      approvals: ['DIN 933', 'ISO 4017', 'MTC 3.1 Traceable', 'BIS Certified'],
      imageUrl: '/assets/bolt_din933_zinc_1792746574604.jpg',
    },
  },
  {
    id: 'bay-hex-bolts',
    name: 'Bay 02: Hex Structural Bolts',
    subtitle: 'DIN 931 / ISO 4014 Half-Thread Structural Bolts with Unthreaded Shank',
    category: 'HEX BOLTS',
    aisleCode: 'AISLE 1-B',
    skuCount: 11516,
    camPos: [-12, 8, -4],
    camLook: [-4, 2, 0],
    hotspotPos: [-4, 2.5, 0],
    color: '#2563EB',
    isActive: true,
    sortOrder: 2,
    featuredSku: 'CBH-HEX-BOLTS-DIN-931-HT-M10X1.5X100M-G5.8-BP',
    featuredProduct: {
      sku: 'CBH-DIN931-M10-100-58',
      name: 'Hexagon Head Structural Bolt Half-Thread M10x100 Grade 5.8',
      standard: 'DIN 931 / ISO 4014',
      grade: 'Grade 5.8 / 8.8 Structural',
      price: 14.49,
      weightKg: 0.082,
      stock: '10,000 pcs in stock (Bhiwandi Bay 02)',
      leadTime: 'Same-day dispatch',
      details: 'Half-thread hex bolts engineered for superior shear resistance across unthreaded shank sections in structural joints.',
      approvals: ['DIN 931', 'ISO 4014', 'EN 10204 3.1', 'BIS Certified'],
      imageUrl: '/assets/bolt_zinc.jpg',
    },
  },
  {
    id: 'bay-hsfg',
    name: 'Bay 03: HSFG Structural Bolts',
    subtitle: 'High-Strength Friction Grip Structural Bolts (DIN 6914 / IS 3757 Grade 10.9)',
    category: 'HSFG BOLTS',
    aisleCode: 'AISLE 2-A',
    skuCount: 10605,
    camPos: [-12, 8, 4],
    camLook: [-4, 2, 6],
    hotspotPos: [-4, 2.5, 6],
    color: '#D97706',
    isActive: true,
    sortOrder: 3,
    featuredSku: 'CBH-HSFG-BOLTS-IS-3757-HT-M16X2X40M-G10.9-BP',
    featuredProduct: {
      sku: 'CBH-IS3757-M16-40-109',
      name: 'HSFG Structural Bolt Half-Thread M16x40 Grade 10.9 Heavy Hex',
      standard: 'IS 3757 / DIN 6914',
      grade: 'Alloy Steel Grade 10.9',
      price: 22.35,
      weightKg: 0.142,
      stock: '10,000 pcs in stock (Bhiwandi Bay 03)',
      leadTime: 'Same-day dispatch',
      details: 'Heavy-hex preloaded friction-grip assemblies engineered for bridges, wind turbines, overhead cranes, and seismic steel frames.',
      approvals: ['IS 3757', 'DIN 6914', 'Preload Torque Verified', 'NABL Accredited'],
      imageUrl: '/assets/bolt_zinc.jpg',
    },
  },
  {
    id: 'bay-socket-head',
    name: 'Bay 04: Socket Head Cap Screws',
    subtitle: 'DIN 912 / ISO 4762 Allen Head Screws (Grade 12.9 High-Tensile)',
    category: 'SOCKET HEAD',
    aisleCode: 'AISLE 2-B',
    skuCount: 4486,
    camPos: [-12, 8, 12],
    camLook: [-4, 2, 12],
    hotspotPos: [-4, 2.5, 12],
    color: '#059669',
    isActive: true,
    sortOrder: 4,
    featuredSku: 'CBH-SOCKET-HEAD-CAP-SCREWS-ALLEN-DIN-912-FT-M42X4.5X200M-G12.9-BP',
    featuredProduct: {
      sku: 'CBH-DIN912-M42-200-129',
      name: 'Socket Head Cap Screw Allen M42x200 Grade 12.9 Black Oxide',
      standard: 'DIN 912 / ISO 4762',
      grade: 'Alloy Steel Grade 12.9',
      price: 1546.0,
      weightKg: 2.78,
      stock: '54,108 pcs in stock (Bhiwandi Bay 04)',
      leadTime: 'Same-day dispatch',
      details: 'Precision-machined internal hex drive cap screws designed for high-clamping force in tooling, dies, hydraulic cylinders, and heavy presses.',
      approvals: ['DIN 912', 'ISO 4762', 'Grade 12.9', 'TÜV Tested'],
      imageUrl: '/assets/bolt_din933_zinc_1792746574604.jpg',
    },
  },
  {
    id: 'bay-carriage',
    name: 'Bay 05: Carriage & Coach Bolts',
    subtitle: 'DIN 603 Mushroom Head Square Neck Bolts for Timber & Guard Rails',
    category: 'CARRIAGE BOLTS',
    aisleCode: 'AISLE 3-A',
    skuCount: 5057,
    camPos: [12, 8, -12],
    camLook: [4, 2, -6],
    hotspotPos: [4, 2.5, -6],
    color: '#7C3AED',
    isActive: true,
    sortOrder: 5,
    featuredSku: 'CBH-CARRIAGE-BOLTS-DIN-603-HT-M5X0.8X16M-G10.9-SELF',
    featuredProduct: {
      sku: 'CBH-DIN603-M5-16-109',
      name: 'Carriage Bolt Mushroom Head Square Neck DIN 603 M5x16',
      standard: 'DIN 603 / ISO 8677',
      grade: 'Grade 10.9 High-Tensile',
      price: 0.85,
      weightKg: 0.008,
      stock: '10,000 pcs in stock (Bhiwandi Bay 05)',
      leadTime: 'Same-day dispatch',
      details: 'Smooth domed mushroom head with locking square neck underneath to prevent spinning during assembly on highway guardrails & timber.',
      approvals: ['DIN 603', 'ISO 8677', 'Hot Dip Galvanized / Self Finish'],
      imageUrl: '/assets/bolt_zinc.jpg',
    },
  },
  {
    id: 'bay-flange',
    name: 'Bay 06: Hex Flange Bolts',
    subtitle: 'DIN 6921 Hex Head Bolts with Integrated Washer Face & Serrations',
    category: 'HEX FLANGE BOLTS',
    aisleCode: 'AISLE 3-B',
    skuCount: 3684,
    camPos: [12, 8, -4],
    camLook: [4, 2, 0],
    hotspotPos: [4, 2.5, 0],
    color: '#EA580C',
    isActive: true,
    sortOrder: 6,
    featuredSku: 'CBH-HEX-FLANGE-BOLTS-DIN-6921-FT-M5X0.8X10M-G4.6-YZP',
    featuredProduct: {
      sku: 'CBH-DIN6921-M5-10-46',
      name: 'Hexagon Flange Bolt DIN 6921 Full Thread M5x10 Yellow Zinc',
      standard: 'DIN 6921',
      grade: 'Grade 4.6 / 8.8 Yellow Zinc',
      price: 1.7,
      weightKg: 0.006,
      stock: '10,000 pcs in stock (Bhiwandi Bay 06)',
      leadTime: 'Same-day dispatch',
      details: 'Integrated circular flange acts as a built-in washer, distributing clamping load evenly without requiring separate loose washers.',
      approvals: ['DIN 6921', 'Yellow Zinc Plated 5-8μm', 'ISO 9001'],
      imageUrl: '/assets/bolt_din933_zinc_1792746574604.jpg',
    },
  },
  {
    id: 'bay-threaded-rods',
    name: 'Bay 07: Threaded Rods & Studs',
    subtitle: 'DIN 976 / DIN 975 1-Meter & 2-Meter Continuous All-Thread Rods',
    category: 'THREADED RODS',
    aisleCode: 'AISLE 4-A',
    skuCount: 2469,
    camPos: [12, 8, 4],
    camLook: [4, 2, 6],
    hotspotPos: [4, 2.5, 6],
    color: '#0891B2',
    isActive: true,
    sortOrder: 7,
    featuredSku: 'CBH-THREADED-RODS-DIN-976-FT-M3X0.5X1000M-G4.8-SELF',
    featuredProduct: {
      sku: 'CBH-DIN976-M3-1000-48',
      name: 'Threaded Rod DIN 976 All-Thread M3x1000mm (1 Meter)',
      standard: 'DIN 976 / DIN 975',
      grade: 'Grade 4.8 / 8.8 / SS-304',
      price: 5.0,
      weightKg: 0.045,
      stock: '10,000 pcs in stock (Bhiwandi Bay 07)',
      leadTime: 'Same-day dispatch',
      details: 'Precision-rolled full-length metric threads for MEP duct hanging, ceiling suspended pipe supports, and anchor tie-backs.',
      approvals: ['DIN 976', 'DIN 975', 'Tensile Proof Load Verified'],
      imageUrl: '/assets/bolt_zinc.jpg',
    },
  },
  {
    id: 'bay-qa-lab',
    name: 'Bay 08: Metallurgy & QA Testing Lab',
    subtitle: 'Calibrated Tensile Rig, Optical Sorting & EN 10204 3.1 Certification',
    category: 'HSFG BOLTS',
    aisleCode: 'LAB QC-1',
    skuCount: 54392,
    camPos: [12, 8, 12],
    camLook: [4, 2, 12],
    hotspotPos: [4, 2.5, 12],
    color: '#10B981',
    isActive: true,
    sortOrder: 8,
    featuredSku: 'CBH-MTC-CERT-LAB',
    featuredProduct: {
      sku: 'CBH-QA-NABL-31',
      name: '100% Batch Proof Load & Salt-Spray Verified Lots (54,000+ Fasteners)',
      standard: 'ISO 9001:2015 / NABL Accredited',
      grade: 'Full Traceability Heat Code Stamped',
      price: 0,
      weightKg: 0,
      stock: 'Live Testing Operations Active',
      leadTime: 'Digital MTC with every dispatch',
      details: 'Every batch undergoes Vickers hardness testing (HV), ultrasonic crack detection, and 720-hour salt spray corrosion test.',
      approvals: ['NABL Accredited', 'MTC Type 3.1', 'ISO 9001:2015', 'BIS Certified'],
      imageUrl: '/assets/quality_cert_inspection.jpg',
    },
  },
];

export interface CadBoltModel {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  standard: string;
  category: string;
  zoneId: string;
  grade: string;
  diameters: string;
  applications: string;
  parts: { id: string; name: string; spec: string }[];
}

export const CAD_BOLT_MODELS: CadBoltModel[] = [
  {
    id: 'hex-bolt',
    name: 'Hexagon Head Structural Bolt Assembly',
    shortName: 'Hex Bolt (DIN 933)',
    icon: '🔩',
    standard: 'DIN 933 / DIN 931 / ISO 4017',
    category: 'HEX SCREWS',
    zoneId: 'bay-hex-screws',
    grade: 'Grade 8.8 / 10.9 / 12.9 High-Tensile',
    diameters: 'M6 to M42 (Lengths 10mm - 400mm)',
    applications: 'Heavy machinery, steel construction frameworks, automotive chassis, pump flanges',
    parts: [
      { id: 'bolt', name: '1. Cold-Forged Hex Head & Metric Shank', spec: 'DIN 933 Full Thread' },
      { id: 'washer', name: '2. Flat Washer Form A', spec: 'DIN 125A 200HV' },
      { id: 'nut', name: '3. Precision Hexagon Nut', spec: 'DIN 934 Grade 8/10' }
    ]
  },
  {
    id: 'hsfg-bolt',
    name: 'HSFG Preload Structural Assembly',
    shortName: 'HSFG Preload (DIN 6914)',
    icon: '🏗️',
    standard: 'DIN 6914 / IS 3757 / EN 14399',
    category: 'HSFG BOLTS',
    zoneId: 'bay-hsfg',
    grade: 'Alloy Steel Grade 10.9 Preload',
    diameters: 'M16 to M36 Heavy Hex',
    applications: 'Bridges, wind turbine towers, overhead gantry cranes, high-rise frameworks',
    parts: [
      { id: 'bolt', name: '1. Heavy Hex Structural Bolt', spec: 'DIN 6914 / IS 3757' },
      { id: 'washer', name: '2. Hardened Chamfered Washer', spec: 'DIN 6916 / IS 6649' },
      { id: 'nut', name: '3. Heavy Structural Hex Nut', spec: 'DIN 6915 / IS 6623' }
    ]
  },
  {
    id: 'wedge-anchor',
    name: 'FAZ II Plus Concrete Wedge Anchor',
    shortName: 'Wedge Anchor (FAZ II)',
    icon: '⚓',
    standard: 'ETA Option 1 / C1 & C2 Seismic',
    category: 'SOCKET HEAD',
    zoneId: 'bay-socket-head',
    grade: 'Cold-Forged Carbon Steel / 316 Stainless',
    diameters: 'M8 to M24 (Embedment 40-125mm)',
    applications: 'Cracked & non-cracked concrete, curtain walls, steel baseplates, seismic zones',
    parts: [
      { id: 'stud', name: '1. Calibrated Anchor Stud', spec: 'High-Tensile Zinc' },
      { id: 'clip', name: '2. Stainless Expansion Clip', spec: 'AISI 316 Marine' },
      { id: 'cone', name: '3. Precision Shear Cone', spec: 'Hardened Cold-Form' },
      { id: 'washer', name: '4. Heavy Anchor Washer', spec: 'DIN 125 5μm Zinc' },
      { id: 'nut', name: '5. Pre-Torqued Hex Nut', spec: 'DIN 934 Grade 8' }
    ]
  },
  {
    id: 'socket-head',
    name: 'Socket Head Cap Screw (Allen Bolt)',
    shortName: 'Socket Allen (DIN 912)',
    icon: '⚙️',
    standard: 'DIN 912 / ISO 4762',
    category: 'SOCKET HEAD',
    zoneId: 'bay-socket-head',
    grade: 'Alloy Steel Grade 12.9 / Stainless A2/A4',
    diameters: 'M3 to M42 (Internal Hex Drive)',
    applications: 'Tooling, precision injection dies, hydraulic manifolds, engine blocks',
    parts: [
      { id: 'bolt', name: '1. Cylindrical Cap Screw & Hex Socket', spec: 'DIN 912 Grade 12.9' },
      { id: 'washer', name: '2. Helical Split Spring Lock Washer', spec: 'DIN 127B Spring Steel' },
      { id: 'nut', name: '3. Precision Hexagon Nut', spec: 'DIN 934 Grade 12' }
    ]
  },
  {
    id: 'flange-bolt',
    name: 'Hexagon Flange Bolt Assembly',
    shortName: 'Flange Bolt (DIN 6921)',
    icon: '🛡️',
    standard: 'DIN 6921 / ISO 4162',
    category: 'HEX FLANGE BOLTS',
    zoneId: 'bay-flange',
    grade: 'Grade 8.8 / 10.9 Yellow Zinc',
    diameters: 'M5 to M20 Integrated Washer Face',
    applications: 'Automotive sub-frames, transmission housings, solar tracker racking',
    parts: [
      { id: 'bolt', name: '1. Hex Flange Bolt with Washer Face', spec: 'DIN 6921 Serrated' },
      { id: 'nut', name: '2. Hex Flange Prevailing Torque Nut', spec: 'DIN 6923 Grade 8' }
    ]
  },
  {
    id: 'carriage-bolt',
    name: 'Carriage Bolt (Coach Bolt)',
    shortName: 'Carriage Bolt (DIN 603)',
    icon: '🪵',
    standard: 'DIN 603 / ISO 8677',
    category: 'CARRIAGE BOLTS',
    zoneId: 'bay-carriage',
    grade: 'Grade 4.6 / 8.8 / Hot-Dip Galv',
    diameters: 'M5 to M16 Smooth Domed Head',
    applications: 'Highway crash barriers, timber guardrails, architectural timber joists',
    parts: [
      { id: 'bolt', name: '1. Mushroom Head & Square Locking Neck', spec: 'DIN 603 Smooth Dome' },
      { id: 'washer', name: '2. Oversized Mudguard Penny Washer', spec: 'DIN 9021 Large OD' },
      { id: 'nut', name: '3. Hexagon Locking Nut', spec: 'DIN 934 / DIN 985 Nyloc' }
    ]
  },
  {
    id: 'threaded-rod',
    name: 'Continuous All-Thread Stud Assembly',
    shortName: 'Threaded Stud (DIN 976)',
    icon: '📏',
    standard: 'DIN 976 / DIN 975 / ASTM A193 B7',
    category: 'THREADED RODS',
    zoneId: 'bay-threaded-rods',
    grade: 'Grade 4.8 / 8.8 / B7 High-Temp Alloy',
    diameters: 'M3 to M52 (1000mm & 2000mm Bars)',
    applications: 'HVAC ceiling duct hangers, pipe clamping brackets, chemical anchor studs',
    parts: [
      { id: 'bolt', name: '1. Precision Metric Threaded Rod', spec: 'DIN 976 6g Thread' },
      { id: 'washer', name: '2. Upper & Lower Load Washers', spec: 'DIN 125 Heavy Flat' },
      { id: 'nut', name: '3. Dual Clamping Hex Nuts', spec: 'DIN 934 Grade 8' }
    ]
  }
];
