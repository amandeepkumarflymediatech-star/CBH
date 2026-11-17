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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-hex-bolts',
    slug: 'hex-bolts',
    name: 'Hex Bolts & Screws',
    name_hi: 'हेक्स बोल्ट व स्क्रू',
    tagline: 'High-tensile Grade 8.8, 10.9 & SS full & half thread bolts',
    description: 'DIN 931 / DIN 933 high-tensile hexagon head bolts and screws for heavy machinery and PEB.',
    tag: 'MOST POPULAR',
    tag_color: '#0052CC',
    image_url: '/assets/bolt_zinc.jpg',
    link: '/products?category=HEX%20BOLTS',
    is_featured: 1,
    sort_order: 1,
  },
  {
    id: 'cat-hex-screws',
    slug: 'hex-screws',
    name: 'Hexagon Head Screws',
    name_hi: 'हेक्सागन हेड स्क्रू',
    tagline: 'Precision engineered fully threaded hex screws across all metric sizes',
    description: 'Fully threaded metric hex set screws in high-tensile 8.8, 10.9, and 12.9 with passivated finishes.',
    tag: '16,000+ SIZES',
    tag_color: '#0A192F',
    image_url: '/assets/bolt_din933_zinc_1792746574604.jpg',
    link: '/products?category=HEX%20SCREWS',
    is_featured: 1,
    sort_order: 2,
  },
  {
    id: 'cat-socket-head',
    slug: 'socket-head',
    name: 'Socket Allen Screws',
    name_hi: 'सॉकेट हेड कैप स्क्रू (एलन)',
    tagline: 'Grade 12.9 high-tensile Allen bolts (DIN 912) and Grub screws',
    description: 'Precision cylindrical socket cap and countersunk Allen screws engineered for tight clearance assembly.',
    tag: 'GRADE 12.9',
    tag_color: '#D97706',
    image_url: '/assets/images/grub-screw-real.png',
    link: '/products?category=SOCKET%20HEAD',
    is_featured: 1,
    sort_order: 3,
  },
  {
    id: 'cat-hsfg-bolts',
    slug: 'hsfg-bolts',
    name: 'HSFG Structural Bolts',
    name_hi: 'एचएसएफजी स्ट्रक्चरल बोल्ट',
    tagline: 'High Strength Friction Grip bolts for bridges and steel frameworks',
    description: 'IS 3757 / IS 4000 compliant HSFG bolts engineered for load-bearing civil and railway infrastructure.',
    tag: 'STRUCTURAL',
    tag_color: '#7C3AED',
    image_url: '/assets/quality_cert_inspection.jpg',
    link: '/products?category=HSFG%20BOLTS',
    is_featured: 1,
    sort_order: 4,
  },
  {
    id: 'cat-carriage-bolts',
    slug: 'carriage-bolts',
    name: 'Carriage & Coach Bolts',
    name_hi: 'कैरिज व कोच बोल्ट',
    tagline: 'Mushroom head square neck carriage bolts (DIN 603)',
    description: 'Smooth round dome head bolts with anti-spin square collar for timber, security gates, and trailers.',
    tag: 'DIN 603',
    tag_color: '#0284C7',
    image_url: '/assets/hero.jpg',
    link: '/products?category=CARRIAGE%20BOLTS',
    is_featured: 1,
    sort_order: 5,
  },
  {
    id: 'cat-hex-flange',
    slug: 'hex-flange-bolts',
    name: 'Hex Flange & Frame Bolts',
    name_hi: 'हेक्स फ्लैंज बोल्ट',
    tagline: 'Integrated washer face bolts (DIN 6921) for automotive and frame assemblies',
    description: 'Flanged bolts distribute clamping pressure without requiring a separate washer. Serrated and smooth.',
    tag: 'AUTOMOTIVE',
    tag_color: '#059669',
    image_url: '/assets/bolt_zinc.jpg',
    link: '/products?category=HEX%20FLANGE%20BOLTS',
    is_featured: 1,
    sort_order: 6,
  },
  {
    id: 'cat-threaded-rods',
    slug: 'threaded-rods',
    name: 'Threaded Rods & Studs',
    name_hi: 'थ्रेडेड रॉड व स्टड बोल्ट',
    tagline: 'Continuous 1M, 2M, 3M rods and ASTM A193 B7 stud bolts',
    description: 'High tensile fully threaded tie bars and double-end studs for HVAC, pipe hanging, and petrochemical flanges.',
    tag: 'HEAVY TENSILE',
    tag_color: '#DC2626',
    image_url: '/assets/global_infra_bridge.jpg',
    link: '/products?category=THREADED%20RODS',
    is_featured: 1,
    sort_order: 7,
  },
  {
    id: 'cat-surplus-deals',
    slug: 'surplus-deals',
    name: 'Surplus Fastener Depot',
    name_hi: 'सरप्लस स्टॉक (-60% छूट)',
    tagline: 'Certified overstock fasteners from completed infrastructure contracts',
    description: 'Genuine factory overstock bolts, nuts, and screws sold at steep wholesale clearance discounts.',
    tag: '-60% SURPLUS',
    tag_color: '#FF6B00',
    image_url: '/assets/quality_optical_sorting.jpg',
    link: '/products?surplus=true',
    is_featured: 1,
    sort_order: 8,
  },
  {
    id: 'cat-hex-nuts',
    slug: 'hex-nuts',
    name: 'Hex Nuts & Lock Nuts',
    name_hi: 'हेक्स नट व लॉक नट',
    tagline: 'Precision internal thread DIN 934 hex, flange, and nyloc nuts',
    description: 'Heavy hex nuts, jam nuts, and self-locking nyloc nuts with precision metric internal threads.',
    tag: 'READY STOCK',
    tag_color: '#059669',
    image_url: '/assets/bolt_din933_zinc_1792746574604.jpg',
    link: '/products?category=NUTS',
    is_featured: 0,
    sort_order: 9,
  },
  {
    id: 'cat-washers',
    slug: 'washers',
    name: 'Industrial Washers',
    name_hi: 'प्लेन व स्प्रिंग वाशर',
    tagline: 'Flat plain washers, spring split & disc washers for vibration lock',
    description: 'Flat plain washers, spring split washers and conical disc washers to prevent bolt loosening.',
    tag: 'ANTI-VIBRATION',
    tag_color: '#4F46E5',
    image_url: '/assets/quality_optical_sorting.jpg',
    link: '/products?category=WASHERS',
    is_featured: 0,
    sort_order: 10,
  },
  {
    id: 'cat-roofing-bolts',
    slug: 'roofing-bolts',
    name: 'Roofing & Cladding Bolts',
    name_hi: 'रूफिंग बोल्ट',
    tagline: 'Cross-slotted mushroom head bolts with square nuts for tin sheds and cladding',
    description: 'Standard roofing bolts supplied with square nuts for structural roofing, HVAC ducting, and wire mesh.',
    tag: 'SHED & ROOFING',
    tag_color: '#475569',
    image_url: '/assets/hero.jpg',
    link: '/products?category=ROOFING%20BOLTS',
    is_featured: 0,
    sort_order: 11,
  },
  {
    id: 'cat-anti-theft',
    slug: 'anti-theft-bolts',
    name: 'Anti-Theft Security Bolts',
    name_hi: 'एंटी-थेफ्ट सिक्योरिटी बोल्ट',
    tagline: 'Tamper-proof shear bolts and one-way drive fasteners for public infrastructure',
    description: 'Security fasteners engineered for solar panels, railway signals, street poles, and high-security installations.',
    tag: 'TAMPER-PROOF',
    tag_color: '#1E293B',
    image_url: '/assets/global_solar_wind.jpg',
    link: '/products?category=ANTI%20THEFT%20BOLTS',
    is_featured: 0,
    sort_order: 12,
  },
];

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'cbh',
  });

  console.log('Connected to MySQL database.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS catalog_categories (
      id VARCHAR(100) PRIMARY KEY,
      slug VARCHAR(150) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      name_hi VARCHAR(255),
      tagline VARCHAR(500),
      description TEXT,
      tag VARCHAR(100),
      tag_color VARCHAR(50),
      image_url VARCHAR(500),
      banner_url VARCHAR(500),
      link VARCHAR(255),
      is_featured TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  for (const c of DEFAULT_CATEGORIES) {
    await conn.query(`
      INSERT INTO catalog_categories
      (id, slug, name, name_hi, tagline, description, tag, tag_color, image_url, banner_url, link, is_featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      name_hi = VALUES(name_hi),
      tagline = VALUES(tagline),
      description = VALUES(description),
      tag = VALUES(tag),
      tag_color = VALUES(tag_color),
      image_url = VALUES(image_url),
      link = VALUES(link),
      is_featured = VALUES(is_featured),
      sort_order = VALUES(sort_order)
    `, [
      c.id,
      c.slug,
      c.name,
      c.name_hi,
      c.tagline,
      c.description,
      c.tag,
      c.tag_color,
      c.image_url,
      c.link,
      c.is_featured,
      c.sort_order,
    ]);
  }

  const [rows] = await conn.query('SELECT id, slug, name, is_featured, sort_order FROM catalog_categories ORDER BY sort_order');
  console.log(`Successfully seeded ${rows.length} categories into MySQL!`);
  console.log(rows);

  await conn.end();
}

seed().catch(console.error);
