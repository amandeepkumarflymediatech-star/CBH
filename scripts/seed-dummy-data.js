/**
 * CBH FASTENERS - COMPREHENSIVE MYSQL DUMMY DATA SEEDER
 * 
 * Seeds all 10 relational tables in MySQL (CBH):
 * 1. users
 * 2. categories
 * 3. tier_settings
 * 4. products (from src/data/cbh-products.json)
 * 5. bulk_rfqs & rfq_items
 * 6. orders & order_items
 * 7. surplus_lots
 * 8. blogs (from src/data/blogs-data.json)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Parse .env
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

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('   🌱 CBH FASTENERS - MYSQL DUMMY DATA SEEDER');
  console.log('======================================================\n');

  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root@123',
    database: process.env.DB_NAME || 'CBH',
    multipleStatements: true,
  };

  console.log(`📡 Connecting to MySQL [${connectionConfig.host}:${connectionConfig.port}] DB [${connectionConfig.database}]...`);
  const conn = await mysql.createConnection(connectionConfig);
  console.log('✓ Connected successfully.\n');

  try {
    // Disable foreign key checks for clean truncation and re-seed
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Truncate tables to ensure fresh, clean dummy data
    const tablesToClean = [
      'order_items', 'orders',
      'rfq_items', 'bulk_rfqs',
      'products', 'categories',
      'tier_settings', 'users',
      'surplus_lots', 'blogs'
    ];
    for (const tbl of tablesToClean) {
      await conn.query(`TRUNCATE TABLE \`${tbl}\`;`);
    }
    console.log('✓ Cleaned existing records in all tables.');

    // 1. Seed Categories
    console.log('\n📁 [1/8] Seeding Fastener Categories...');
    const categoriesData = [
      { slug: 'hex-screws', name: 'Hexagon Head Screws', standard_prefix: 'DIN 933 / ISO 4017', description: 'Fully threaded precision hex cap screws Grade 5.8, 8.8, 10.9, SS304/SS316' },
      { slug: 'hex-bolts', name: 'Heavy Hexagon Bolts', standard_prefix: 'DIN 931 / ISO 4014', description: 'Partially threaded structural hex bolts for civil infrastructure and machinery' },
      { slug: 'socket-cap', name: 'Hexagon Socket Head Cap', standard_prefix: 'DIN 912 / ISO 4762', description: 'High-tensile Grade 12.9 internal hex Allen drive fasteners' },
      { slug: 'nuts', name: 'Industrial Hexagon Nuts', standard_prefix: 'DIN 934 / ISO 4032', description: 'Class 8 and Class 10 heavy hex coupling and locking nuts' },
      { slug: 'anchors', name: 'Concrete & Masonry Anchors', standard_prefix: 'ETA Option 7', description: 'Heavy-duty through-bolt wedge, sleeve, and chemical drop-in anchors' },
      { slug: 'threaded-rods', name: 'Continuous Thread Stud Rods', standard_prefix: 'ASTM A193 B7', description: 'High-temperature, high-pressure alloy continuous studs 1m, 2m, 3m' },
      { slug: 'washers', name: 'High-Tensile Washers', standard_prefix: 'DIN 125 / DIN 127', description: 'Hardened flat, spring, and disc Belleville washers' },
    ];

    const categoryMap = new Map();
    for (const c of categoriesData) {
      const [res] = await conn.query(
        'INSERT INTO categories (slug, name, standard_prefix, description) VALUES (?, ?, ?, ?)',
        [c.slug, c.name, c.standard_prefix, c.description]
      );
      categoryMap.set(c.slug, res.insertId);
    }
    console.log(`✓ Seeded ${categoriesData.length} fastener categories.`);

    // 2. Seed Users
    console.log('\n👤 [2/8] Seeding Users & Customer Profiles...');
    const usersData = [
      {
        email: 'admin@cbh.store',
        password_hash: 'Admin@Fastener2025',
        full_name: 'Harpreet Singh',
        company_name: 'CBH Fasteners Tech Pvt. Ltd.',
        gstin: '03AABCC1234F1Z0',
        phone: '+91 98880 21000',
        role: 'admin',
        tier: 'VIP',
        tier_discount_pct: 25.00,
        credit_limit: 1000000.00,
        is_verified: 1
      },
      {
        email: 'procurement@apexinfra.com',
        password_hash: 'Password@123',
        full_name: 'Rajesh Sharma',
        company_name: 'Apex Heavy Infrastructure Ltd.',
        gstin: '29AABCA1234F1Z5',
        phone: '+91 98880 21000',
        role: 'customer',
        tier: 'DIAMOND',
        tier_discount_pct: 18.00,
        credit_limit: 500000.00,
        is_verified: 1
      },
      {
        email: 'purchase@larsenturbo-infra.in',
        password_hash: 'Password@123',
        full_name: 'Vikram Malhotra',
        company_name: 'Larsen Turbo & Heavy Engineering',
        gstin: '27AAACL1982K1ZU',
        phone: '+91 98201 54321',
        role: 'customer',
        tier: 'GOLD',
        tier_discount_pct: 12.00,
        credit_limit: 350000.00,
        is_verified: 1
      },
      {
        email: 'stores@tata-projects-metro.com',
        password_hash: 'Password@123',
        full_name: 'Ananya Sengupta',
        company_name: 'Tata Projects Metro Division',
        gstin: '07AAACT2345M1Z8',
        phone: '+91 98110 87654',
        role: 'customer',
        tier: 'SILVER',
        tier_discount_pct: 8.00,
        credit_limit: 200000.00,
        is_verified: 1
      },
      {
        email: 'quality@cbh.store',
        password_hash: 'Quality@2025',
        full_name: 'Dr. K. N. Verma (Chief Metallurgist)',
        company_name: 'CBH Metallurgy & Testing Lab',
        gstin: '03AABCC1234F1Z0',
        phone: '+91 98880 21001',
        role: 'metallurgist',
        tier: 'VIP',
        tier_discount_pct: 0.00,
        credit_limit: 0.00,
        is_verified: 1
      }
    ];

    const userIds = [];
    for (const u of usersData) {
      const [res] = await conn.query(
        `INSERT INTO users (email, password_hash, full_name, company_name, gstin, phone, role, tier, tier_discount_pct, credit_limit, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.email, u.password_hash, u.full_name, u.company_name, u.gstin, u.phone, u.role, u.tier, u.tier_discount_pct, u.credit_limit, u.is_verified]
      );
      userIds.push({ email: u.email, id: res.insertId, name: u.full_name, company: u.company_name, gstin: u.gstin });
    }
    console.log(`✓ Seeded ${usersData.length} users (Admin, Customers, Metallurgist).`);

    // 3. Seed Tier Settings
    console.log('\n💰 [3/8] Seeding Volume Tier Rebate Settings...');
    const tierSettings = [
      { tier_name: 'BRONZE', min_order_value: 10000.00, discount_pct: 3.00, description: 'Standard wholesale starter discount for orders above ₹10,000' },
      { tier_name: 'SILVER', min_order_value: 50000.00, discount_pct: 5.00, description: 'Mid-scale EPC contractor discount for orders above ₹50,000' },
      { tier_name: 'GOLD', min_order_value: 100000.00, discount_pct: 12.00, description: 'Large industrial infrastructure discount for orders above ₹1,00,000' },
      { tier_name: 'PLATINUM', min_order_value: 250000.00, discount_pct: 18.00, description: 'Enterprise bulk procurement discount for orders above ₹2,50,000' },
      { tier_name: 'DIAMOND', min_order_value: 500000.00, discount_pct: 25.00, description: 'High-volume master distributor & mega project rebate above ₹5,00,000' },
    ];
    for (const t of tierSettings) {
      await conn.query(
        'INSERT INTO tier_settings (tier_name, min_order_value, discount_pct, description) VALUES (?, ?, ?, ?)',
        [t.tier_name, t.min_order_value, t.discount_pct, t.description]
      );
    }
    console.log(`✓ Seeded ${tierSettings.length} volume tier settings.`);

    // 4. Seed Products
    console.log('\n🔩 [4/8] Seeding Fastener Catalog Products from JSON...');
    const productsJsonPath = path.resolve(__dirname, '..', 'src', 'data', 'cbh-products.json');
    let productVariations = [];
    if (fs.existsSync(productsJsonPath)) {
      const raw = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
      if (raw.parentProducts) {
        for (const parent of raw.parentProducts) {
          if (parent.variations && parent.variations.length > 0) {
            productVariations.push(...parent.variations);
          }
        }
      }
    }

    const insertedProducts = [];
    for (const p of productVariations) {
      // Determine category ID
      let catId = categoryMap.get('hex-screws');
      const catLower = (p.category || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      if (catLower.includes('nut') || nameLower.includes('nut')) catId = categoryMap.get('nuts');
      else if (catLower.includes('socket') || nameLower.includes('socket')) catId = categoryMap.get('socket-cap');
      else if (catLower.includes('bolt') || nameLower.includes('bolt')) catId = categoryMap.get('hex-bolts');
      else if (catLower.includes('rod') || catLower.includes('stud') || nameLower.includes('stud')) catId = categoryMap.get('threaded-rods');
      else if (catLower.includes('anchor') || nameLower.includes('anchor')) catId = categoryMap.get('anchors');

      const lengthVal = parseInt(String(p.length || '100').replace(/[^0-9]/g, '')) || 100;
      const pitchVal = parseFloat(String(p.pitch || '1.5').replace(/[^0-9.]/g, '')) || 1.5;
      const weightVal = parseFloat(p.weightPerPcKg) || 0.06;
      const pricePc = parseFloat(p.pricePerPiece) || 5.50;
      const origPricePc = parseFloat(p.originalPricePerPiece) || pricePc * 1.15;
      const priceKg = parseFloat(p.pricePerKg) || 120.00;
      const origPriceKg = parseFloat(p.originalPricePerKg) || priceKg * 1.15;
      const stockPcs = parseInt(p.stockQuantity) || 15000;
      const stockKg = parseFloat((stockPcs * weightVal).toFixed(2));
      const isSurplus = Boolean(p.isSurplus);
      const surplusDiscount = isSurplus ? (p.discountPercent || 40) : 0;
      const mtcReport = `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`;
      const bisCert = `BIS-CM/L-${Math.floor(7000000 + Math.random() * 900000)}`;

      const [res] = await conn.query(
        `INSERT INTO products (
          sku, name, category_id, standard, grade, finish, thread_type, diameter, length_mm, pitch_mm,
          weight_per_pc_kg, price_per_piece, original_price_per_piece, price_per_kg, original_price_per_kg,
          stock_pcs, stock_kg, min_order_pcs, min_order_kg, is_in_stock, is_surplus, surplus_discount_pct,
          image_url, mtc_report_number, bis_cert_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.sku,
          p.name,
          catId,
          p.standard || 'DIN 933',
          p.grade || 'Grade 5.8',
          p.finishName || p.finish || 'Self Black',
          p.threadType || 'Metric Coarse (Full Thread)',
          p.diameter || 'M10',
          lengthVal,
          pitchVal,
          weightVal,
          pricePc,
          origPricePc,
          priceKg,
          origPriceKg,
          stockPcs,
          stockKg,
          p.minQuantity || 100,
          5.0,
          true,
          isSurplus,
          surplusDiscount,
          p.localImage || p.imageUrl || '/assets/bolt_zinc.jpg',
          mtcReport,
          bisCert
        ]
      );
      insertedProducts.push({
        id: res.insertId,
        sku: p.sku,
        name: p.name,
        standard: p.standard || 'DIN 933',
        pricePerPiece: pricePc,
        pricePerKg: priceKg,
        weightPerPcKg: weightVal
      });
    }
    console.log(`✓ Seeded ${insertedProducts.length} fastener products.`);

    // 5. Seed RFQs & RFQ Items
    console.log('\n📋 [5/8] Seeding Bulk RFQ Quotations & Line Items...');
    const apexUser = userIds.find(u => u.email === 'procurement@apexinfra.com') || userIds[1];
    const larsenUser = userIds.find(u => u.email === 'purchase@larsenturbo-infra.in') || userIds[2];
    const tataUser = userIds.find(u => u.email === 'stores@tata-projects-metro.com') || userIds[3];

    const rfqSeeds = [
      {
        rfq_number: 'RFQ-CBH-2025-9831',
        customer_id: apexUser.id,
        contact_name: apexUser.name,
        company_name: apexUser.company,
        gstin: apexUser.gstin,
        phone: '+91 98880 21000',
        email: apexUser.email,
        shipping_pincode: '201309',
        global_unit: 'PCS',
        gross_amount: 124500.00,
        slab_discount_pct: 12.00,
        slab_discount_amount: 14940.00,
        freight_amount: 3200.00,
        gst_rate_pct: 18.00,
        gst_amount: 20296.80,
        net_total: 133056.80,
        total_weight_kg: 1420.50,
        status: 'QUOTED',
        admin_notes: '12% volume rebate applied for Apex Infra quarterly consignment.',
        validity_date: '2026-11-30'
      },
      {
        rfq_number: 'RFQ-CBH-2025-9832',
        customer_id: larsenUser.id,
        contact_name: larsenUser.name,
        company_name: larsenUser.company,
        gstin: larsenUser.gstin,
        phone: '+91 98201 54321',
        email: larsenUser.email,
        shipping_pincode: '600120',
        global_unit: 'KGS',
        gross_amount: 385000.00,
        slab_discount_pct: 18.00,
        slab_discount_amount: 69300.00,
        freight_amount: 8500.00,
        gst_rate_pct: 18.00,
        gst_amount: 58356.00,
        net_total: 382556.00,
        total_weight_kg: 3890.00,
        status: 'IN_REVIEW',
        admin_notes: 'Under review by Chief Metallurgist for marine grade certification.',
        validity_date: '2026-11-20'
      },
      {
        rfq_number: 'RFQ-CBH-2025-9833',
        customer_id: tataUser.id,
        contact_name: tataUser.name,
        company_name: tataUser.company,
        gstin: tataUser.gstin,
        phone: '+91 98110 87654',
        email: tataUser.email,
        shipping_pincode: '110001',
        global_unit: 'PCS',
        gross_amount: 78400.00,
        slab_discount_pct: 5.00,
        slab_discount_amount: 3920.00,
        freight_amount: 1800.00,
        gst_rate_pct: 18.00,
        gst_amount: 13730.40,
        net_total: 90010.40,
        total_weight_kg: 840.20,
        status: 'PENDING',
        admin_notes: 'New RFQ received from Tata Metro Division. Awaiting logistics estimation.',
        validity_date: '2026-11-15'
      },
      {
        rfq_number: 'RFQ-CBH-2025-9834',
        customer_id: apexUser.id,
        contact_name: apexUser.name,
        company_name: apexUser.company,
        gstin: apexUser.gstin,
        phone: '+91 98880 21000',
        email: apexUser.email,
        shipping_pincode: '380009',
        global_unit: 'PCS',
        gross_amount: 215000.00,
        slab_discount_pct: 15.00,
        slab_discount_amount: 32250.00,
        freight_amount: 4500.00,
        gst_rate_pct: 18.00,
        gst_amount: 33705.00,
        net_total: 220955.00,
        total_weight_kg: 2100.00,
        status: 'CONVERTED_TO_PO',
        admin_notes: 'Quotation accepted and approved. Purchase order CBH-ORD-2025-8841 generated.',
        validity_date: '2026-11-25'
      }
    ];

    for (const rfq of rfqSeeds) {
      const [res] = await conn.query(
        `INSERT INTO bulk_rfqs (
          rfq_number, customer_id, contact_name, company_name, gstin, phone, email, shipping_pincode,
          global_unit, gross_amount, slab_discount_pct, slab_discount_amount, freight_amount,
          gst_rate_pct, gst_amount, net_total, total_weight_kg, status, admin_notes, validity_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rfq.rfq_number, rfq.customer_id, rfq.contact_name, rfq.company_name, rfq.gstin, rfq.phone,
          rfq.email, rfq.shipping_pincode, rfq.global_unit, rfq.gross_amount, rfq.slab_discount_pct,
          rfq.slab_discount_amount, rfq.freight_amount, rfq.gst_rate_pct, rfq.gst_amount, rfq.net_total,
          rfq.total_weight_kg, rfq.status, rfq.admin_notes, rfq.validity_date
        ]
      );
      const rfqId = res.insertId;

      // Add line items
      const itemsToPick = insertedProducts.slice(0, 3);
      for (const prod of itemsToPick) {
        const qty = rfq.global_unit === 'PCS' ? 5000 : 500;
        const totalWt = rfq.global_unit === 'PCS' ? qty * prod.weightPerPcKg : qty;
        const rate = rfq.global_unit === 'PCS' ? prod.pricePerPiece : prod.pricePerKg;
        const rowTot = rate * qty;

        await conn.query(
          `INSERT INTO rfq_items (rfq_id, product_id, sku, item_description, standard, unit, unit_rate, quantity, total_weight_kg, row_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rfqId, prod.id, prod.sku, prod.name, prod.standard, rfq.global_unit, rate, qty, totalWt, rowTot]
        );
      }
    }
    console.log(`✓ Seeded ${rfqSeeds.length} bulk RFQs with line items.`);

    // 6. Seed Orders & Order Items
    console.log('\n📦 [6/8] Seeding Purchase Orders & Logistics Tracking...');
    const orderSeeds = [
      {
        order_number: 'CBH-ORD-2025-8841',
        customer_id: apexUser.id,
        gross_amount: 185000.00,
        discount_amount: 22200.00,
        gst_amount: 29304.00,
        net_amount: 192104.00,
        total_weight_kg: 1840.00,
        shipping_address: 'Apex Infra Heavy Yard 4, Sector 62, Noida, Uttar Pradesh',
        delivery_pincode: '201309',
        carrier_name: 'Blue Dart Express',
        tracking_number: 'BDX-982341092',
        dispatch_date: new Date(Date.now() - 86400000 * 2),
        estimated_delivery: new Date(Date.now() + 86400000 * 2),
        order_status: 'IN_TRANSIT',
        payment_status: 'PAID',
        mtc_document_url: 'MTC-CBH-2025-8841-NABL'
      },
      {
        order_number: 'CBH-ORD-2025-8842',
        customer_id: larsenUser.id,
        gross_amount: 412000.00,
        discount_amount: 61800.00,
        gst_amount: 63036.00,
        net_amount: 413236.00,
        total_weight_kg: 4200.00,
        shipping_address: 'L&T Construction Heavy Yard, Kattupalli Port, Chennai, Tamil Nadu',
        delivery_pincode: '600120',
        carrier_name: 'TCI Freight Logistics',
        tracking_number: 'TCI-66219803',
        dispatch_date: new Date(Date.now() - 86400000 * 7),
        estimated_delivery: new Date(Date.now() - 86400000 * 1),
        order_status: 'DELIVERED',
        payment_status: 'PAID',
        mtc_document_url: 'MTC-CBH-2025-8842-NABL'
      },
      {
        order_number: 'CBH-ORD-2025-8843',
        customer_id: tataUser.id,
        gross_amount: 94000.00,
        discount_amount: 4700.00,
        gst_amount: 16074.00,
        net_amount: 105374.00,
        total_weight_kg: 920.00,
        shipping_address: 'DMRC Metro Depot Site, Mandi House Station, New Delhi',
        delivery_pincode: '110001',
        carrier_name: 'V-Trans India Ltd',
        tracking_number: 'VT-7782194',
        dispatch_date: null,
        estimated_delivery: new Date(Date.now() + 86400000 * 5),
        order_status: 'PROCESSING',
        payment_status: '30_DAYS_CREDIT',
        mtc_document_url: 'MTC-CBH-2025-8843-NABL'
      },
      {
        order_number: 'CBH-ORD-2025-8844',
        customer_id: apexUser.id,
        gross_amount: 68500.00,
        discount_amount: 3425.00,
        gst_amount: 11713.50,
        net_amount: 76788.50,
        total_weight_kg: 640.00,
        shipping_address: 'Apex Bridge Construction Pier 14, Sabarmati Riverfront, Ahmedabad, Gujarat',
        delivery_pincode: '380009',
        carrier_name: 'Safexpress',
        tracking_number: 'SFX-5491023',
        dispatch_date: new Date(Date.now() - 86400000 * 1),
        estimated_delivery: new Date(Date.now() + 86400000 * 3),
        order_status: 'DISPATCHED',
        payment_status: 'PAID',
        mtc_document_url: 'MTC-CBH-2025-8844-NABL'
      }
    ];

    for (const ord of orderSeeds) {
      const [res] = await conn.query(
        `INSERT INTO orders (
          order_number, customer_id, gross_amount, discount_amount, gst_amount, net_amount, total_weight_kg,
          shipping_address, delivery_pincode, carrier_name, tracking_number, dispatch_date, estimated_delivery,
          order_status, payment_status, mtc_document_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ord.order_number, ord.customer_id, ord.gross_amount, ord.discount_amount, ord.gst_amount,
          ord.net_amount, ord.total_weight_kg, ord.shipping_address, ord.delivery_pincode, ord.carrier_name,
          ord.tracking_number, ord.dispatch_date, ord.estimated_delivery, ord.order_status, ord.payment_status,
          ord.mtc_document_url
        ]
      );
      const orderId = res.insertId;

      // Add order items
      const itemsToPick = insertedProducts.slice(2, 5);
      for (const prod of itemsToPick) {
        const qty = 3000;
        const rowTot = prod.pricePerPiece * qty;
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, sku, item_name, standard, quantity, unit, unit_price, row_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, prod.id, prod.sku, prod.name, prod.standard, qty, 'PCS', prod.pricePerPiece, rowTot]
        );
      }
    }
    console.log(`✓ Seeded ${orderSeeds.length} orders with tracking & line items.`);

    // 7. Seed Surplus Lots
    console.log('\n🏭 [7/8] Seeding Surplus Fastener Liquidation Lots...');
    const surplusSeeds = [
      {
        lot_number: 'SURP-DIN933-M12-100-8.8',
        title: 'Hex Head Screws DIN 933 M12x100mm Grade 8.8 Black Phosphate',
        description: 'Certified EPC surplus lot from Solar Plant construction. 100% mill inspected with 3.1 NABL certs.',
        spec_standard: 'DIN 933 / IS 1364 Grade 8.8 M12x100mm',
        total_weight_tonnes: 1.09,
        market_price_per_kg: 165.00,
        clearance_price_per_kg: 99.00,
        discount_pct: 40,
        depot_location: 'Bhiwandi Logistics Hub, Maharashtra',
        status: 'AVAILABLE',
        image_url: '/assets/bolt_zinc.jpg'
      },
      {
        lot_number: 'SURP-DIN912-M16-80-12.9',
        title: 'Socket Head Cap Screws DIN 912 M16x80mm Grade 12.9 High Tensile',
        description: 'Heavy machinery manufacturing excess inventory. Unopened factory barrels with rust-preventive oil coating.',
        spec_standard: 'DIN 912 / ISO 4762 Grade 12.9 M16x80mm',
        total_weight_tonnes: 1.15,
        market_price_per_kg: 210.00,
        clearance_price_per_kg: 115.50,
        discount_pct: 45,
        depot_location: 'Ludhiana Central Depot, Punjab',
        status: 'AVAILABLE',
        image_url: '/assets/bolt_zinc.jpg'
      },
      {
        lot_number: 'SURP-SS316-M10-60-A4',
        title: 'Marine Grade Stainless Hex Bolts SS 316 (A4-70) M10x60mm',
        description: 'High corrosion resistance austenitic stainless fasteners for coastal dockyards and chemical plants.',
        spec_standard: 'ISO 4017 / DIN 933 SS316 (A4-70)',
        total_weight_tonnes: 0.62,
        market_price_per_kg: 420.00,
        clearance_price_per_kg: 252.00,
        discount_pct: 40,
        depot_location: 'Hazira Port Warehouse, Gujarat',
        status: 'AVAILABLE',
        image_url: '/assets/bolt_zinc.jpg'
      },
      {
        lot_number: 'SURP-ASTM-B7-M24-3000',
        title: 'ASTM A193 Grade B7 Heavy Continuous Studs M24x3000mm',
        description: 'Refinery expansion surplus studs. Heat treated chrome-moly steel for high temperature flanged joints.',
        spec_standard: 'ASTM A193 B7 / IS 1862 M24x3000mm',
        total_weight_tonnes: 3.50,
        market_price_per_kg: 195.00,
        clearance_price_per_kg: 117.00,
        discount_pct: 40,
        depot_location: 'Jamnagar Refinery Ancillary Yard, Gujarat',
        status: 'RESERVED',
        image_url: '/assets/bolt_zinc.jpg'
      }
    ];

    for (const lot of surplusSeeds) {
      await conn.query(
        `INSERT INTO surplus_lots (
          lot_number, title, description, spec_standard, total_weight_tonnes, market_price_per_kg,
          clearance_price_per_kg, discount_pct, depot_location, status, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lot.lot_number, lot.title, lot.description, lot.spec_standard, lot.total_weight_tonnes,
          lot.market_price_per_kg, lot.clearance_price_per_kg, lot.discount_pct, lot.depot_location,
          lot.status, lot.image_url
        ]
      );
    }
    console.log(`✓ Seeded ${surplusSeeds.length} surplus liquidation lots.`);

    // 8. Seed Blogs
    console.log('\n📚 [8/8] Seeding Engineering Blog Articles...');
    const blogsJsonPath = path.resolve(__dirname, '..', 'src', 'data', 'blogs-data.json');
    if (fs.existsSync(blogsJsonPath)) {
      const blogsData = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));
      for (const b of blogsData) {
        await conn.query(
          `INSERT INTO blogs (slug, title, excerpt, content, category, read_time, publish_date, author, image_url, is_featured, status, views, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.slug || b.id,
            b.title,
            b.excerpt,
            b.content,
            b.category,
            b.readTime || '5 min read',
            b.date,
            b.author,
            b.image,
            b.featured ? 1 : 0,
            b.status || 'PUBLISHED',
            b.views || 120,
            JSON.stringify(b.tags || [])
          ]
        );
      }
      console.log(`✓ Seeded ${blogsData.length} technical blog articles.`);
    }

    // Re-enable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n======================================================');
    console.log('🎉 [SUCCESS] All Dummy Data Seeded Successfully!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('\n❌ Seeding error:', err.message);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

seedDatabase();
