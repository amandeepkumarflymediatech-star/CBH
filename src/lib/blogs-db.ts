import fs from 'fs';
import path from 'path';
import { BlogPost } from './types';
import { INITIAL_BLOG_POSTS } from './mock-data';
import { query } from './db';

const BLOGS_FILE = path.join(process.cwd(), 'src', 'data', 'blogs-data.json');

// Memory cache
let blogsCache: BlogPost[] | null = null;

function loadFromFileOrInitial(): BlogPost[] {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const raw = fs.readFileSync(BLOGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Blogs DB] Error reading blogs cache file:', err);
  }

  // Save initial posts to file
  try {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(INITIAL_BLOG_POSTS, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Blogs DB] Could not write initial blogs to cache file:', err);
  }

  return [...INITIAL_BLOG_POSTS];
}

export function saveToFile(blogs: BlogPost[]) {
  try {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Blogs DB] Failed writing to blogs-data.json:', err);
  }
}

/**
 * Get all blogs (from MySQL if connected, else file/memory)
 */
export async function getAllBlogs(includeDrafts = false): Promise<BlogPost[]> {
  try {
    const rows = await query<any>(
      `SELECT * FROM blogs ${includeDrafts ? '' : "WHERE status = 'PUBLISHED'"} ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const mapped: BlogPost[] = rows.map((r) => ({
        id: r.slug || String(r.id),
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        category: r.category,
        readTime: r.read_time,
        date: r.publish_date,
        author: r.author,
        image: r.image_url,
        featured: Boolean(r.is_featured),
        status: r.status,
        views: r.views || 0,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      blogsCache = mapped;
      saveToFile(mapped);
      return includeDrafts ? mapped : mapped.filter((b) => b.status === 'PUBLISHED');
    }
  } catch (err) {
    // MySQL query failed or table doesn't exist yet, fall back gracefully
  }

  if (!blogsCache) {
    blogsCache = loadFromFileOrInitial();
  }

  if (includeDrafts) {
    return blogsCache;
  }
  return blogsCache.filter((b) => b.status === 'PUBLISHED');
}

/**
 * Get a single blog by its ID or Slug
 */
export async function getBlogByIdOrSlug(idOrSlug: string): Promise<BlogPost | null> {
  const normalized = idOrSlug.trim().toLowerCase();

  try {
    const rows = await query<any>(
      'SELECT * FROM blogs WHERE LOWER(slug) = ? OR id = ? LIMIT 1',
      [normalized, isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug)]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.slug || String(r.id),
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        category: r.category,
        readTime: r.read_time,
        date: r.publish_date,
        author: r.author,
        image: r.image_url,
        featured: Boolean(r.is_featured),
        status: r.status,
        views: r.views || 0,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
  } catch {
    // fallback
  }

  const all = await getAllBlogs(true);
  return all.find((b) => b.id.toLowerCase() === normalized || b.slug.toLowerCase() === normalized) || null;
}

/**
 * Save new blog post
 */
export async function createBlogPost(post: Omit<BlogPost, 'id'> & { id?: string }): Promise<BlogPost> {
  const all = await getAllBlogs(true);
  const slug = post.slug?.trim()
    ? post.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    : post.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newPost: BlogPost = {
    id: slug,
    slug: slug,
    title: post.title.trim(),
    excerpt: post.excerpt.trim(),
    content: post.content.trim(),
    category: post.category || 'Standards & Compliance',
    readTime: post.readTime || '5 min read',
    date: post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    author: post.author || 'Technical Engineering Team',
    image: post.image || '/assets/exhibitions/exhibition_stand_branded.jpg',
    featured: Boolean(post.featured),
    status: post.status || 'PUBLISHED',
    views: post.views || 0,
    tags: post.tags || [post.category || 'Fasteners'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Try saving to MySQL
  try {
    await query(
      `INSERT INTO blogs 
      (slug, title, excerpt, content, category, read_time, publish_date, author, image_url, is_featured, status, views, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      title = VALUES(title), excerpt = VALUES(excerpt), content = VALUES(content), category = VALUES(category),
      read_time = VALUES(read_time), publish_date = VALUES(publish_date), author = VALUES(author),
      image_url = VALUES(image_url), is_featured = VALUES(is_featured), status = VALUES(status), tags = VALUES(tags)`,
      [
        newPost.slug,
        newPost.title,
        newPost.excerpt,
        newPost.content,
        newPost.category,
        newPost.readTime,
        newPost.date,
        newPost.author,
        newPost.image,
        newPost.featured ? 1 : 0,
        newPost.status,
        newPost.views,
        JSON.stringify(newPost.tags || []),
      ]
    );
  } catch (err) {
    console.warn('[Blogs DB] MySQL insert error (falling back to file storage):', err);
  }

  // Update memory and file storage
  const existingIdx = all.findIndex((b) => b.slug === slug || b.id === slug);
  if (existingIdx !== -1) {
    all[existingIdx] = newPost;
  } else {
    all.unshift(newPost);
  }

  blogsCache = all;
  saveToFile(all);
  return newPost;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(post: BlogPost): Promise<BlogPost> {
  const all = await getAllBlogs(true);
  const targetSlug = post.slug || post.id;
  const updatedPost: BlogPost = {
    ...post,
    updatedAt: new Date().toISOString(),
  };

  try {
    await query(
      `UPDATE blogs SET
        title = ?, excerpt = ?, content = ?, category = ?, read_time = ?, publish_date = ?,
        author = ?, image_url = ?, is_featured = ?, status = ?, tags = ?
      WHERE slug = ? OR id = ?`,
      [
        updatedPost.title,
        updatedPost.excerpt,
        updatedPost.content,
        updatedPost.category,
        updatedPost.readTime,
        updatedPost.date,
        updatedPost.author,
        updatedPost.image,
        updatedPost.featured ? 1 : 0,
        updatedPost.status,
        JSON.stringify(updatedPost.tags || []),
        targetSlug,
        isNaN(Number(post.id)) ? -1 : Number(post.id),
      ]
    );
  } catch (err) {
    console.warn('[Blogs DB] MySQL update error:', err);
  }

  const index = all.findIndex((b) => b.slug === targetSlug || b.id === post.id);
  if (index !== -1) {
    all[index] = updatedPost;
  } else {
    all.unshift(updatedPost);
  }

  blogsCache = all;
  saveToFile(all);
  return updatedPost;
}

/**
 * Delete a blog post by id or slug
 */
export async function deleteBlogPost(idOrSlug: string): Promise<boolean> {
  const all = await getAllBlogs(true);
  const normalized = idOrSlug.trim().toLowerCase();

  try {
    await query('DELETE FROM blogs WHERE LOWER(slug) = ? OR id = ?', [
      normalized,
      isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug),
    ]);
  } catch (err) {
    console.warn('[Blogs DB] MySQL delete error:', err);
  }

  const filtered = all.filter((b) => b.id.toLowerCase() !== normalized && b.slug.toLowerCase() !== normalized);
  blogsCache = filtered;
  saveToFile(filtered);
  return true;
}

/**
 * Increment view count for blog
 */
export async function incrementBlogViews(idOrSlug: string): Promise<void> {
  const normalized = idOrSlug.trim().toLowerCase();
  try {
    await query('UPDATE blogs SET views = views + 1 WHERE LOWER(slug) = ? OR id = ?', [
      normalized,
      isNaN(Number(idOrSlug)) ? -1 : Number(idOrSlug),
    ]);
  } catch {
    // ignore
  }

  if (blogsCache) {
    const post = blogsCache.find((b) => b.id.toLowerCase() === normalized || b.slug.toLowerCase() === normalized);
    if (post) {
      post.views = (post.views || 0) + 1;
      saveToFile(blogsCache);
    }
  }
}
