import fs from 'fs';
import path from 'path';
import { query } from './db';
import { VirtualStoreZone, DEFAULT_ZONES } from './virtual-store-types';

export type { VirtualStoreZone };
export { DEFAULT_ZONES };

const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'virtual-store-zones.json');
let schemaEnsured = false;

export async function ensureVirtualStoreSchema() {
  if (schemaEnsured) return;
  try {
    await query(`
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

    // Ensure all columns exist
    try { await query('ALTER TABLE virtual_store_zones ADD COLUMN aisle_code VARCHAR(50) DEFAULT ""'); } catch {}
    try { await query('ALTER TABLE virtual_store_zones ADD COLUMN sku_count INT DEFAULT 0'); } catch {}
    try { await query('ALTER TABLE virtual_store_zones ADD COLUMN color VARCHAR(50) DEFAULT "#0052CC"'); } catch {}

    // Seed or update any missing DEFAULT_ZONES
    for (const z of DEFAULT_ZONES) {
      await query(`
        INSERT INTO virtual_store_zones
        (id, name, subtitle, category, aisle_code, sku_count, color, cam_pos_json, cam_look_json, hotspot_pos_json, is_active, sort_order, featured_sku, featured_product_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          aisle_code = COALESCE(NULLIF(aisle_code, ''), VALUES(aisle_code)),
          color = COALESCE(NULLIF(color, ''), VALUES(color)),
          sort_order = VALUES(sort_order)
      `, [
        z.id,
        z.name,
        z.subtitle,
        z.category,
        z.aisleCode || '',
        z.skuCount || 0,
        z.color || '#0052CC',
        JSON.stringify(z.camPos),
        JSON.stringify(z.camLook),
        JSON.stringify(z.hotspotPos),
        z.isActive ? 1 : 0,
        z.sortOrder,
        z.featuredSku || '',
        JSON.stringify(z.featuredProduct),
      ]);
    }

    schemaEnsured = true;
  } catch (err) {
    console.warn('[Virtual Store DB] Schema error:', err);
  }
}

export async function getVirtualStoreZones(): Promise<VirtualStoreZone[]> {
  await ensureVirtualStoreSchema();

  try {
    const rows = await query<any>('SELECT * FROM virtual_store_zones ORDER BY sort_order ASC');
    if (rows && rows.length > 0) {
      // Map and enrich with real counts from products table where available
      const zones: VirtualStoreZone[] = await Promise.all(
        rows.map(async (r) => {
          let camPos: [number, number, number] = [14, 11, 14];
          let camLook: [number, number, number] = [6, 2, 6];
          let hotspotPos: [number, number, number] = [6, 2.5, 6];
          let featuredProduct: any = {};

          try { camPos = JSON.parse(r.cam_pos_json); } catch {}
          try { camLook = JSON.parse(r.cam_look_json); } catch {}
          try { hotspotPos = JSON.parse(r.hotspot_pos_json); } catch {}
          try { featuredProduct = JSON.parse(r.featured_product_json); } catch {}

          let liveSkuCount = Number(r.sku_count) || 0;
          if (liveSkuCount === 0 && r.category) {
            try {
              const countRes = await query<any>(
                'SELECT COUNT(*) as count FROM products WHERE category LIKE ? OR sub_group LIKE ?',
                [`%${r.category}%`, `%${r.category}%`]
              );
              if (countRes?.[0]?.count) {
                liveSkuCount = Number(countRes[0].count);
              }
            } catch {}
          }

          return {
            id: r.id,
            name: r.name,
            subtitle: r.subtitle || '',
            category: r.category || 'Fasteners',
            aisleCode: r.aisle_code || 'AISLE 1',
            skuCount: liveSkuCount,
            color: r.color || '#0052CC',
            camPos,
            camLook,
            hotspotPos,
            isActive: Boolean(r.is_active),
            sortOrder: Number(r.sort_order) || 1,
            featuredSku: r.featured_sku || '',
            featuredProduct: {
              sku: featuredProduct.sku || r.featured_sku || '',
              name: featuredProduct.name || r.name,
              standard: featuredProduct.standard || '',
              grade: featuredProduct.grade || '',
              price: Number(featuredProduct.price) || 0,
              weightKg: Number(featuredProduct.weightKg) || 0,
              stock: featuredProduct.stock || 'In Stock',
              leadTime: featuredProduct.leadTime || 'Immediate',
              details: featuredProduct.details || '',
              approvals: Array.isArray(featuredProduct.approvals) ? featuredProduct.approvals : [],
              imageUrl: featuredProduct.imageUrl || '/assets/bolt_zinc.jpg',
            },
          };
        })
      );

      return zones;
    }
  } catch (err) {
    console.warn('[Virtual Store DB] Fallback to DEFAULT_ZONES:', err);
  }

  // File fallback
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return DEFAULT_ZONES;
}

export async function updateVirtualStoreZone(zoneId: string, updates: Partial<VirtualStoreZone>): Promise<VirtualStoreZone | null> {
  await ensureVirtualStoreSchema();
  const all = await getVirtualStoreZones();
  const existing = all.find((z) => z.id === zoneId);

  if (!existing) return null;

  const merged: VirtualStoreZone = {
    ...existing,
    ...updates,
    featuredProduct: {
      ...existing.featuredProduct,
      ...(updates.featuredProduct || {}),
    },
  };

  // If a featuredSku is provided, enrich from products table
  if (updates.featuredSku && updates.featuredSku !== existing.featuredSku) {
    try {
      const prodRows = await query<any>('SELECT * FROM products WHERE sku = ? LIMIT 1', [updates.featuredSku]);
      if (prodRows && prodRows.length > 0) {
        const p = prodRows[0];
        merged.featuredProduct = {
          sku: p.sku,
          name: p.name,
          standard: p.standard || p.din || 'DIN 933',
          grade: p.grade || '8.8',
          price: parseFloat(p.price_per_piece) || 10,
          weightKg: parseFloat(p.weight_per_pc_kg) || 0.05,
          stock: `${p.stock_pcs ? Number(p.stock_pcs).toLocaleString() : '10,000'} pcs in stock`,
          leadTime: p.lead_time_days ? `Dispatch in ${p.lead_time_days} days` : 'Same-day dispatch',
          details: p.description || `${p.name} - high-precision industrial fastener.`,
          approvals: [p.standard, p.grade, 'BIS Certified'].filter(Boolean),
          imageUrl: p.image_url || '/assets/bolt_zinc.jpg',
        };
      }
    } catch {}
  }

  try {
    await query(`
      INSERT INTO virtual_store_zones
      (id, name, subtitle, category, aisle_code, sku_count, color, cam_pos_json, cam_look_json, hotspot_pos_json, is_active, sort_order, featured_sku, featured_product_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        subtitle = VALUES(subtitle),
        category = VALUES(category),
        aisle_code = VALUES(aisle_code),
        sku_count = VALUES(sku_count),
        color = VALUES(color),
        cam_pos_json = VALUES(cam_pos_json),
        cam_look_json = VALUES(cam_look_json),
        hotspot_pos_json = VALUES(hotspot_pos_json),
        is_active = VALUES(is_active),
        sort_order = VALUES(sort_order),
        featured_sku = VALUES(featured_sku),
        featured_product_json = VALUES(featured_product_json),
        updated_at = NOW()
    `, [
      merged.id,
      merged.name,
      merged.subtitle,
      merged.category,
      merged.aisleCode || '',
      merged.skuCount || 0,
      merged.color || '#0052CC',
      JSON.stringify(merged.camPos),
      JSON.stringify(merged.camLook),
      JSON.stringify(merged.hotspotPos),
      merged.isActive ? 1 : 0,
      merged.sortOrder,
      merged.featuredSku || '',
      JSON.stringify(merged.featuredProduct),
    ]);
  } catch (err) {
    console.warn('[Virtual Store DB] MySQL update error:', err);
  }

  // Backup to file
  try {
    const updatedList = all.map((z) => (z.id === zoneId ? merged : z));
    const dir = path.dirname(BACKUP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(updatedList, null, 2));
  } catch {}

  return merged;
}
