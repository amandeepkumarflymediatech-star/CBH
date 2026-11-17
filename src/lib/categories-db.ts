import fs from 'fs';
import path from 'path';
import { CatalogCategory } from './catalog-types';
import { INITIAL_CATEGORIES } from './catalog-data';
import { query } from './db';

const CATEGORIES_FILE = path.join(process.cwd(), 'src', 'data', 'categories-data.json');

// Memory cache
let categoriesCache: CatalogCategory[] | null = null;
let schemaEnsured = false;

async function ensureTableSchema() {
  if (schemaEnsured) return;
  try {
    await query(`
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
    schemaEnsured = true;
  } catch (err) {
    // MySQL not reachable or table creation failed, fall back to file storage
  }
}

function loadFromFileOrInitial(): CatalogCategory[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const raw = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Categories DB] Error reading categories cache file:', err);
  }

  // Write initial data to file
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(INITIAL_CATEGORIES, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Categories DB] Could not write initial categories to file:', err);
  }

  return [...INITIAL_CATEGORIES];
}

export function saveCategoriesToFile(cats: CatalogCategory[]) {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Categories DB] Failed writing to categories-data.json:', err);
  }
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<CatalogCategory[]> {
  await ensureTableSchema();

  try {
    const rows = await query<any>(
      'SELECT * FROM catalog_categories ORDER BY sort_order ASC, name ASC'
    );

    if (rows && rows.length > 0) {
      const mapped: CatalogCategory[] = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        nameHi: r.name_hi || '',
        tagline: r.tagline || '',
        description: r.description || '',
        tag: r.tag || '',
        tagColor: r.tag_color || '#0052CC',
        imageUrl: r.image_url || '/assets/bolt_zinc.jpg',
        bannerUrl: r.banner_url || '',
        link: r.link || `/products?category=${encodeURIComponent(r.name)}`,
        featured: Boolean(r.is_featured),
        sortOrder: Number(r.sort_order) || 0,
      }));

      categoriesCache = mapped;
      saveCategoriesToFile(mapped);
      return mapped;
    }
  } catch (err) {
    // MySQL query failed, fall back to file storage
  }

  if (!categoriesCache) {
    categoriesCache = loadFromFileOrInitial();
  }

  return categoriesCache.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Get category by ID or slug
 */
export async function getCategoryByIdOrSlug(idOrSlug: string): Promise<CatalogCategory | null> {
  const all = await getAllCategories();
  return all.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}

/**
 * Create a new category
 */
export async function createCategory(data: Partial<CatalogCategory>): Promise<CatalogCategory> {
  await ensureTableSchema();
  const all = await getAllCategories();

  const rawSlug = data.slug?.trim() || data.name?.trim() || `category-${Date.now()}`;
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const newCategory: CatalogCategory = {
    id: data.id || `cat-${Date.now()}`,
    slug,
    name: data.name?.trim() || 'New Category',
    nameHi: data.nameHi?.trim() || '',
    tagline: data.tagline?.trim() || '',
    description: data.description?.trim() || '',
    tag: data.tag?.trim() || 'READY STOCK',
    tagColor: data.tagColor?.trim() || '#0052CC',
    imageUrl: data.imageUrl?.trim() || '/assets/bolt_zinc.jpg',
    bannerUrl: data.bannerUrl?.trim() || '',
    link: data.link?.trim() || `/products?category=${encodeURIComponent(data.name || slug)}`,
    featured: data.featured !== undefined ? Boolean(data.featured) : true,
    sortOrder: Number(data.sortOrder) || (all.length + 1),
    subcategoriesCount: 0,
    productsCount: 0,
  };

  // Try saving to MySQL
  try {
    await query(
      `INSERT INTO catalog_categories
      (id, slug, name, name_hi, tagline, description, tag, tag_color, image_url, banner_url, link, is_featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name), name_hi = VALUES(name_hi), tagline = VALUES(tagline),
      description = VALUES(description), tag = VALUES(tag), tag_color = VALUES(tag_color),
      image_url = VALUES(image_url), banner_url = VALUES(banner_url), link = VALUES(link),
      is_featured = VALUES(is_featured), sort_order = VALUES(sort_order)`,
      [
        newCategory.id,
        newCategory.slug,
        newCategory.name,
        newCategory.nameHi,
        newCategory.tagline,
        newCategory.description,
        newCategory.tag,
        newCategory.tagColor,
        newCategory.imageUrl,
        newCategory.bannerUrl,
        newCategory.link,
        newCategory.featured ? 1 : 0,
        newCategory.sortOrder,
      ]
    );
  } catch (err) {
    console.warn('[Categories DB] MySQL insert error (fallback to file):', err);
  }

  all.push(newCategory);
  categoriesCache = all;
  saveCategoriesToFile(all);

  return newCategory;
}

/**
 * Update existing category
 */
export async function updateCategory(idOrSlug: string, updates: Partial<CatalogCategory>): Promise<CatalogCategory | null> {
  await ensureTableSchema();
  const all = await getAllCategories();
  const index = all.findIndex((c) => c.id === idOrSlug || c.slug === idOrSlug);

  if (index === -1) {
    return null;
  }

  const existing = all[index];
  const updatedItem: CatalogCategory = {
    ...existing,
    ...updates,
    id: existing.id,
    slug: updates.slug ? updates.slug.trim() : existing.slug,
    name: updates.name ? updates.name.trim() : existing.name,
    nameHi: updates.nameHi !== undefined ? updates.nameHi.trim() : existing.nameHi,
    tagline: updates.tagline !== undefined ? updates.tagline.trim() : existing.tagline,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    tag: updates.tag !== undefined ? updates.tag.trim() : existing.tag,
    tagColor: updates.tagColor !== undefined ? updates.tagColor.trim() : existing.tagColor,
    imageUrl: updates.imageUrl !== undefined ? updates.imageUrl.trim() : existing.imageUrl,
    bannerUrl: updates.bannerUrl !== undefined ? updates.bannerUrl.trim() : existing.bannerUrl,
    link: updates.link !== undefined ? updates.link.trim() : existing.link,
    featured: updates.featured !== undefined ? Boolean(updates.featured) : existing.featured,
    sortOrder: updates.sortOrder !== undefined ? Number(updates.sortOrder) : existing.sortOrder,
  };

  // Try updating in MySQL
  try {
    await query(
      `UPDATE catalog_categories SET
        name = ?,
        name_hi = ?,
        tagline = ?,
        description = ?,
        tag = ?,
        tag_color = ?,
        image_url = ?,
        banner_url = ?,
        link = ?,
        is_featured = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ? OR slug = ?`,
      [
        updatedItem.name,
        updatedItem.nameHi || '',
        updatedItem.tagline,
        updatedItem.description,
        updatedItem.tag || '',
        updatedItem.tagColor || '',
        updatedItem.imageUrl,
        updatedItem.bannerUrl || '',
        updatedItem.link || '',
        updatedItem.featured ? 1 : 0,
        updatedItem.sortOrder,
        existing.id,
        existing.slug,
      ]
    );
  } catch (err) {
    console.warn('[Categories DB] MySQL update error (fallback to file):', err);
  }

  all[index] = updatedItem;
  categoriesCache = all;
  saveCategoriesToFile(all);

  return updatedItem;
}

/**
 * Delete category
 */
export async function deleteCategory(idOrSlug: string): Promise<boolean> {
  await ensureTableSchema();
  const all = await getAllCategories();
  const filtered = all.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug);

  if (filtered.length === all.length) {
    return false;
  }

  // Try deleting in MySQL
  try {
    await query('DELETE FROM catalog_categories WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
  } catch (err) {
    console.warn('[Categories DB] MySQL delete error:', err);
  }

  categoriesCache = filtered;
  saveCategoriesToFile(filtered);
  return true;
}

/**
 * Reset to defaults
 */
export function resetCategoriesToDefault(): CatalogCategory[] {
  categoriesCache = [...INITIAL_CATEGORIES];
  saveCategoriesToFile(categoriesCache);
  return categoriesCache;
}
