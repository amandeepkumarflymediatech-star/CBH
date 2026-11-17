import fs from 'fs';
import path from 'path';
import { Testimonial } from './types';
import { query } from './db';
import { INITIAL_TESTIMONIALS } from './testimonials-data';

export { INITIAL_TESTIMONIALS };

const TESTIMONIALS_FILE = path.join(process.cwd(), 'src', 'data', 'testimonials-data.json');

// Memory cache
let testimonialsCache: Testimonial[] | null = null;
let schemaEnsured = false;

async function ensureTableSchema() {
  if (schemaEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        avatar VARCHAR(500),
        rating INT DEFAULT 5,
        feedback TEXT NOT NULL,
        verified_purchase VARCHAR(255),
        badge VARCHAR(100),
        category VARCHAR(100),
        is_featured TINYINT(1) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check count; if empty, seed initial data
    const countRows = await query<any>('SELECT COUNT(*) as cnt FROM testimonials');
    if (countRows && countRows[0] && Number(countRows[0].cnt) === 0) {
      for (const t of INITIAL_TESTIMONIALS) {
        await query(
          `INSERT INTO testimonials 
          (name, role, company, location, avatar, rating, feedback, verified_purchase, badge, category, is_featured, status, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.name,
            t.role || '',
            t.company,
            t.location || '',
            t.avatar || '',
            t.rating || 5,
            t.feedback,
            t.verifiedPurchase || '',
            t.badge || '',
            t.category || '',
            t.featured ? 1 : 0,
            t.status || 'ACTIVE',
            t.displayOrder || 0,
          ]
        );
      }
    }
    schemaEnsured = true;
  } catch (err) {
    // MySQL may not be running or accessible, ignore and fall back to file storage
  }
}

function loadFromFileOrInitial(): Testimonial[] {
  try {
    if (fs.existsSync(TESTIMONIALS_FILE)) {
      const raw = fs.readFileSync(TESTIMONIALS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Testimonials DB] Error reading testimonials cache file:', err);
  }

  // Save initial items to file
  try {
    const dir = path.dirname(TESTIMONIALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(INITIAL_TESTIMONIALS, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Testimonials DB] Could not write initial testimonials to file:', err);
  }

  return [...INITIAL_TESTIMONIALS];
}

export function saveToFile(testimonials: Testimonial[]) {
  try {
    const dir = path.dirname(TESTIMONIALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Testimonials DB] Failed writing to testimonials-data.json:', err);
  }
}

/**
 * Get all testimonials (from MySQL if connected, else file/memory)
 */
export async function getAllTestimonials(includeHidden = false): Promise<Testimonial[]> {
  await ensureTableSchema();

  try {
    const whereClause = includeHidden ? '' : "WHERE status = 'ACTIVE'";
    const rows = await query<any>(
      `SELECT * FROM testimonials ${whereClause} ORDER BY display_order ASC, is_featured DESC, created_at DESC`
    );

    if (rows && rows.length > 0) {
      const mapped: Testimonial[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        role: r.role || '',
        company: r.company || '',
        location: r.location || '',
        avatar: r.avatar || '',
        rating: Number(r.rating) || 5,
        feedback: r.feedback,
        verifiedPurchase: r.verified_purchase || '',
        badge: r.badge || '',
        category: r.category || '',
        featured: Boolean(r.is_featured),
        status: (r.status as 'ACTIVE' | 'HIDDEN') || 'ACTIVE',
        displayOrder: Number(r.display_order) || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      testimonialsCache = mapped;
      saveToFile(mapped);
      return includeHidden ? mapped : mapped.filter((t) => t.status === 'ACTIVE');
    }
  } catch (err) {
    // MySQL query failed or table doesn't exist yet, fall back gracefully
  }

  if (!testimonialsCache) {
    testimonialsCache = loadFromFileOrInitial();
  }

  if (includeHidden) {
    return testimonialsCache;
  }
  return testimonialsCache.filter((t) => t.status === 'ACTIVE');
}

/**
 * Get single testimonial by ID
 */
export async function getTestimonialById(id: string | number): Promise<Testimonial | null> {
  const all = await getAllTestimonials(true);
  return all.find((t) => String(t.id) === String(id)) || null;
}

/**
 * Create a new testimonial
 */
export async function createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
  await ensureTableSchema();
  const all = await getAllTestimonials(true);

  const newId = Date.now();
  const newTestimonial: Testimonial = {
    id: newId,
    name: (data.name || 'Industrial Client').trim(),
    role: (data.role || 'Procurement Executive').trim(),
    company: (data.company || 'Fastener Partner').trim(),
    location: (data.location || '').trim(),
    avatar: (data.avatar || '').trim(),
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    feedback: (data.feedback || '').trim(),
    verifiedPurchase: (data.verifiedPurchase || '').trim(),
    badge: (data.badge || 'Verified Buyer').trim(),
    category: (data.category || 'General').trim(),
    featured: Boolean(data.featured),
    status: data.status === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE',
    displayOrder: Number(data.displayOrder) || (all.length + 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Try saving to MySQL
  try {
    const res = await query<any>(
      `INSERT INTO testimonials 
      (name, role, company, location, avatar, rating, feedback, verified_purchase, badge, category, is_featured, status, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTestimonial.name,
        newTestimonial.role,
        newTestimonial.company,
        newTestimonial.location,
        newTestimonial.avatar,
        newTestimonial.rating,
        newTestimonial.feedback,
        newTestimonial.verifiedPurchase,
        newTestimonial.badge,
        newTestimonial.category,
        newTestimonial.featured ? 1 : 0,
        newTestimonial.status,
        newTestimonial.displayOrder,
      ]
    );

    if (res && (res as any).insertId) {
      newTestimonial.id = (res as any).insertId;
    }
  } catch (err) {
    console.warn('[Testimonials DB] MySQL insert error (fallback to file storage):', err);
  }

  // Update memory and file
  all.unshift(newTestimonial);
  testimonialsCache = all;
  saveToFile(all);

  return newTestimonial;
}

/**
 * Update existing testimonial
 */
export async function updateTestimonial(
  id: string | number,
  updates: Partial<Testimonial>
): Promise<Testimonial | null> {
  await ensureTableSchema();
  const all = await getAllTestimonials(true);
  const index = all.findIndex((t) => String(t.id) === String(id));

  if (index === -1) {
    return null;
  }

  const existing = all[index];
  const updatedItem: Testimonial = {
    ...existing,
    ...updates,
    id: existing.id,
    rating: updates.rating !== undefined ? Math.min(5, Math.max(1, Number(updates.rating))) : existing.rating,
    featured: updates.featured !== undefined ? Boolean(updates.featured) : existing.featured,
    status: updates.status !== undefined ? updates.status : existing.status,
    updatedAt: new Date().toISOString(),
  };

  // Try updating in MySQL
  try {
    await query(
      `UPDATE testimonials SET
        name = ?,
        role = ?,
        company = ?,
        location = ?,
        avatar = ?,
        rating = ?,
        feedback = ?,
        verified_purchase = ?,
        badge = ?,
        category = ?,
        is_featured = ?,
        status = ?,
        display_order = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        updatedItem.name,
        updatedItem.role || '',
        updatedItem.company,
        updatedItem.location || '',
        updatedItem.avatar || '',
        updatedItem.rating,
        updatedItem.feedback,
        updatedItem.verifiedPurchase || '',
        updatedItem.badge || '',
        updatedItem.category || '',
        updatedItem.featured ? 1 : 0,
        updatedItem.status,
        updatedItem.displayOrder || 0,
        id,
      ]
    );
  } catch (err) {
    console.warn('[Testimonials DB] MySQL update error (fallback to file storage):', err);
  }

  all[index] = updatedItem;
  testimonialsCache = all;
  saveToFile(all);

  return updatedItem;
}

/**
 * Delete testimonial by ID
 */
export async function deleteTestimonial(id: string | number): Promise<boolean> {
  await ensureTableSchema();
  const all = await getAllTestimonials(true);
  const filtered = all.filter((t) => String(t.id) !== String(id));

  if (filtered.length === all.length) {
    return false;
  }

  // Try deleting in MySQL
  try {
    await query('DELETE FROM testimonials WHERE id = ?', [id]);
  } catch (err) {
    console.warn('[Testimonials DB] MySQL delete error:', err);
  }

  testimonialsCache = filtered;
  saveToFile(filtered);
  return true;
}
