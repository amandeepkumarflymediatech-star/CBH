import { NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { getProductsDb } from '@/lib/products-db';
import { query } from '@/lib/db';
import { resolveProductImageUrl } from '@/lib/product-image-resolver';

function mapRowToProduct(r: any): Product {
  return {
    id: Number(r.id),
    sku: r.sku,
    name: r.name,
    category: r.category || 'Hex Screws',
    subGroup: r.sub_group || '',
    subCategory: r.sub_category || '',
    standard: r.standard || 'DIN 933',
    din: r.din || '',
    isoStandard: r.iso_standard || '',
    bsStandard: r.bs_standard || '',
    asmeStandard: r.asme_standard || '',
    grade: r.grade || '8.8',
    finish: r.finish || 'Black Passivated (BP)',
    threadType: r.thread_type || 'Full Thread',
    threadLength: r.thread_length || '',
    diameter: r.diameter || 'M10',
    lengthMm: Number(r.length_mm) || 100,
    pitchMm: parseFloat(r.pitch_mm) || 1.5,
    sizeFormatted: r.size_formatted || `${r.diameter || 'M10'}x${r.length_mm || 100}`,
    weightPerPcKg: parseFloat(r.weight_per_pc_kg) || 0.06,
    weightPer1000PcsKg: parseFloat(r.weight_per_1000_pcs_kg) || +(parseFloat(r.weight_per_pc_kg || 0.06) * 1000).toFixed(3),
    pricePerPiece: parseFloat(r.price_per_piece) || 5.0,
    originalPricePerPiece: parseFloat(r.original_price_per_piece || r.price_per_piece) || 5.0,
    pricePerKg: parseFloat(r.price_per_kg) || 90.0,
    originalPricePerKg: parseFloat(r.original_price_per_kg || r.price_per_kg) || 90.0,
    price100Pcs: parseFloat(r.price_100_pcs) || 0,
    price1000Pcs: parseFloat(r.price_1000_pcs) || 0,
    stockPcs: Number(r.stock_pcs) || 0,
    stockKg: parseFloat(r.stock_kg) || 0,
    stockUom: r.stock_uom || 'Nos',
    isInStock: Boolean(r.is_in_stock),
    isSurplus: Boolean(r.is_surplus),
    surplusDiscountPct: Number(r.surplus_discount_pct) || 0,
    moq: r.moq || '25 KGS',
    leadTimeDays: Number(r.lead_time_days) || 10,
    productionDays: Number(r.production_days) || 7,
    packingDays: Number(r.packing_days) || 3,
    pcsPerBox: r.pcs_per_box ? String(Math.round(Number(r.pcs_per_box)) || 500) : '500',
    smallBoxWeightKg: parseFloat(r.small_box_weight_kg) || 2.5,
    pcsPerMasterCtn: r.pcs_per_master_ctn ? String(Math.round(Number(r.pcs_per_master_ctn)) || 4000) : '4000',
    masterCtnWeightKg: parseFloat(r.master_ctn_weight_kg) || 20.0,
    brand: r.brand || 'CBH',
    hsnCode: r.hsn_code || '73181500',
    imageUrl: resolveProductImageUrl(r.image_url || r.gdrive_image_url, r.category, r.name),
    drawingUrl: r.drawing_url || '',
    gdriveImageUrl: r.gdrive_image_url || '',
    descriptionHtml: r.description_html || '',
    description: r.description || r.name,
  };
}

// In-Memory Cache for Distinct Catalog Filter Options
let filterOptionsCache: {
  categories: string[];
  standards: string[];
  grades: string[];
  finishes: string[];
  diameters: string[];
  lengths?: number[];
  timestamp: number;
} | null = null;

async function getCachedFilterOptions(): Promise<{
  categories: string[];
  standards: string[];
  grades: string[];
  finishes: string[];
  diameters: string[];
  lengths?: number[];
}> {
  const now = Date.now();
  if (filterOptionsCache && now - filterOptionsCache.timestamp < 60000) {
    return filterOptionsCache;
  }

  try {
    const [catRows, stdRows, grdRows, finRows, diaRows, lenRows] = await Promise.all([
      query<any>('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category ASC LIMIT 50'),
      query<any>('SELECT DISTINCT standard FROM products WHERE standard IS NOT NULL AND standard != "" ORDER BY standard ASC LIMIT 100'),
      query<any>('SELECT DISTINCT grade FROM products WHERE grade IS NOT NULL AND grade != "" ORDER BY grade ASC LIMIT 50'),
      query<any>('SELECT DISTINCT finish FROM products WHERE finish IS NOT NULL AND finish != "" ORDER BY finish ASC LIMIT 50'),
      query<any>('SELECT DISTINCT diameter FROM products WHERE diameter IS NOT NULL AND diameter != "" ORDER BY diameter ASC LIMIT 100'),
      query<any>('SELECT DISTINCT length_mm FROM products WHERE length_mm IS NOT NULL AND length_mm > 0 ORDER BY length_mm ASC LIMIT 100'),
    ]);

    const categories = (catRows || []).map((r) => String(r.category)).filter(Boolean).sort();
    const standards = (stdRows || []).map((r) => String(r.standard)).filter(Boolean).sort();
    const grades = (grdRows || []).map((r) => String(r.grade)).filter(Boolean).sort();
    const finishes = (finRows || []).map((r) => String(r.finish)).filter(Boolean).sort();
    
    // Sort diameters numerically (M4, M5, M6, M8, M10, M12...)
    const diameters = (diaRows || []).map((r) => String(r.diameter)).filter(Boolean).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    const lengths = (lenRows || [])
      .map((r) => Number(r.length_mm))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);

    filterOptionsCache = { categories, standards, grades, finishes, diameters, lengths, timestamp: now };
    return filterOptionsCache;
  } catch {
    // Dynamic fallback to in-memory products DB (never hardcode dummy data)
    const db = getProductsDb();
    const categories = Array.from(new Set(db.map((p) => p.category).filter(Boolean))).sort();
    const standards = Array.from(new Set(db.map((p) => p.standard).filter(Boolean))).sort();
    const grades = Array.from(new Set(db.map((p) => p.grade).filter(Boolean))).sort();
    const finishes = Array.from(new Set(db.map((p) => p.finish).filter(Boolean))).sort();
    const diameters = Array.from(new Set(db.map((p) => p.diameter).filter(Boolean))).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    const lengths = Array.from(new Set(db.map((p) => Number(p.lengthMm)).filter((n) => !isNaN(n) && n > 0))).sort((a, b) => a - b);

    return { categories, standards, grades, finishes, diameters, lengths };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Pagination Parameters
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12') || 12));

  // 2. Filter Parameters
  const search = (searchParams.get('search') || searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || 'all').trim();
  const standard = (searchParams.get('standard') || 'all').trim();
  const grade = (searchParams.get('grade') || 'all').trim();
  const diameter = (searchParams.get('diameter') || 'all').trim();
  const length = (searchParams.get('length') || 'all').trim();
  const finish = (searchParams.get('finish') || 'all').trim();
  const inStockOnly = searchParams.get('inStockOnly') === 'true' || searchParams.get('inStockOnly') === '1';
  const sortBy = searchParams.get('sortBy') || 'featured';

  // 3. MySQL Direct Paginated Query
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];

    // Search query tokenization
    let searchTokens: string[] = [];
    if (search) {
      searchTokens = search
        .toLowerCase()
        .replace(/DIN[-\s]?(\d{3,4})/gi, 'DIN $1')
        .replace(/ISO[-\s]?(\d{4,5})/gi, 'ISO $1')
        .replace(/\bM\s*(\d{1,2})\b/gi, 'M$1')
        .replace(/[(),]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 0);

      if (searchTokens.length > 0) {
        const tokenClauses = searchTokens.map(
          () =>
            '(LOWER(sku) LIKE ? OR LOWER(name) LIKE ? OR LOWER(diameter) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ? OR LOWER(grade) LIKE ? OR LOWER(finish) LIKE ? OR LOWER(size_formatted) LIKE ? OR LOWER(hsn_code) LIKE ?)'
        );
        whereClauses.push(`(${tokenClauses.join(' AND ')})`);
        for (const token of searchTokens) {
          const q = `%${token}%`;
          params.push(q, q, q, q, q, q, q, q, q, q, q, q);
        }
      }
    }

    // Category / Tab filter
    if (category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      if (catLower === 'surplus') {
        whereClauses.push('is_surplus = 1');
      } else if (catLower === 'din933') {
        whereClauses.push('(standard LIKE "%DIN 933%" OR name LIKE "%DIN 933%")');
      } else if (catLower === 'din931') {
        whereClauses.push('(standard LIKE "%DIN 931%" OR name LIKE "%DIN 931%")');
      } else if (catLower === 'din912') {
        whereClauses.push('(standard LIKE "%DIN 912%" OR name LIKE "%DIN 912%")');
      } else if (catLower === 'nuts' || catLower.includes('nut')) {
        whereClauses.push('(LOWER(category) LIKE "%nut%" OR LOWER(sub_group) LIKE "%nut%" OR standard LIKE "%DIN 934%" OR LOWER(name) LIKE "%nut%")');
      } else if (catLower === 'washers' || catLower.includes('washer')) {
        whereClauses.push('(LOWER(category) LIKE "%washer%" OR LOWER(sub_group) LIKE "%washer%" OR LOWER(name) LIKE "%washer%")');
      } else if (catLower.includes('socket') || catLower.includes('allen')) {
        whereClauses.push('(LOWER(category) LIKE "%socket%" OR LOWER(sub_category) LIKE "%socket%" OR standard LIKE "%DIN 912%" OR LOWER(name) LIKE "%socket%" OR LOWER(name) LIKE "%allen%")');
      } else if (catLower.includes('hsfg')) {
        whereClauses.push('(LOWER(category) LIKE "%hsfg%" OR standard LIKE "%3757%" OR standard LIKE "%4000%" OR LOWER(name) LIKE "%hsfg%")');
      } else if (catLower.includes('carriage')) {
        whereClauses.push('(LOWER(category) LIKE "%carriage%" OR standard LIKE "%DIN 603%" OR LOWER(name) LIKE "%carriage%")');
      } else if (catLower.includes('flange')) {
        whereClauses.push('(LOWER(category) LIKE "%flange%" OR standard LIKE "%DIN 6921%" OR LOWER(name) LIKE "%flange%")');
      } else if (catLower.includes('threaded rod') || catLower.includes('stud')) {
        whereClauses.push('(LOWER(category) LIKE "%threaded rod%" OR LOWER(category) LIKE "%stud%" OR LOWER(name) LIKE "%threaded rod%" OR LOWER(name) LIKE "%stud%")');
      } else if (catLower.includes('roofing')) {
        whereClauses.push('(LOWER(category) LIKE "%roofing%" OR LOWER(name) LIKE "%roofing%")');
      } else if (catLower.includes('theft') || catLower.includes('security')) {
        whereClauses.push('(LOWER(category) LIKE "%theft%" OR LOWER(category) LIKE "%security%" OR LOWER(name) LIKE "%anti%theft%" OR LOWER(name) LIKE "%security%")');
      } else {
        whereClauses.push('(LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(sub_category) LIKE ? OR LOWER(name) LIKE ?)');
        const q = `%${catLower}%`;
        params.push(q, q, q, q);
      }
    }

    // Dropdown filters
    if (standard && standard !== 'all') {
      whereClauses.push('(LOWER(standard) = ? OR LOWER(din) = ? OR LOWER(iso_standard) = ?)');
      const s = standard.toLowerCase();
      params.push(s, s, s);
    }

    if (grade && grade !== 'all') {
      whereClauses.push('LOWER(grade) LIKE ?');
      params.push(`%${grade.toLowerCase()}%`);
    }

    if (diameter && diameter !== 'all') {
      whereClauses.push('LOWER(diameter) = ?');
      params.push(diameter.toLowerCase());
    }

    if (length && length !== 'all') {
      const lenVal = parseFloat(length);
      if (!isNaN(lenVal)) {
        whereClauses.push('length_mm = ?');
        params.push(lenVal);
      }
    }

    if (finish && finish !== 'all') {
      whereClauses.push('LOWER(finish) = ?');
      params.push(finish.toLowerCase());
    }

    if (inStockOnly) {
      whereClauses.push('is_in_stock = 1 AND stock_pcs > 0');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sort order
    let orderSql = 'is_in_stock DESC, id ASC';
    if (sortBy === 'price_asc') orderSql = 'price_per_piece ASC';
    else if (sortBy === 'price_desc') orderSql = 'price_per_piece DESC';
    else if (sortBy === 'stock_desc') orderSql = 'stock_pcs DESC';

    // Total Count
    const countRes = await query<any>(`SELECT COUNT(*) AS total FROM products ${whereSql}`, params);
    const totalMatching = Number(countRes?.[0]?.total || 0);

    // Paginated Items
    const offset = (page - 1) * limit;
    const paginatedSql = `SELECT * FROM products ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, limit, offset];

    const [rows, filterOptions] = await Promise.all([
      query<any>(paginatedSql, paginatedParams),
      getCachedFilterOptions(),
    ]);

    const products: Product[] = Array.isArray(rows) ? rows.map(mapRowToProduct) : [];
    const totalPages = Math.max(1, Math.ceil(totalMatching / limit));

    // Optional: Fetch related recommendations when search is active
    let relatedProducts: { product: Product; reason: string; tone: 'blue' | 'amber' | 'emerald' | 'purple' }[] = [];
    if (search && searchTokens.length > 0) {
      try {
        // Detect diameter or standard from query
        const diaMatch = search.match(/\b(M\d{1,2}|(?:\d+\/)?\d+["'])\b/i);
        const targetDia = diaMatch ? diaMatch[1].toUpperCase() : null;

        const stdMatch = search.match(/\b(DIN\s*\d{3,4}|ISO\s*\d{4,5})\b/i);
        const targetStd = stdMatch ? stdMatch[1].toUpperCase() : null;

        if (targetDia) {
          // Find complementary nuts & washers or alternative lengths with same diameter
          const relatedRows = await query<any>(
            `SELECT * FROM products 
             WHERE LOWER(diameter) = ? 
             AND id NOT IN (${products.length > 0 ? products.map((p) => p.id).join(',') : '0'})
             ORDER BY (category LIKE '%Nut%' OR category LIKE '%Washer%') DESC, id ASC 
             LIMIT 12`,
            [targetDia.toLowerCase()]
          );

          if (Array.isArray(relatedRows)) {
            relatedProducts = relatedRows.map((r) => {
              const prod = mapRowToProduct(r);
              const isNut = (prod.category || '').toLowerCase().includes('nut') || (prod.name || '').toLowerCase().includes('nut');
              const isWasher = (prod.category || '').toLowerCase().includes('washer') || (prod.name || '').toLowerCase().includes('washer');
              return {
                product: prod,
                reason: isNut
                  ? `🔗 Compatible ${prod.diameter} Hex Nut`
                  : isWasher
                  ? `⚙️ Compatible ${prod.diameter} Plain Washer`
                  : `📏 Same ${prod.diameter} Diameter Fastener`,
                tone: isNut || isWasher ? 'emerald' : 'blue',
              };
            });
          }
        } else if (targetStd) {
          // Find same standard fasteners
          const relatedRows = await query<any>(
            `SELECT * FROM products 
             WHERE (LOWER(standard) LIKE ? OR LOWER(name) LIKE ?)
             AND id NOT IN (${products.length > 0 ? products.map((p) => p.id).join(',') : '0'})
             ORDER BY id ASC 
             LIMIT 8`,
            [`%${targetStd.toLowerCase()}%`, `%${targetStd.toLowerCase()}%`]
          );
          if (Array.isArray(relatedRows)) {
            relatedProducts = relatedRows.map((r) => ({
              product: mapRowToProduct(r),
              reason: `📋 Same ${targetStd} Fastener Specification`,
              tone: 'purple',
            }));
          }
        }
      } catch (relErr) {
        console.warn('[Products Paginated API] Failed fetching related products:', relErr);
      }
    }

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: totalMatching,
      totalPages,
      hasMore: page < totalPages,
      filterOptions,
      data: products,
      relatedProducts,
    });
  } catch (err) {
    console.warn('[Products Paginated API] MySQL failed, fallback to in-memory:', err);
  }

  // 4. In-Memory Fallback
  const allProducts = getProductsDb();
  let results = [...allProducts];

  // Search filtering in memory
  if (search) {
    const searchTokens = search
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (searchTokens.length > 0) {
      results = results.filter((p) => {
        const searchable = `${p.sku} ${p.name} ${p.diameter || ''} ${p.category || ''} ${p.subGroup || ''} ${p.standard || ''} ${p.din || ''} ${p.grade || ''} ${p.finish || ''} ${p.sizeFormatted || ''}`.toLowerCase();
        return searchTokens.every((t) => searchable.includes(t));
      });
    }
  }

  // Category filtering
  if (category && category !== 'all') {
    const catLower = category.toLowerCase().trim();
    if (catLower === 'surplus') {
      results = results.filter((p) => p.isSurplus);
    } else if (catLower === 'din933') {
      results = results.filter((p) => p.standard === 'DIN 933' || p.name.includes('DIN 933'));
    } else if (catLower === 'din931') {
      results = results.filter((p) => p.standard === 'DIN 931' || p.name.includes('DIN 931'));
    } else if (catLower === 'din912') {
      results = results.filter((p) => p.standard === 'DIN 912' || p.name.includes('DIN 912'));
    } else if (catLower === 'nuts' || catLower.includes('nut')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('nut') ||
        (p.subGroup || '').toLowerCase().includes('nut') ||
        p.standard === 'DIN 934' ||
        p.name.toLowerCase().includes('nut')
      );
    } else if (catLower === 'washers' || catLower.includes('washer')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('washer') ||
        (p.subGroup || '').toLowerCase().includes('washer') ||
        p.name.toLowerCase().includes('washer')
      );
    } else if (catLower.includes('socket') || catLower.includes('allen')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('socket') ||
        (p.subCategory || '').toLowerCase().includes('socket') ||
        p.standard === 'DIN 912' ||
        p.name.toLowerCase().includes('socket') ||
        p.name.toLowerCase().includes('allen')
      );
    } else if (catLower.includes('carriage')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('carriage') ||
        p.standard === 'DIN 603' ||
        p.name.toLowerCase().includes('carriage')
      );
    } else if (catLower.includes('flange')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('flange') ||
        p.standard === 'DIN 6921' ||
        p.name.toLowerCase().includes('flange')
      );
    } else if (catLower.includes('hsfg')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('hsfg') ||
        p.name.toLowerCase().includes('hsfg')
      );
    } else {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes(catLower) ||
        (p.subGroup || '').toLowerCase().includes(catLower) ||
        (p.subCategory || '').toLowerCase().includes(catLower) ||
        (p.name || '').toLowerCase().includes(catLower)
      );
    }
  }

  // Dropdown filtering
  if (standard && standard !== 'all') {
    results = results.filter((p) => p.standard.toLowerCase() === standard.toLowerCase());
  }
  if (grade && grade !== 'all') {
    results = results.filter((p) => p.grade.toLowerCase().includes(grade.toLowerCase()));
  }
  if (diameter && diameter !== 'all') {
    results = results.filter((p) => (p.diameter || '').toLowerCase() === diameter.toLowerCase());
  }
  if (length && length !== 'all') {
    results = results.filter((p) => String(p.lengthMm) === String(length));
  }
  if (finish && finish !== 'all') {
    results = results.filter((p) => (p.finish || '').toLowerCase() === finish.toLowerCase());
  }
  if (inStockOnly) {
    results = results.filter((p) => p.isInStock && p.stockPcs > 0);
  }

  // Sorting
  if (sortBy === 'price_asc') results.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
  else if (sortBy === 'price_desc') results.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
  else if (sortBy === 'stock_desc') results.sort((a, b) => b.stockPcs - a.stockPcs);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const pageSlice = results.slice(offset, offset + limit);

  const fallbackFilterOptions = await getCachedFilterOptions();

  return NextResponse.json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    filterOptions: fallbackFilterOptions,
    data: pageSlice,
    relatedProducts: [],
  });
}
