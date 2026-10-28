const fs = require('fs');
const path = require('path');

// ERPNext Credentials
const ERPNEXT_URL = 'https://cbhtest.m.frappe.cloud';
const API_KEY = 'd2141a328e0411a';
const API_SECRET = '7311220ffb3e4cd';
const AUTH_HEADER = {
  'Authorization': `token ${API_KEY}:${API_SECRET}`,
  'Content-Type': 'application/json'
};

// Target file paths
const CBH_PRODUCTS_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'cbh-products.json');
const CBH_CATALOG_TS_PATH = path.join(__dirname, '..', 'src', 'lib', 'cbh-catalog-products.ts');
const ERPNEXT_CACHE_PATH = path.join(__dirname, '..', 'src', 'data', 'erpnext-cached-products.json');
const ERPNEXT_CONFIG_PATH = path.join(__dirname, '..', 'src', 'data', 'erpnext-config.json');

// Definition of diverse fastener product lines
const DIVERSE_FAMILIES = [
  {
    familyId: 'fam-din-933',
    category: 'Hex Screws',
    name: 'Hexagon Head Screws (Full Thread) - DIN 933',
    standard: 'DIN 933',
    isoEquivalent: 'ISO 4017',
    headType: 'Hexagonal',
    threadType: 'Metric Coarse (Full Thread)',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-933-M8-30-8.8-ZP',
        name: 'Hex Screw DIN 933 M8x30 Gr 8.8 Zinc Plated',
        diameter: 'M8',
        pitch: '1.25mm',
        length: '30mm',
        grade: 'Grade 8.8',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'High Tensile Medium Carbon Steel',
        pricePerPiece: 3.40,
        pricePerKg: 195.0,
        weightPerPcKg: 0.0174,
        minQuantity: 100,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 45000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-933-M10-50-8.8-HDG',
        name: 'Hex Screw DIN 933 M10x50 Gr 8.8 Hot Dip Galvanized',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '50mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Alloy Steel',
        pricePerPiece: 6.85,
        pricePerKg: 180.0,
        weightPerPcKg: 0.038,
        minQuantity: 50,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 28000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-933-M12-60-10.9-BP',
        name: 'Hex Screw DIN 933 M12x60 Gr 10.9 Black Phosphate',
        diameter: 'M12',
        pitch: '1.75mm',
        length: '60mm',
        grade: 'Grade 10.9',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'High Tensile Quenched & Tempered Steel',
        pricePerPiece: 14.20,
        pricePerKg: 215.0,
        weightPerPcKg: 0.066,
        minQuantity: 40,
        tensileStrength: '1040 N/mm²',
        yieldStrength: '940 N/mm²',
        stockQuantity: 16000,
        localImage: '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png'
      },
      {
        sku: 'CBH-933-M16-80-8.8-HDG',
        name: 'Hex Screw DIN 933 M16x80 Gr 8.8 Hot Dip Galvanized',
        diameter: 'M16',
        pitch: '2.0mm',
        length: '80mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Medium Carbon Steel',
        pricePerPiece: 28.50,
        pricePerKg: 175.0,
        weightPerPcKg: 0.163,
        minQuantity: 25,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 12000,
        localImage: '/assets/bolt_zinc.jpg'
      }
    ]
  },
  {
    familyId: 'fam-din-931',
    category: 'Hex Bolts',
    name: 'Hexagon Head Bolts (Partial Thread) - DIN 931',
    standard: 'DIN 931',
    isoEquivalent: 'ISO 4014',
    headType: 'Hexagonal',
    threadType: 'Metric Coarse (Partial Thread)',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-931-M10-80-8.8-HDG',
        name: 'Hex Bolt DIN 931 M10x80 Gr 8.8 Half Thread HDG',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '80mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Medium Carbon Steel',
        pricePerPiece: 9.80,
        pricePerKg: 185.0,
        weightPerPcKg: 0.053,
        minQuantity: 50,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 22000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-931-M12-100-8.8-ZP',
        name: 'Hex Bolt DIN 931 M12x100 Gr 8.8 Half Thread Zinc',
        diameter: 'M12',
        pitch: '1.75mm',
        length: '100mm',
        grade: 'Grade 8.8',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'High Tensile Carbon Steel',
        pricePerPiece: 17.50,
        pricePerKg: 182.0,
        weightPerPcKg: 0.096,
        minQuantity: 40,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 19500,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-931-M16-120-10.9-BP',
        name: 'Hex Bolt DIN 931 M16x120 Gr 10.9 Half Thread BP',
        diameter: 'M16',
        pitch: '2.0mm',
        length: '120mm',
        grade: 'Grade 10.9',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'High Tensile Quenched & Tempered Steel',
        pricePerPiece: 41.20,
        pricePerKg: 205.0,
        weightPerPcKg: 0.201,
        minQuantity: 20,
        tensileStrength: '1040 N/mm²',
        yieldStrength: '940 N/mm²',
        stockQuantity: 8500,
        localImage: '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png'
      },
      {
        sku: 'CBH-931-M20-140-8.8-HDG',
        name: 'Hex Bolt DIN 931 M20x140 Gr 8.8 Half Thread HDG',
        diameter: 'M20',
        pitch: '2.5mm',
        length: '140mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Structural Steel',
        pricePerPiece: 74.50,
        pricePerKg: 178.0,
        weightPerPcKg: 0.418,
        minQuantity: 15,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 6200,
        localImage: '/assets/bolt_zinc.jpg'
      }
    ]
  },
  {
    familyId: 'fam-din-912',
    category: 'Socket Head Cap Screws',
    name: 'Socket Head Cap Screws (Allen Bolts) - DIN 912',
    standard: 'DIN 912',
    isoEquivalent: 'ISO 4762',
    headType: 'Cylindrical Socket Head',
    threadType: 'Metric Coarse',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-912-M6-25-12.9-BP',
        name: 'Socket Cap Screw DIN 912 M6x25 Gr 12.9 Allen Bolt',
        diameter: 'M6',
        pitch: '1.0mm',
        length: '25mm',
        grade: 'Grade 12.9',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'Grade 12.9 High Tensile Chrome-Moly Steel',
        pricePerPiece: 2.85,
        pricePerKg: 275.0,
        weightPerPcKg: 0.0104,
        minQuantity: 100,
        tensileStrength: '1220 N/mm²',
        yieldStrength: '1100 N/mm²',
        stockQuantity: 50000,
        localImage: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png'
      },
      {
        sku: 'CBH-912-M8-35-12.9-BP',
        name: 'Socket Cap Screw DIN 912 M8x35 Gr 12.9 Allen Bolt',
        diameter: 'M8',
        pitch: '1.25mm',
        length: '35mm',
        grade: 'Grade 12.9',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'Grade 12.9 High Tensile Chrome-Moly Steel',
        pricePerPiece: 5.75,
        pricePerKg: 260.0,
        weightPerPcKg: 0.0221,
        minQuantity: 80,
        tensileStrength: '1220 N/mm²',
        yieldStrength: '1100 N/mm²',
        stockQuantity: 42000,
        localImage: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png'
      },
      {
        sku: 'CBH-912-M10-45-12.9-BP',
        name: 'Socket Cap Screw DIN 912 M10x45 Gr 12.9 Allen Bolt',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '45mm',
        grade: 'Grade 12.9',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'Grade 12.9 High Tensile Chrome-Moly Steel',
        pricePerPiece: 9.80,
        pricePerKg: 245.0,
        weightPerPcKg: 0.040,
        minQuantity: 50,
        tensileStrength: '1220 N/mm²',
        yieldStrength: '1100 N/mm²',
        stockQuantity: 31000,
        localImage: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png'
      },
      {
        sku: 'CBH-912-M12-50-12.9-ZP',
        name: 'Socket Cap Screw DIN 912 M12x50 Gr 12.9 Zinc Plated',
        diameter: 'M12',
        pitch: '1.75mm',
        length: '50mm',
        grade: 'Grade 12.9',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Grade 12.9 High Tensile Chrome-Moly Steel',
        pricePerPiece: 16.50,
        pricePerKg: 250.0,
        weightPerPcKg: 0.066,
        minQuantity: 40,
        tensileStrength: '1220 N/mm²',
        yieldStrength: '1100 N/mm²',
        stockQuantity: 18000,
        localImage: '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png'
      }
    ]
  },
  {
    familyId: 'fam-din-934',
    category: 'Hex Nuts',
    name: 'Hexagon Full Nuts - DIN 934 / ISO 4032',
    standard: 'DIN 934',
    isoEquivalent: 'ISO 4032',
    headType: 'Hexagonal Nut',
    threadType: 'Internal Metric Coarse',
    gst_hsn_code: '73181600',
    items: [
      {
        sku: 'CBH-934-M8-GR8-ZP',
        name: 'Hexagon Nut DIN 934 M8 Grade 8 Zinc Plated',
        diameter: 'M8',
        pitch: '1.25mm',
        length: '6.5mm',
        grade: 'Grade 8',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Medium Carbon Steel',
        pricePerPiece: 1.10,
        pricePerKg: 210.0,
        weightPerPcKg: 0.0052,
        minQuantity: 200,
        tensileStrength: '800 N/mm² (Proof Load)',
        yieldStrength: '640 N/mm²',
        stockQuantity: 95000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      },
      {
        sku: 'CBH-934-M10-GR8-HDG',
        name: 'Hexagon Nut DIN 934 M10 Grade 8 HDG Hot Dip Galvanized',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '8mm',
        grade: 'Grade 8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'Medium Carbon Steel',
        pricePerPiece: 2.35,
        pricePerKg: 205.0,
        weightPerPcKg: 0.0115,
        minQuantity: 150,
        tensileStrength: '800 N/mm² (Proof Load)',
        yieldStrength: '640 N/mm²',
        stockQuantity: 75000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      },
      {
        sku: 'CBH-934-M12-GR10-BP',
        name: 'Hexagon Nut DIN 934 M12 Grade 10 Black Phosphate',
        diameter: 'M12',
        pitch: '1.75mm',
        length: '10mm',
        grade: 'Grade 10',
        finish: 'Bp',
        finishName: 'Black Phosphate',
        material: 'High Tensile Quenched & Tempered Steel',
        pricePerPiece: 4.20,
        pricePerKg: 240.0,
        weightPerPcKg: 0.0175,
        minQuantity: 100,
        tensileStrength: '1000 N/mm² (Proof Load)',
        yieldStrength: '900 N/mm²',
        stockQuantity: 48000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      },
      {
        sku: 'CBH-934-M16-GR8-HDG',
        name: 'Hexagon Nut DIN 934 M16 Grade 8 Hot Dip Galvanized',
        diameter: 'M16',
        pitch: '2.0mm',
        length: '13mm',
        grade: 'Grade 8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'Medium Carbon Steel',
        pricePerPiece: 7.90,
        pricePerKg: 198.0,
        weightPerPcKg: 0.0398,
        minQuantity: 80,
        tensileStrength: '800 N/mm² (Proof Load)',
        yieldStrength: '640 N/mm²',
        stockQuantity: 36000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      },
      {
        sku: 'CBH-934-M20-GR8-HDG',
        name: 'Hexagon Nut DIN 934 M20 Grade 8 Hot Dip Galvanized',
        diameter: 'M20',
        pitch: '2.5mm',
        length: '16mm',
        grade: 'Grade 8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'Medium Carbon Steel',
        pricePerPiece: 14.80,
        pricePerKg: 195.0,
        weightPerPcKg: 0.076,
        minQuantity: 50,
        tensileStrength: '800 N/mm² (Proof Load)',
        yieldStrength: '640 N/mm²',
        stockQuantity: 24000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      }
    ]
  },
  {
    familyId: 'fam-din-125a',
    category: 'Washers',
    name: 'Plain Flat Washers - DIN 125A / ISO 7089',
    standard: 'DIN 125A',
    isoEquivalent: 'ISO 7089',
    headType: 'Flat Circular Washer',
    threadType: 'Non-Threaded Through Hole',
    gst_hsn_code: '73182200',
    items: [
      {
        sku: 'CBH-125A-M8-ZP',
        name: 'Plain Flat Washer DIN 125A M8 Zinc Plated',
        diameter: 'M8',
        pitch: 'N/A',
        length: '1.6mm Thick',
        grade: 'Mild Steel 140 HV',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Cold Rolled Mild Steel',
        pricePerPiece: 0.45,
        pricePerKg: 215.0,
        weightPerPcKg: 0.0021,
        minQuantity: 500,
        tensileStrength: '140 HV Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 150000,
        localImage: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png'
      },
      {
        sku: 'CBH-125A-M10-HDG',
        name: 'Plain Flat Washer DIN 125A M10 Hot Dip Galvanized',
        diameter: 'M10',
        pitch: 'N/A',
        length: '2.0mm Thick',
        grade: 'Structural Steel 200 HV',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Structural Steel',
        pricePerPiece: 0.85,
        pricePerKg: 210.0,
        weightPerPcKg: 0.0041,
        minQuantity: 400,
        tensileStrength: '200 HV Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 120000,
        localImage: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png'
      },
      {
        sku: 'CBH-125A-M12-HDG',
        name: 'Plain Flat Washer DIN 125A M12 Hot Dip Galvanized',
        diameter: 'M12',
        pitch: 'N/A',
        length: '2.5mm Thick',
        grade: 'Structural Steel 200 HV',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Structural Steel',
        pricePerPiece: 1.40,
        pricePerKg: 220.0,
        weightPerPcKg: 0.0063,
        minQuantity: 300,
        tensileStrength: '200 HV Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 90000,
        localImage: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png'
      },
      {
        sku: 'CBH-125A-M16-HDG',
        name: 'Plain Flat Washer DIN 125A M16 Hot Dip Galvanized',
        diameter: 'M16',
        pitch: 'N/A',
        length: '3.0mm Thick',
        grade: 'Structural Steel 200 HV',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Structural Steel',
        pricePerPiece: 2.80,
        pricePerKg: 245.0,
        weightPerPcKg: 0.0114,
        minQuantity: 200,
        tensileStrength: '200 HV Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 65000,
        localImage: '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png'
      }
    ]
  },
  {
    familyId: 'fam-din-127b',
    category: 'Washers',
    name: 'Spring Lock Washers - DIN 127B',
    standard: 'DIN 127B',
    isoEquivalent: 'ISO 261',
    headType: 'Helical Split Spring Washer',
    threadType: 'Non-Threaded Through Hole',
    gst_hsn_code: '73182100',
    items: [
      {
        sku: 'CBH-127B-M8-ZP',
        name: 'Spring Lock Washer DIN 127B M8 Zinc Plated',
        diameter: 'M8',
        pitch: 'N/A',
        length: '2.0mm Thick',
        grade: 'Spring Steel 44-50 HRC',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Spring Steel 65Mn',
        pricePerPiece: 0.50,
        pricePerKg: 280.0,
        weightPerPcKg: 0.0018,
        minQuantity: 500,
        tensileStrength: '44-50 HRC Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 110000,
        localImage: '/assets/products/1B3YPhv4meudo8NQZMwBf_v98rARQxJlM.png'
      },
      {
        sku: 'CBH-127B-M10-ZP',
        name: 'Spring Lock Washer DIN 127B M10 Zinc Plated',
        diameter: 'M10',
        pitch: 'N/A',
        length: '2.2mm Thick',
        grade: 'Spring Steel 44-50 HRC',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Spring Steel 65Mn',
        pricePerPiece: 0.85,
        pricePerKg: 285.0,
        weightPerPcKg: 0.0030,
        minQuantity: 400,
        tensileStrength: '44-50 HRC Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 85000,
        localImage: '/assets/products/1B3YPhv4meudo8NQZMwBf_v98rARQxJlM.png'
      },
      {
        sku: 'CBH-127B-M12-ZP',
        name: 'Spring Lock Washer DIN 127B M12 Zinc Plated',
        diameter: 'M12',
        pitch: 'N/A',
        length: '2.5mm Thick',
        grade: 'Spring Steel 44-50 HRC',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Spring Steel 65Mn',
        pricePerPiece: 1.35,
        pricePerKg: 290.0,
        weightPerPcKg: 0.0047,
        minQuantity: 300,
        tensileStrength: '44-50 HRC Hardness',
        yieldStrength: 'N/A',
        stockQuantity: 65000,
        localImage: '/assets/products/1B3YPhv4meudo8NQZMwBf_v98rARQxJlM.png'
      }
    ]
  },
  {
    familyId: 'fam-din-975',
    category: 'Threaded Rods',
    name: 'All-Thread Rods / Studs - DIN 975 (1000mm)',
    standard: 'DIN 975',
    isoEquivalent: 'DIN 976-1',
    headType: 'Headless Continuous Thread',
    threadType: 'Full Length Metric Coarse',
    gst_hsn_code: '73181900',
    items: [
      {
        sku: 'CBH-975-M10-1000-4.8-ZP',
        name: 'Threaded Rod DIN 975 M10x1000mm Gr 4.8 Zinc Plated',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '1000mm',
        grade: 'Grade 4.8',
        finish: 'Wzp',
        finishName: 'White Zinc Plated',
        material: 'Commercial Mild Steel',
        pricePerPiece: 62.0,
        pricePerKg: 125.0,
        weightPerPcKg: 0.495,
        minQuantity: 10,
        tensileStrength: '400 N/mm²',
        yieldStrength: '320 N/mm²',
        stockQuantity: 4500,
        localImage: '/assets/products/13HRW3hq2RbTFB-gMmEZuvPDxL4hItUrY.png'
      },
      {
        sku: 'CBH-975-M12-1000-8.8-HDG',
        name: 'Threaded Rod DIN 975 M12x1000mm Gr 8.8 HDG Galvanized',
        diameter: 'M12',
        pitch: '1.75mm',
        length: '1000mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Medium Carbon Steel',
        pricePerPiece: 145.0,
        pricePerKg: 198.0,
        weightPerPcKg: 0.725,
        minQuantity: 10,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 3200,
        localImage: '/assets/products/13HRW3hq2RbTFB-gMmEZuvPDxL4hItUrY.png'
      },
      {
        sku: 'CBH-975-M16-1000-8.8-HDG',
        name: 'Threaded Rod DIN 975 M16x1000mm Gr 8.8 HDG Galvanized',
        diameter: 'M16',
        pitch: '2.0mm',
        length: '1000mm',
        grade: 'Grade 8.8',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'High Tensile Medium Carbon Steel',
        pricePerPiece: 265.0,
        pricePerKg: 195.0,
        weightPerPcKg: 1.33,
        minQuantity: 5,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 2100,
        localImage: '/assets/products/13HRW3hq2RbTFB-gMmEZuvPDxL4hItUrY.png'
      }
    ]
  },
  {
    familyId: 'fam-din-6921',
    category: 'Hex Flange Bolts',
    name: 'Hexagon Flange Bolts - DIN 6921',
    standard: 'DIN 6921',
    isoEquivalent: 'ISO 15071',
    headType: 'Hexagonal Flange Head',
    threadType: 'Metric Coarse',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-6921-M8-25-8.8-YZP',
        name: 'Hex Flange Bolt DIN 6921 M8x25 Gr 8.8 Yellow Zinc',
        diameter: 'M8',
        pitch: '1.25mm',
        length: '25mm',
        grade: 'Grade 8.8',
        finish: 'Yzp',
        finishName: 'Yellow Zinc Plated',
        material: 'High Tensile Carbon Steel',
        pricePerPiece: 4.50,
        pricePerKg: 235.0,
        weightPerPcKg: 0.019,
        minQuantity: 80,
        tensileStrength: '800 N/mm²',
        yieldStrength: '640 N/mm²',
        stockQuantity: 34000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-6921-M10-35-10.9-ZF',
        name: 'Hex Flange Bolt DIN 6921 M10x35 Gr 10.9 Zinc Flake',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '35mm',
        grade: 'Grade 10.9',
        finish: 'Zinc Flake',
        finishName: 'Zinc Flake Geomet Coating',
        material: 'High Tensile Quenched & Tempered Steel',
        pricePerPiece: 9.80,
        pricePerKg: 270.0,
        weightPerPcKg: 0.036,
        minQuantity: 50,
        tensileStrength: '1040 N/mm²',
        yieldStrength: '940 N/mm²',
        stockQuantity: 21000,
        localImage: '/assets/bolt_zinc.jpg'
      }
    ]
  },
  {
    familyId: 'fam-ss-fasteners',
    category: 'Stainless Steel Fasteners',
    name: 'Stainless Steel Hex Screws & Nuts - AISI 304 / 316',
    standard: 'DIN 933 / DIN 934',
    isoEquivalent: 'ISO 3506-1',
    headType: 'Hexagonal',
    threadType: 'Metric Coarse',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-SS-933-M8-30-A2',
        name: 'Stainless Steel Hex Screw DIN 933 M8x30 SS 304 A2-70',
        diameter: 'M8',
        pitch: '1.25mm',
        length: '30mm',
        grade: 'A2-70 (SS 304)',
        finish: 'Self',
        finishName: 'Natural Bright Passivated',
        material: 'Austenitic Stainless Steel AISI 304',
        pricePerPiece: 9.50,
        pricePerKg: 545.0,
        weightPerPcKg: 0.0174,
        minQuantity: 50,
        tensileStrength: '700 N/mm²',
        yieldStrength: '450 N/mm²',
        stockQuantity: 28000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-SS-933-M10-40-A4',
        name: 'Marine Grade SS Hex Screw DIN 933 M10x40 SS 316 A4-80',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '40mm',
        grade: 'A4-80 (SS 316)',
        finish: 'Self',
        finishName: 'Natural Bright Passivated',
        material: 'Marine Grade Stainless Steel AISI 316',
        pricePerPiece: 24.50,
        pricePerKg: 750.0,
        weightPerPcKg: 0.0326,
        minQuantity: 30,
        tensileStrength: '800 N/mm²',
        yieldStrength: '600 N/mm²',
        stockQuantity: 15000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-SS-934-M10-A2',
        name: 'Stainless Steel Hexagon Nut DIN 934 M10 SS 304 A2-70',
        diameter: 'M10',
        pitch: '1.5mm',
        length: '8mm',
        grade: 'A2-70 (SS 304)',
        finish: 'Self',
        finishName: 'Natural Bright Passivated',
        material: 'Austenitic Stainless Steel AISI 304',
        pricePerPiece: 4.80,
        pricePerKg: 420.0,
        weightPerPcKg: 0.0114,
        minQuantity: 80,
        tensileStrength: '700 N/mm² (Proof Load)',
        yieldStrength: '450 N/mm²',
        stockQuantity: 35000,
        localImage: '/assets/products/1o1GqbWxaGX4DCFWvhYSVO1HVwOOXpCgw.png'
      }
    ]
  },
  {
    familyId: 'fam-structural-a325',
    category: 'Structural Bolting',
    name: 'Heavy Hex Structural Bolts - ASTM A325 / IS 3757',
    standard: 'ASTM A325',
    isoEquivalent: 'IS 3757 / EN 14399',
    headType: 'Heavy Hexagon Head',
    threadType: 'Metric Coarse High Strength',
    gst_hsn_code: '73181500',
    items: [
      {
        sku: 'CBH-A325-M16-65-HDG',
        name: 'Heavy Hex Structural Bolt ASTM A325 M16x65 HDG Galvanized',
        diameter: 'M16',
        pitch: '2.0mm',
        length: '65mm',
        grade: 'ASTM A325 Type 1',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'Heat Treated Quenched & Tempered Structural Steel',
        pricePerPiece: 34.50,
        pricePerKg: 195.0,
        weightPerPcKg: 0.177,
        minQuantity: 25,
        tensileStrength: '830 N/mm²',
        yieldStrength: '660 N/mm²',
        stockQuantity: 11000,
        localImage: '/assets/bolt_zinc.jpg'
      },
      {
        sku: 'CBH-A325-M20-75-HDG',
        name: 'Heavy Hex Structural Bolt ASTM A325 M20x75 HDG Galvanized',
        diameter: 'M20',
        pitch: '2.5mm',
        length: '75mm',
        grade: 'ASTM A325 Type 1',
        finish: 'Hdg',
        finishName: 'Hot Dip Galvanized',
        material: 'Heat Treated Quenched & Tempered Structural Steel',
        pricePerPiece: 58.00,
        pricePerKg: 190.0,
        weightPerPcKg: 0.305,
        minQuantity: 20,
        tensileStrength: '830 N/mm²',
        yieldStrength: '660 N/mm²',
        stockQuantity: 7800,
        localImage: '/assets/bolt_zinc.jpg'
      }
    ]
  }
];

// Helper: Convert to CBH JSON structure
function buildCbhProductsJson() {
  const variations = [];
  const parentProducts = [];

  DIVERSE_FAMILIES.forEach((fam, famIdx) => {
    const parentId = `cbh-fam-${famIdx + 1}`;
    const firstItem = fam.items[0];

    const parent = {
      id: parentId,
      name: fam.name,
      slug: fam.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: fam.category,
      standard: fam.standard,
      isoEquivalent: fam.isoEquivalent,
      diameter: firstItem.diameter,
      pitch: firstItem.pitch,
      length: firstItem.length,
      grade: firstItem.grade,
      basePricePerPiece: firstItem.pricePerPiece,
      basePricePerKg: firstItem.pricePerKg,
      weightPerPcKg: firstItem.weightPerPcKg,
      minQuantity: firstItem.minQuantity,
      imageUrl: firstItem.localImage,
      localImage: firstItem.localImage,
      driveId: '',
      variations: []
    };

    fam.items.forEach((item, itemIdx) => {
      const varId = `var-${famIdx + 1}-${itemIdx + 1}`;
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const variationObj = {
        id: parentId,
        variationId: varId,
        finishId: `fin-${item.finish}`,
        sku: item.sku,
        name: item.name,
        slug: slug,
        url: `https://cbh.store/products/${slug}`,
        category: fam.category,
        categoryHierarchy: ['Fasteners', fam.category, fam.name],
        standard: fam.standard,
        isoEquivalent: fam.isoEquivalent,
        grade: item.grade,
        diameter: item.diameter,
        pitch: item.pitch,
        length: item.length,
        finish: item.finish,
        finishName: item.finishName,
        pricePerPiece: item.pricePerPiece,
        originalPricePerPiece: parseFloat((item.pricePerPiece * 1.15).toFixed(2)),
        pricePerKg: item.pricePerKg,
        discountPercent: 15,
        weightPerPcKg: item.weightPerPcKg,
        minQuantity: item.minQuantity,
        stockQuantity: item.stockQuantity,
        isSurplus: false,
        material: item.material,
        headType: fam.headType,
        threadType: fam.threadType,
        manufacturingStandard: `${fam.standard} / IS 1364`,
        tensileStrength: item.tensileStrength,
        yieldStrength: item.yieldStrength,
        gst_hsn_code: fam.gst_hsn_code,
        imageUrl: item.localImage,
        localImage: item.localImage,
        driveId: ''
      };

      parent.variations.push(variationObj);
      variations.push(variationObj);
    });

    parentProducts.push(parent);
  });

  return {
    source: 'https://cbh.store/products',
    timestamp: new Date().toISOString(),
    totalVariations: variations.length,
    totalBaseProducts: parentProducts.length,
    parentProducts,
    allVariations: variations
  };
}

// Function to upload items to ERPNext
async function uploadToErpNext(variations) {
  console.log(`\n🚀 Uploading ${variations.length} diverse items to ERPNext Stock Item section...`);
  console.log(`Target: ${ERPNEXT_URL}\n`);

  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  for (const item of variations) {
    const itemPayload = {
      item_code: item.sku,
      item_name: item.name,
      item_group: 'Products',
      stock_uom: 'Nos',
      gst_hsn_code: item.gst_hsn_code || '73181500',
      is_stock_item: 1,
      is_fixed_asset: 0,
      is_sales_item: 1,
      is_purchase_item: 1,
      standard_rate: item.pricePerPiece,
      weight_per_unit: item.weightPerPcKg,
      weight_uom: 'Kg',
      description: `<b>CBH Industrial Fastener</b><br/>Standard: ${item.standard} (${item.isoEquivalent})<br/>Grade: ${item.grade}<br/>Finish: ${item.finishName}<br/>Dimensions: ${item.diameter} x ${item.length} (Pitch: ${item.pitch})<br/>Material: ${item.material}<br/>Tensile Strength: ${item.tensileStrength}<br/>Yield Strength: ${item.yieldStrength}`
    };

    try {
      // Check if item already exists
      const checkRes = await fetch(`${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(item.sku)}`, {
        headers: AUTH_HEADER
      });

      if (checkRes.status === 200) {
        // Update existing item
        const putRes = await fetch(`${ERPNEXT_URL}/api/resource/Item/${encodeURIComponent(item.sku)}`, {
          method: 'PUT',
          headers: AUTH_HEADER,
          body: JSON.stringify(itemPayload)
        });
        if (putRes.ok) {
          updateCount++;
          console.log(`  🔄 Updated [${item.sku}]: ${item.name}`);
        } else {
          const err = await putRes.text();
          console.warn(`  ⚠️ Failed to update [${item.sku}]: ${err.slice(0, 100)}`);
          errorCount++;
        }
      } else {
        // Create new item
        const postRes = await fetch(`${ERPNEXT_URL}/api/resource/Item`, {
          method: 'POST',
          headers: AUTH_HEADER,
          body: JSON.stringify(itemPayload)
        });
        if (postRes.ok) {
          successCount++;
          console.log(`  ✅ Created [${item.sku}]: ${item.name}`);
        } else {
          const err = await postRes.text();
          console.warn(`  ❌ Failed to create [${item.sku}]: ${err.slice(0, 100)}`);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`  ❌ Network error for [${item.sku}]:`, err.message);
      errorCount++;
    }

    // Small delay between requests to be polite to frappe cloud
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n======================================================`);
  console.log(` ERPNext Upload Summary:`);
  console.log(` - Created: ${successCount}`);
  console.log(` - Updated: ${updateCount}`);
  console.log(` - Errors:  ${errorCount}`);
  console.log(`======================================================\n`);
}

// Generate the TypeScript module
function generateTsCatalogModule(variations, parentProducts) {
  return `/**
 * CBH Fasteners - Live Product Catalog
 * Auto-generated with diverse fastener families
 * Source: https://cbh.store/products
 * Generated at: ${new Date().toISOString()}
 * Total Variations: ${variations.length} | Base Products: ${parentProducts.length}
 */

export interface CbhProductVariation {
  id: string;
  variationId: string;
  finishId: string;
  sku: string;
  name: string;
  slug: string;
  url: string;
  category: string;
  categoryHierarchy: string[];
  standard: string;
  isoEquivalent: string;
  grade: string;
  diameter: string;
  pitch: string;
  length: string;
  finish: string;
  finishName: string;
  pricePerPiece: number;
  originalPricePerPiece: number;
  pricePerKg: number;
  discountPercent: number;
  weightPerPcKg: number;
  minQuantity: number;
  stockQuantity: number;
  isSurplus: boolean;
  material: string;
  headType: string;
  threadType: string;
  manufacturingStandard: string;
  tensileStrength: string;
  yieldStrength: string;
  imageUrl: string | null;
  localImage: string;
  driveId: string;
  gst_hsn_code?: string;
}

export interface CbhParentProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  standard: string;
  isoEquivalent: string;
  diameter: string;
  pitch: string;
  length: string;
  grade: string;
  basePricePerPiece: number;
  basePricePerKg: number;
  weightPerPcKg: number;
  minQuantity: number;
  imageUrl: string | null;
  localImage: string;
  driveId: string;
  variations: CbhProductVariation[];
}

export const CBH_PRODUCTS: CbhProductVariation[] = ${JSON.stringify(variations, null, 2)};

export const CBH_PARENT_PRODUCTS: CbhParentProduct[] = ${JSON.stringify(parentProducts, null, 2)};

export default CBH_PRODUCTS;
`;
}

async function main() {
  console.log('Generating diverse product catalog...');
  const catalogData = buildCbhProductsJson();

  // 1. Write src/data/cbh-products.json
  fs.writeFileSync(CBH_PRODUCTS_JSON_PATH, JSON.stringify(catalogData, null, 2), 'utf-8');
  console.log(`✅ Saved ${catalogData.totalVariations} varied products to ${CBH_PRODUCTS_JSON_PATH}`);

  // 2. Write src/lib/cbh-catalog-products.ts
  const tsContent = generateTsCatalogModule(catalogData.allVariations, catalogData.parentProducts);
  fs.writeFileSync(CBH_CATALOG_TS_PATH, tsContent, 'utf-8');
  console.log(`✅ Saved TypeScript module to ${CBH_CATALOG_TS_PATH}`);

  // 3. Upload to ERPNext directly!
  await uploadToErpNext(catalogData.allVariations);

  // 4. Update ERPNext cached items & config in local store
  try {
    const fetchItemsRes = await fetch(`${ERPNEXT_URL}/api/resource/Item?fields=["name","item_code","item_name","item_group","gst_hsn_code","stock_uom","standard_rate","weight_per_unit","weight_uom","is_stock_item","is_sales_item","description"]&limit_page_length=100`, {
      headers: AUTH_HEADER
    });
    const itemsJson = await fetchItemsRes.json();
    if (itemsJson.data) {
      console.log(`\n📦 Total items currently in ERPNext: ${itemsJson.data.length}`);
      
      // Map to Product model for local products cache
      const cachedProducts = itemsJson.data.map((item, idx) => {
        const sku = item.item_code || item.name;
        const matchingVariation = catalogData.allVariations.find(v => v.sku.toUpperCase() === sku.toUpperCase());
        const weight = item.weight_per_unit || (matchingVariation ? matchingVariation.weightPerPcKg : 0.05);
        const rate = item.standard_rate || (matchingVariation ? matchingVariation.pricePerPiece : 10);
        return {
          id: 5000 + idx,
          sku: sku,
          name: item.item_name || sku,
          category: matchingVariation ? matchingVariation.category : (item.item_group || 'Hex Screws'),
          standard: matchingVariation ? matchingVariation.standard : 'DIN 933',
          grade: matchingVariation ? matchingVariation.grade : 'Grade 8.8',
          finish: matchingVariation ? matchingVariation.finishName : 'Zinc Plated',
          threadType: matchingVariation ? matchingVariation.threadType : 'Full Thread',
          diameter: matchingVariation ? matchingVariation.diameter : 'M10',
          lengthMm: matchingVariation ? parseInt(matchingVariation.length) || 50 : 50,
          pitchMm: matchingVariation ? parseFloat(matchingVariation.pitch) || 1.5 : 1.5,
          weightPerPcKg: weight,
          pricePerPiece: rate,
          originalPricePerPiece: parseFloat((rate * 1.15).toFixed(2)),
          pricePerKg: weight > 0 ? parseFloat((rate / weight).toFixed(2)) : 180,
          originalPricePerKg: weight > 0 ? parseFloat(((rate * 1.15) / weight).toFixed(2)) : 205,
          stockPcs: matchingVariation ? matchingVariation.stockQuantity : 25000,
          stockKg: matchingVariation ? (matchingVariation.stockQuantity * weight) : 1250,
          isInStock: true,
          isSurplus: false,
          imageUrl: matchingVariation ? matchingVariation.localImage : '/assets/bolt_zinc.jpg'
        };
      });

      fs.writeFileSync(ERPNEXT_CACHE_PATH, JSON.stringify(cachedProducts, null, 2), 'utf-8');
      console.log(`✅ Updated ${ERPNEXT_CACHE_PATH} with ${cachedProducts.length} items`);

      // Update erpnext-config.json
      const config = JSON.parse(fs.readFileSync(ERPNEXT_CONFIG_PATH, 'utf-8'));
      config.syncedItemsCount = itemsJson.data.length;
      config.lastSyncTime = new Date().toISOString();
      config.lastSyncStatus = 'CONNECTED';
      config.lastError = null;
      fs.writeFileSync(ERPNEXT_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`✅ Updated ${ERPNEXT_CONFIG_PATH}`);
    }
  } catch (err) {
    console.error('Error fetching cached items from ERPNext:', err);
  }

  console.log('\n🎉 ALL DONE! Catalog updated with diverse products and synced with ERPNext.');
}

main().catch(console.error);
