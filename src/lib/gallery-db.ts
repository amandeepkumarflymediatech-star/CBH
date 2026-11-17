import fs from 'fs';
import path from 'path';
import { GalleryItem } from './types';
import { query } from './db';

const GALLERY_FILE = path.join(process.cwd(), 'src', 'data', 'gallery-data.json');

// Memory cache
let galleryCache: GalleryItem[] | null = null;
let isTableInitialized = false;

const CATEGORY_LABEL_MAP: Record<string, string> = {
  manufacturing: 'Forging & Plant',
  quality: 'Testing & Lab',
  logistics: 'Warehouse & Dispatch',
  applications: 'Project Sites',
  exhibitions: 'Exhibitions & Expos',
};

function loadFromFile(): GalleryItem[] {
  try {
    if (fs.existsSync(GALLERY_FILE)) {
      const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          isActive: item.isActive !== false,
          categoryLabel: item.categoryLabel || CATEGORY_LABEL_MAP[item.category] || item.category,
        }));
      }
    }
  } catch (err) {
    console.warn('[Gallery DB] Error reading gallery cache file:', err);
  }
  return [];
}

export function saveToFile(items: GalleryItem[]) {
  try {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Gallery DB] Failed writing to gallery-data.json:', err);
  }
}

/**
 * Ensure MySQL table exists and is seeded with initial data
 */
async function ensureTableAndSeed(): Promise<void> {
  if (isTableInitialized) return;

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        category_label VARCHAR(150),
        image_url VARCHAR(500) NOT NULL,
        location VARCHAR(255) DEFAULT '',
        date_tag VARCHAR(100) DEFAULT '',
        description TEXT DEFAULT NULL,
        specs_json TEXT DEFAULT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check count
    const rows = await query<any>('SELECT COUNT(*) as cnt FROM gallery_items');
    const count = Number(rows?.[0]?.cnt || 0);

    if (count === 0) {
      const fileData = loadFromFile();
      if (fileData.length > 0) {
        for (const item of fileData) {
          await query(
            `INSERT INTO gallery_items 
             (id, title, category, category_label, image_url, location, date_tag, description, specs_json, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title)`,
            [
              item.id,
              item.title,
              item.category,
              item.categoryLabel || CATEGORY_LABEL_MAP[item.category] || item.category,
              item.image,
              item.location || '',
              item.date || '',
              item.description || '',
              JSON.stringify(item.specs || []),
              item.sortOrder || 0,
              item.isActive !== false ? 1 : 0,
            ]
          );
        }
      }
    }

    isTableInitialized = true;
  } catch (err) {
    console.warn('[Gallery DB] MySQL table init/seed check skipped or failed:', err);
  }
}

/**
 * Get all gallery items
 */
export async function getAllGalleryItems(
  category?: string,
  includeInactive = false
): Promise<GalleryItem[]> {
  try {
    await ensureTableAndSeed();

    let sql = 'SELECT * FROM gallery_items';
    const params: any[] = [];
    const conditions: string[] = [];

    if (!includeInactive) {
      conditions.push('is_active = 1');
    }

    if (category && category !== 'all' && category !== 'All') {
      conditions.push('category = ?');
      params.push(category.toLowerCase());
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const rows = await query<any>(sql, params);

    if (rows && rows.length > 0) {
      const mapped: GalleryItem[] = rows.map((r) => {
        let specs: string[] = [];
        try {
          if (r.specs_json) {
            specs = typeof r.specs_json === 'string' ? JSON.parse(r.specs_json) : r.specs_json;
          }
        } catch {
          specs = [];
        }

        return {
          id: r.id,
          title: r.title,
          category: r.category,
          categoryLabel: r.category_label || CATEGORY_LABEL_MAP[r.category] || r.category,
          image: r.image_url,
          location: r.location || '',
          date: r.date_tag || '',
          description: r.description || '',
          specs: specs,
          sortOrder: Number(r.sort_order || 0),
          isActive: Boolean(r.is_active),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      });

      galleryCache = mapped;
      saveToFile(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[Gallery DB] Error loading from MySQL, using file fallback:', err);
  }

  // Fallback to file/memory
  if (!galleryCache) {
    galleryCache = loadFromFile();
  }

  let result = [...galleryCache];
  if (!includeInactive) {
    result = result.filter((i) => i.isActive !== false);
  }
  if (category && category !== 'all' && category !== 'All') {
    result = result.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }

  result.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return result;
}

/**
 * Get single item by ID
 */
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    await ensureTableAndSeed();
    const rows = await query<any>('SELECT * FROM gallery_items WHERE id = ? LIMIT 1', [id]);
    if (rows && rows.length > 0) {
      const r = rows[0];
      let specs: string[] = [];
      try {
        if (r.specs_json) {
          specs = typeof r.specs_json === 'string' ? JSON.parse(r.specs_json) : r.specs_json;
        }
      } catch {
        specs = [];
      }
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        categoryLabel: r.category_label || CATEGORY_LABEL_MAP[r.category] || r.category,
        image: r.image_url,
        location: r.location || '',
        date: r.date_tag || '',
        description: r.description || '',
        specs: specs,
        sortOrder: Number(r.sort_order || 0),
        isActive: Boolean(r.is_active),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
  } catch (err) {
    console.warn('[Gallery DB] Query error for single item:', err);
  }

  const all = loadFromFile();
  return all.find((i) => i.id === id) || null;
}

/**
 * Create a new gallery item
 */
export async function createGalleryItem(
  item: Omit<GalleryItem, 'id'> & { id?: string }
): Promise<GalleryItem> {
  const all = await getAllGalleryItems(undefined, true);
  const id = item.id || `gal-${Date.now()}`;
  const categoryLabel = item.categoryLabel || CATEGORY_LABEL_MAP[item.category] || item.category;

  const newItem: GalleryItem = {
    id,
    title: item.title,
    category: item.category,
    categoryLabel,
    image: item.image,
    location: item.location || '',
    date: item.date || new Date().getFullYear().toString(),
    description: item.description || '',
    specs: item.specs || [],
    sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : all.length + 1,
    isActive: item.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await ensureTableAndSeed();
    await query(
      `INSERT INTO gallery_items 
       (id, title, category, category_label, image_url, location, date_tag, description, specs_json, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title), category = VALUES(category), category_label = VALUES(category_label),
       image_url = VALUES(image_url), location = VALUES(location), date_tag = VALUES(date_tag),
       description = VALUES(description), specs_json = VALUES(specs_json), sort_order = VALUES(sort_order),
       is_active = VALUES(is_active)`,
      [
        newItem.id,
        newItem.title,
        newItem.category,
        newItem.categoryLabel,
        newItem.image,
        newItem.location,
        newItem.date,
        newItem.description,
        JSON.stringify(newItem.specs || []),
        newItem.sortOrder,
        newItem.isActive ? 1 : 0,
      ]
    );
  } catch (err) {
    console.warn('[Gallery DB] MySQL insert error:', err);
  }

  all.unshift(newItem);
  galleryCache = all;
  saveToFile(all);
  return newItem;
}

/**
 * Update an existing gallery item
 */
export async function updateGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  const all = await getAllGalleryItems(undefined, true);
  const categoryLabel = item.categoryLabel || CATEGORY_LABEL_MAP[item.category] || item.category;

  const updatedItem: GalleryItem = {
    ...item,
    categoryLabel,
    updatedAt: new Date().toISOString(),
  };

  try {
    await ensureTableAndSeed();
    await query(
      `UPDATE gallery_items SET
       title = ?, category = ?, category_label = ?, image_url = ?,
       location = ?, date_tag = ?, description = ?, specs_json = ?,
       sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        updatedItem.title,
        updatedItem.category,
        updatedItem.categoryLabel,
        updatedItem.image,
        updatedItem.location || '',
        updatedItem.date || '',
        updatedItem.description || '',
        JSON.stringify(updatedItem.specs || []),
        updatedItem.sortOrder || 0,
        updatedItem.isActive ? 1 : 0,
        updatedItem.id,
      ]
    );
  } catch (err) {
    console.warn('[Gallery DB] MySQL update error:', err);
  }

  const idx = all.findIndex((i) => i.id === item.id);
  if (idx !== -1) {
    all[idx] = updatedItem;
  } else {
    all.push(updatedItem);
  }

  galleryCache = all;
  saveToFile(all);
  return updatedItem;
}

/**
 * Delete a gallery item
 */
export async function deleteGalleryItem(id: string): Promise<boolean> {
  try {
    await ensureTableAndSeed();
    await query('DELETE FROM gallery_items WHERE id = ?', [id]);
  } catch (err) {
    console.warn('[Gallery DB] MySQL delete error:', err);
  }

  const all = await getAllGalleryItems(undefined, true);
  const filtered = all.filter((i) => i.id !== id);
  galleryCache = filtered;
  saveToFile(filtered);
  return true;
}
