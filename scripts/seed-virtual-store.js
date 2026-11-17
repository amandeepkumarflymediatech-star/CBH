const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'CBH'
  });

  console.log('Connected to MySQL');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS virtual_store_zones (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subtitle VARCHAR(500),
      category VARCHAR(150),
      aisle_code VARCHAR(50) DEFAULT '',
      sku_count INT DEFAULT 0,
      color VARCHAR(50) DEFAULT '#0052CC',
      cam_pos_json VARCHAR(255),
      cam_look_json VARCHAR(255),
      hotspot_pos_json VARCHAR(255),
      is_active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 0,
      featured_sku VARCHAR(150),
      featured_product_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try { await conn.query('ALTER TABLE virtual_store_zones ADD COLUMN aisle_code VARCHAR(50) DEFAULT ""'); } catch {}
  try { await conn.query('ALTER TABLE virtual_store_zones ADD COLUMN sku_count INT DEFAULT 0'); } catch {}
  try { await conn.query('ALTER TABLE virtual_store_zones ADD COLUMN color VARCHAR(50) DEFAULT "#0052CC"'); } catch {}

  // Truncate and seed fresh 8 bays
  await conn.query('DELETE FROM virtual_store_zones');

  const ZONES = [
    {
      id: 'bay-hex-screws',
      name: 'Bay 01: Hex Head Screws',
      subtitle: 'DIN 933 / ISO 4017 Full-Thread High-Tensile Screws (Grade 8.8, 10.9, 12.9)',
      category: 'HEX SCREWS',
      aisleCode: 'AISLE 1-A',
      camPos: [-12, 8, -12],
      camLook: [-4, 2, -6],
      hotspotPos: [-4, 2.5, -6],
      color: '#0052CC',
      isActive: 1,
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
      camPos: [-12, 8, -4],
      camLook: [-4, 2, 0],
      hotspotPos: [-4, 2.5, 0],
      color: '#2563EB',
      isActive: 1,
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
      camPos: [-12, 8, 4],
      camLook: [-4, 2, 6],
      hotspotPos: [-4, 2.5, 6],
      color: '#D97706',
      isActive: 1,
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
      camPos: [-12, 8, 12],
      camLook: [-4, 2, 12],
      hotspotPos: [-4, 2.5, 12],
      color: '#059669',
      isActive: 1,
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
      camPos: [12, 8, -12],
      camLook: [4, 2, -6],
      hotspotPos: [4, 2.5, -6],
      color: '#7C3AED',
      isActive: 1,
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
      camPos: [12, 8, -4],
      camLook: [4, 2, 0],
      hotspotPos: [4, 2.5, 0],
      color: '#EA580C',
      isActive: 1,
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
      camPos: [12, 8, 4],
      camLook: [4, 2, 6],
      hotspotPos: [4, 2.5, 6],
      color: '#0891B2',
      isActive: 1,
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
      camPos: [12, 8, 12],
      camLook: [4, 2, 12],
      hotspotPos: [4, 2.5, 12],
      color: '#10B981',
      isActive: 1,
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

  for (const z of ZONES) {
    // Calculate live count from products table
    let count = 0;
    const [cRows] = await conn.query('SELECT COUNT(*) as count FROM products WHERE category LIKE ?', [`%${z.category}%`]);
    if (cRows && cRows[0]) count = cRows[0].count;

    await conn.query(`
      INSERT INTO virtual_store_zones
      (id, name, subtitle, category, aisle_code, sku_count, color, cam_pos_json, cam_look_json, hotspot_pos_json, is_active, sort_order, featured_sku, featured_product_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      z.id,
      z.name,
      z.subtitle,
      z.category,
      z.aisleCode,
      count,
      z.color,
      JSON.stringify(z.camPos),
      JSON.stringify(z.camLook),
      JSON.stringify(z.hotspotPos),
      z.isActive,
      z.sortOrder,
      z.featuredSku,
      JSON.stringify(z.featuredProduct)
    ]);
    console.log(`Seeded ${z.name}: ${count} SKUs`);
  }

  console.log('Seeding completed successfully!');
  await conn.end();
}

run().catch(console.error);
