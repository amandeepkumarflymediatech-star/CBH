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

// Helper: Multi-pattern flexible matchers for surface finishes and fastener grades
function getFinishSearchPatterns(finishQuery: string): string[] {
  const f = finishQuery.toLowerCase().trim();
  if (f.includes('hdg') || f.includes('galvaniz') || f.includes('hot dip')) {
    return ['hdg', 'galvaniz', 'hot dip'];
  }
  if (f.includes('wzp') || f.includes('white zinc') || f.includes('zinc plated') || f === 'zp') {
    return ['wzp', 'white zinc', 'zinc plated', 'clear zinc', 'zinc', 'zp'];
  }
  if (f.includes('yzp') || f.includes('yellow')) {
    return ['yzp', 'yellow'];
  }
  if (f.includes('bp') || f.includes('black passivated') || f === 'black') {
    return ['bp', 'black'];
  }
  if (f.includes('self') || f.includes('natural') || f.includes('plain')) {
    return ['self', 'natural', 'plain'];
  }
  if (f.includes('zinc flake') || f.includes('geomet') || f.includes('dacromet')) {
    return ['zinc flake', 'geomet', 'dacromet'];
  }
  return [f];
}

function getGradeSearchPatterns(gradeQuery: string): string[] {
  const g = gradeQuery.toLowerCase().trim();
  if (g.includes('304') || g.includes('a2')) {
    return ['304', 'a2'];
  }
  if (g.includes('316') || g.includes('a4')) {
    return ['316', 'a4'];
  }
  if (g.includes('b7') || g.includes('a193')) {
    return ['b7', 'a193'];
  }
  if (g.includes('2h') || g.includes('a194')) {
    return ['2h', 'a194'];
  }
  if (g.includes('8.8')) {
    return ['8.8'];
  }
  if (g.includes('10.9')) {
    return ['10.9'];
  }
  if (g.includes('12.9')) {
    return ['12.9'];
  }
  if (g.includes('4.6') || g.includes('4.8')) {
    return ['4.6', '4.8'];
  }
  return [g];
}

// In-Memory Cache for Distinct Catalog Filter Options (Faceted by Category)
interface FilterOptionsResult {
  categories: string[];
  standards: string[];
  grades: string[];
  finishes: string[];
  diameters: string[];
  lengths?: number[];
}

const categoryFilterCache = new Map<string, { options: FilterOptionsResult; timestamp: number }>();

async function getCachedFilterOptions(category?: string): Promise<FilterOptionsResult> {
  const cacheKey = category && category !== 'all' ? category.toLowerCase().trim() : '__global__';
  const now = Date.now();
  const cached = categoryFilterCache.get(cacheKey);
  if (cached && now - cached.timestamp < 60000) {
    return cached.options;
  }

  try {
    let catFilter = '';
    const queryParams: any[] = [];
    if (category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      if (catLower.includes('threaded rod') || catLower.includes('stud')) {
        catFilter = 'AND (LOWER(category) LIKE "%threaded rod%" OR LOWER(category) LIKE "%stud%" OR LOWER(name) LIKE "%threaded rod%" OR LOWER(name) LIKE "%stud%")';
      } else if (catLower.includes('hex bolt') || catLower === 'bolts') {
        catFilter = 'AND (LOWER(category) LIKE "%bolt%" OR LOWER(category) LIKE "%screw%" OR LOWER(name) LIKE "%bolt%" OR LOWER(name) LIKE "%screw%")';
      } else if (catLower.includes('washer')) {
        catFilter = 'AND (LOWER(category) LIKE "%washer%" OR LOWER(name) LIKE "%washer%")';
      } else if (catLower.includes('nut')) {
        catFilter = 'AND (LOWER(category) LIKE "%nut%" OR LOWER(name) LIKE "%nut%")';
      } else {
        catFilter = 'AND (LOWER(category) LIKE ? OR LOWER(name) LIKE ?)';
        queryParams.push(`%${catLower}%`, `%${catLower}%`);
      }
    }

    const [catRows, stdRows, grdRows, finRows, diaRows, lenRows] = await Promise.all([
      query<any>('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category ASC LIMIT 50'),
      query<any>(`SELECT DISTINCT standard FROM products WHERE standard IS NOT NULL AND standard != "" ${catFilter} ORDER BY standard ASC LIMIT 100`, queryParams),
      query<any>(`SELECT DISTINCT grade FROM products WHERE grade IS NOT NULL AND grade != "" ${catFilter} ORDER BY grade ASC LIMIT 50`, queryParams),
      query<any>(`SELECT DISTINCT finish FROM products WHERE finish IS NOT NULL AND finish != "" ${catFilter} ORDER BY finish ASC LIMIT 50`, queryParams),
      query<any>(`SELECT DISTINCT diameter FROM products WHERE diameter IS NOT NULL AND diameter != "" ${catFilter} ORDER BY diameter ASC LIMIT 100`, queryParams),
      query<any>(`SELECT DISTINCT length_mm FROM products WHERE length_mm IS NOT NULL AND length_mm > 0 ${catFilter} ORDER BY length_mm ASC LIMIT 100`, queryParams),
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

    const result = { categories, standards, grades, finishes, diameters, lengths };
    categoryFilterCache.set(cacheKey, { options: result, timestamp: now });
    return result;
  } catch {
    // Dynamic fallback to in-memory products DB (never hardcode dummy data)
    const db = getProductsDb();
    let prods = db;
    if (category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      prods = db.filter((p) => (p.category || '').toLowerCase().includes(catLower) || (p.name || '').toLowerCase().includes(catLower));
    }
    const categories = Array.from(new Set(db.map((p) => p.category).filter(Boolean))).sort();
    const standards = Array.from(new Set(prods.map((p) => p.standard).filter(Boolean))).sort();
    const grades = Array.from(new Set(prods.map((p) => p.grade).filter(Boolean))).sort();
    const finishes = Array.from(new Set(prods.map((p) => p.finish).filter(Boolean))).sort();
    const diameters = Array.from(new Set(prods.map((p) => p.diameter).filter(Boolean))).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    const lengths = Array.from(new Set(prods.map((p) => Number(p.lengthMm)).filter((n) => !isNaN(n) && n > 0))).sort((a, b) => a - b);

    const result = { categories, standards, grades, finishes, diameters, lengths };
    categoryFilterCache.set(cacheKey, { options: result, timestamp: now });
    return result;
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
  const surplusParam = searchParams.get('surplus');
  const isSurplusQuery = surplusParam === 'true' || surplusParam === '1';
  const sortBy = searchParams.get('sortBy') || 'featured';

  // 3. MySQL Direct Paginated Query
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (isSurplusQuery) {
      whereClauses.push('is_surplus = 1');
    }

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
      } else if (catLower.includes('hex bolt') || catLower === 'bolts') {
        whereClauses.push('(LOWER(category) LIKE "%bolt%" OR LOWER(category) LIKE "%screw%" OR LOWER(name) LIKE "%bolt%" OR LOWER(name) LIKE "%screw%")');
      } else {
        whereClauses.push('(LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(sub_category) LIKE ? OR LOWER(name) LIKE ?)');
        const q = `%${catLower}%`;
        params.push(q, q, q, q);
      }
    }

    // Dropdown filters
    if (standard && standard !== 'all') {
      const s = standard.toLowerCase().trim();
      whereClauses.push('(LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ? OR LOWER(name) LIKE ?)');
      const q = `%${s}%`;
      params.push(q, q, q, q);
    }

    if (grade && grade !== 'all') {
      const patterns = getGradeSearchPatterns(grade);
      const gradeClauses = patterns.map(() => '(LOWER(grade) LIKE ? OR LOWER(name) LIKE ?)');
      whereClauses.push(`(${gradeClauses.join(' OR ')})`);
      for (const pat of patterns) {
        params.push(`%${pat}%`, `%${pat}%`);
      }
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
      const patterns = getFinishSearchPatterns(finish);
      const finishClauses = patterns.map(() => '(LOWER(finish) LIKE ? OR LOWER(name) LIKE ?)');
      whereClauses.push(`(${finishClauses.join(' OR ')})`);
      for (const pat of patterns) {
        params.push(`%${pat}%`, `%${pat}%`);
      }
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
    let totalMatching = Number(countRes?.[0]?.total || 0);

    let rows: any[] = [];
    let autoRelaxed: {
      type: 'category' | 'subfilter';
      message: string;
      originalCategory?: string;
    } | null = null;

    if (totalMatching > 0) {
      const offset = (page - 1) * limit;
      const paginatedSql = `SELECT * FROM products ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`;
      const paginatedParams = [...params, limit, offset];
      rows = await query<any>(paginatedSql, paginatedParams);
    } else {
      // SELF-HEALING / ZERO DEAD-END AUTO-RECOVERY:
      // Case 1: Search query was provided with a restrictive category, producing 0 results
      if (search && searchTokens.length > 0 && category && category !== 'all') {
        const tokenClauses = searchTokens.map(
          () =>
            '(LOWER(sku) LIKE ? OR LOWER(name) LIKE ? OR LOWER(diameter) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ? OR LOWER(grade) LIKE ? OR LOWER(finish) LIKE ? OR LOWER(size_formatted) LIKE ? OR LOWER(hsn_code) LIKE ?)'
        );
        const searchWhereSql = `WHERE (${tokenClauses.join(' AND ')})`;
        const searchParamsList: any[] = [];
        for (const token of searchTokens) {
          const q = `%${token}%`;
          searchParamsList.push(q, q, q, q, q, q, q, q, q, q, q, q);
        }
        const searchCountRes = await query<any>(`SELECT COUNT(*) AS total FROM products ${searchWhereSql}`, searchParamsList);
        const searchTotal = Number(searchCountRes?.[0]?.total || 0);

        if (searchTotal > 0) {
          totalMatching = searchTotal;
          const offset = (page - 1) * limit;
          const searchPaginatedSql = `SELECT * FROM products ${searchWhereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`;
          rows = await query<any>(searchPaginatedSql, [...searchParamsList, limit, offset]);
          autoRelaxed = {
            type: 'category',
            message: `No exact matches for "${search}" in ${category}. Automatically showing results across All Categories.`,
            originalCategory: category,
          };
        }
      }

      // Case 2: Sub-filter (standard, grade, finish, diameter) was too restrictive in category
      if (totalMatching === 0 && category && category !== 'all') {
        const catLower = category.toLowerCase().trim();
        let catClause = '(LOWER(category) LIKE ? OR LOWER(name) LIKE ?)';
        let catQueryParams = [`%${catLower}%`, `%${catLower}%`];
        if (catLower.includes('threaded rod') || catLower.includes('stud')) {
          catClause = '(LOWER(category) LIKE "%threaded rod%" OR LOWER(category) LIKE "%stud%" OR LOWER(name) LIKE "%threaded rod%" OR LOWER(name) LIKE "%stud%")';
          catQueryParams = [];
        } else if (catLower.includes('hex bolt') || catLower === 'bolts') {
          catClause = '(LOWER(category) LIKE "%bolt%" OR LOWER(category) LIKE "%screw%" OR LOWER(name) LIKE "%bolt%" OR LOWER(name) LIKE "%screw%")';
          catQueryParams = [];
        } else if (catLower.includes('washer')) {
          catClause = '(LOWER(category) LIKE "%washer%" OR LOWER(name) LIKE "%washer%")';
          catQueryParams = [];
        } else if (catLower.includes('nut')) {
          catClause = '(LOWER(category) LIKE "%nut%" OR LOWER(name) LIKE "%nut%")';
          catQueryParams = [];
        }

        const catOnlyWhereSql = `WHERE ${catClause}`;
        const catCountRes = await query<any>(`SELECT COUNT(*) AS total FROM products ${catOnlyWhereSql}`, catQueryParams);
        const catTotal = Number(catCountRes?.[0]?.total || 0);

        if (catTotal > 0) {
          totalMatching = catTotal;
          const offset = (page - 1) * limit;
          const catPaginatedSql = `SELECT * FROM products ${catOnlyWhereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`;
          rows = await query<any>(catPaginatedSql, [...catQueryParams, limit, offset]);
          autoRelaxed = {
            type: 'subfilter',
            message: `No exact catalog match for your specific criteria in ${category}. Automatically displaying all available items in ${category}.`,
          };
        }
      }
    }

    const filterOptions = await getCachedFilterOptions(category);
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
      autoRelaxed,
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
    } else if (catLower.includes('threaded rod') || catLower.includes('stud')) {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('threaded rod') ||
        (p.category || '').toLowerCase().includes('stud') ||
        p.name.toLowerCase().includes('threaded rod') ||
        p.name.toLowerCase().includes('stud')
      );
    } else if (catLower.includes('hex bolt') || catLower === 'bolts') {
      results = results.filter((p) =>
        (p.category || '').toLowerCase().includes('bolt') ||
        (p.category || '').toLowerCase().includes('screw') ||
        p.name.toLowerCase().includes('bolt') ||
        p.name.toLowerCase().includes('screw')
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

  if (isSurplusQuery) {
    results = results.filter((p) => p.isSurplus);
  }

  // Dropdown filtering
  if (standard && standard !== 'all') {
    const s = standard.toLowerCase().trim();
    results = results.filter(
      (p) =>
        (p.standard || '').toLowerCase().includes(s) ||
        (p.din || '').toLowerCase().includes(s) ||
        (p.isoStandard || '').toLowerCase().includes(s) ||
        (p.name || '').toLowerCase().includes(s)
    );
  }
  if (grade && grade !== 'all') {
    const patterns = getGradeSearchPatterns(grade);
    results = results.filter((p) => {
      const pGrd = (p.grade || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      return patterns.some((pat) => pGrd.includes(pat) || pName.includes(pat));
    });
  }
  if (diameter && diameter !== 'all') {
    results = results.filter((p) => (p.diameter || '').toLowerCase() === diameter.toLowerCase());
  }
  if (length && length !== 'all') {
    results = results.filter((p) => String(p.lengthMm) === String(length));
  }
  if (finish && finish !== 'all') {
    const patterns = getFinishSearchPatterns(finish);
    results = results.filter((p) => {
      const pFin = (p.finish || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      return patterns.some((pat) => pFin.includes(pat) || pName.includes(pat));
    });
  }
  if (inStockOnly) {
    results = results.filter((p) => p.isInStock && p.stockPcs > 0);
  }

  let fallbackAutoRelaxed: {
    type: 'category' | 'subfilter';
    message: string;
    originalCategory?: string;
  } | null = null;

  // In-memory Self-Healing Auto-Relaxation
  if (results.length === 0) {
    // 1. Try relaxing category if search query produced 0 in category
    if (search && category && category !== 'all') {
      const searchTokens = search.toLowerCase().split(/\s+/).filter(Boolean);
      const searchMatches = allProducts.filter((p) => {
        const searchable = `${p.sku} ${p.name} ${p.diameter || ''} ${p.category || ''} ${p.subGroup || ''} ${p.standard || ''} ${p.din || ''} ${p.grade || ''} ${p.finish || ''} ${p.sizeFormatted || ''}`.toLowerCase();
        return searchTokens.every((t) => searchable.includes(t));
      });
      if (searchMatches.length > 0) {
        results = searchMatches;
        fallbackAutoRelaxed = {
          type: 'category',
          message: `No exact matches for "${search}" in ${category}. Automatically showing results across All Categories.`,
          originalCategory: category,
        };
      }
    }

    // 2. Try relaxing restrictive sub-filter (standard/grade/finish) in category
    if (results.length === 0 && category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      let catMatches: Product[] = [];
      if (catLower.includes('threaded rod') || catLower.includes('stud')) {
        catMatches = allProducts.filter((p) =>
          (p.category || '').toLowerCase().includes('threaded rod') ||
          (p.category || '').toLowerCase().includes('stud') ||
          p.name.toLowerCase().includes('threaded rod') ||
          p.name.toLowerCase().includes('stud')
        );
      } else if (catLower.includes('hex bolt') || catLower === 'bolts') {
        catMatches = allProducts.filter((p) =>
          (p.category || '').toLowerCase().includes('bolt') ||
          (p.category || '').toLowerCase().includes('screw') ||
          p.name.toLowerCase().includes('bolt') ||
          p.name.toLowerCase().includes('screw')
        );
      } else if (catLower.includes('washer')) {
        catMatches = allProducts.filter((p) =>
          (p.category || '').toLowerCase().includes('washer') ||
          (p.subGroup || '').toLowerCase().includes('washer') ||
          p.name.toLowerCase().includes('washer')
        );
      } else if (catLower.includes('nut')) {
        catMatches = allProducts.filter((p) =>
          (p.category || '').toLowerCase().includes('nut') ||
          (p.subGroup || '').toLowerCase().includes('nut') ||
          p.standard === 'DIN 934' ||
          p.name.toLowerCase().includes('nut')
        );
      } else {
        catMatches = allProducts.filter((p) =>
          (p.category || '').toLowerCase().includes(catLower) || p.name.toLowerCase().includes(catLower)
        );
      }

      if (catMatches.length > 0) {
        results = catMatches;
        fallbackAutoRelaxed = {
          type: 'subfilter',
          message: `No exact catalog match for your specific criteria in ${category}. Automatically showing all available items in ${category}.`,
        };
      }
    }
  }

  // Sorting
  if (sortBy === 'price_asc') results.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
  else if (sortBy === 'price_desc') results.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
  else if (sortBy === 'stock_desc') results.sort((a, b) => b.stockPcs - a.stockPcs);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const pageSlice = results.slice(offset, offset + limit);

  const fallbackFilterOptions = await getCachedFilterOptions(category);

  // In-memory fallback related products when 0 exact matches
  let fallbackRelated: { product: Product; reason: string; tone: 'blue' | 'amber' | 'emerald' | 'purple' }[] = [];
  if (total === 0) {
    if (standard && standard !== 'all') {
      const stdLower = standard.toLowerCase().trim();
      const stdMatches = allProducts.filter(
        (p) =>
          (p.standard || '').toLowerCase().includes(stdLower) ||
          (p.din || '').toLowerCase().includes(stdLower) ||
          (p.name || '').toLowerCase().includes(stdLower)
      ).slice(0, 8);
      if (stdMatches.length > 0) {
        fallbackRelated = stdMatches.map((p) => ({
          product: p,
          reason: `📋 ${standard} Fastener Specification`,
          tone: 'purple' as const
        }));
      }
    }
    if (fallbackRelated.length === 0 && (search || diameter)) {
      const diaMatch = (search || '').match(/\b(M\d{1,2}|(?:\d+\/)?\d+["'])\b/i);
      const targetDia = diaMatch ? diaMatch[1].toUpperCase() : (diameter && diameter !== 'all' ? diameter : null);
      if (targetDia) {
        const diaMatches = allProducts.filter(
          (p) => (p.diameter || '').toUpperCase() === targetDia.toUpperCase()
        ).slice(0, 8);
        if (diaMatches.length > 0) {
          fallbackRelated = diaMatches.map((p) => ({
            product: p,
            reason: `📏 Fasteners with ${targetDia} Diameter`,
            tone: 'blue' as const
          }));
        }
      }
    }
    if (fallbackRelated.length === 0 && category && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      const catMatches = allProducts.filter(
        (p) => (p.category || '').toLowerCase().includes(catLower)
      ).slice(0, 8);
      if (catMatches.length > 0) {
        fallbackRelated = catMatches.map((p) => ({
          product: p,
          reason: `⭐ Popular in ${p.category}`,
          tone: 'emerald' as const
        }));
      }
    }
  }

  const sanitizedPageSlice = pageSlice.map((p) => ({
    ...p,
    imageUrl: resolveProductImageUrl(p.imageUrl || p.gdriveImageUrl, p.category, p.name),
  }));

  return NextResponse.json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    filterOptions: fallbackFilterOptions,
    data: sanitizedPageSlice,
    relatedProducts: fallbackRelated,
    autoRelaxed: fallbackAutoRelaxed,
  });
}
