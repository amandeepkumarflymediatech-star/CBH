import { NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { getProductsDb, setProductsDb, resetProductsToDefault } from '@/lib/products-db';
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
    pcsPerBox: r.pcs_per_box || '',
    smallBoxWeightKg: parseFloat(r.small_box_weight_kg) || 2.5,
    pcsPerMasterCtn: r.pcs_per_master_ctn || '',
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

// Fast In-Memory Cache for Telemetry and Filter Options
let filterOptionsCache: {
  subGroups: string[];
  standards: string[];
  grades: string[];
  timestamp: number;
} | null = null;

let statsCache: {
  data: {
    total: number;
    inStock: number;
    surplusCount: number;
    erpSynced: number;
    screwsCount: number;
    boltsCount: number;
  };
  timestamp: number;
} | null = null;

function invalidateProductsCache() {
  statsCache = null;
  filterOptionsCache = null;
}

async function getCachedFilterOptions() {
  const now = Date.now();
  if (filterOptionsCache && now - filterOptionsCache.timestamp < 60000) {
    return filterOptionsCache;
  }
  try {
    const [sgRows, stdRows, grdRows] = await Promise.all([
      query<any>('SELECT DISTINCT sub_group FROM products WHERE sub_group IS NOT NULL AND sub_group != "" ORDER BY sub_group ASC LIMIT 50'),
      query<any>('SELECT DISTINCT standard FROM products WHERE standard IS NOT NULL AND standard != "" ORDER BY standard ASC LIMIT 100'),
      query<any>('SELECT DISTINCT grade FROM products WHERE grade IS NOT NULL AND grade != "" ORDER BY grade ASC LIMIT 50'),
    ]);
    const subGroups = (sgRows || []).map((r) => r.sub_group).filter(Boolean);
    const standards = (stdRows || []).map((r) => r.standard).filter(Boolean);
    const grades = (grdRows || []).map((r) => r.grade).filter(Boolean);
    filterOptionsCache = { subGroups, standards, grades, timestamp: now };
    return filterOptionsCache;
  } catch {
    return {
      subGroups: ['BOLTS', 'SCREWS', 'NUTS', 'WASHERS', 'STUDS', 'ANCHORS'],
      standards: ['DIN 933', 'DIN 931', 'DIN 6921', 'DIN 912', 'ISO 4014', 'ISO 4017'],
      grades: ['4.6', '8.8', '10.9', '12.9', 'SS 304', 'SS 316', 'B7'],
      timestamp: now,
    };
  }
}

async function getCachedStats() {
  const now = Date.now();
  if (statsCache && now - statsCache.timestamp < 30000) {
    return statsCache.data;
  }
  try {
    const statsRes = await query<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN stock_pcs > 0 THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN is_surplus = 1 THEN 1 ELSE 0 END) as surplus_count,
        SUM(CASE WHEN image_url LIKE '%frappe.cloud%' THEN 1 ELSE 0 END) as erp_synced,
        SUM(CASE WHEN UPPER(sub_group) LIKE '%SCREW%' OR UPPER(name) LIKE '%SCREW%' THEN 1 ELSE 0 END) as screws_count,
        SUM(CASE WHEN UPPER(sub_group) LIKE '%BOLT%' OR UPPER(name) LIKE '%BOLT%' THEN 1 ELSE 0 END) as bolts_count
      FROM products
    `);
    if (statsRes && statsRes[0]) {
      const s = statsRes[0];
      const data = {
        total: Number(s.total || 0),
        inStock: Number(s.in_stock || 0),
        surplusCount: Number(s.surplus_count || 0),
        erpSynced: Number(s.erp_synced || 0),
        screwsCount: Number(s.screws_count || 0),
        boltsCount: Number(s.bolts_count || 0),
      };
      statsCache = { data, timestamp: now };
      return data;
    }
  } catch {}
  return {
    total: 0,
    inStock: 0,
    surplusCount: 0,
    erpSynced: 0,
    screwsCount: 0,
    boltsCount: 0,
  };
}

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<any[]>(`
      SELECT * FROM products ORDER BY id ASC
    `);
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        setProductsDb([]);
        return [];
      }
      const mysqlItems: Product[] = rows.map(mapRowToProduct);
      setProductsDb(mysqlItems);
      return mysqlItems;
    }
  } catch (err) {
    console.warn('[Products API] MySQL fetch fallback to cache:', err);
  }

  return getProductsDb();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const standard = searchParams.get('standard') || '';
  const grade = searchParams.get('grade') || '';
  const subGroup = searchParams.get('subGroup') || '';
  const category = searchParams.get('category') || '';
  const surplus = searchParams.get('surplus');
  const stockStatus = searchParams.get('stockStatus');
  const sortBy = searchParams.get('sortBy');
  const idParam = searchParams.get('id');
  const skuParam = searchParams.get('sku');

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const isAll = limitParam === 'all';
  
  // If explicitly requested paginated OR if limit/page specified, use pagination
  const page = Math.max(1, parseInt(pageParam || '1') || 1);
  const limit = isAll ? 0 : (limitParam ? Math.max(1, Math.min(500, parseInt(limitParam) || 10)) : (pageParam ? 10 : 0));

  // 1. FAST MYSQL DIRECT PAGINATION
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (idParam) {
      whereClauses.push('id = ?');
      params.push(Number(idParam));
    }

    if (skuParam) {
      whereClauses.push('sku = ?');
      params.push(skuParam);
    }

    if (search) {
      whereClauses.push(
        '(LOWER(sku) LIKE ? OR LOWER(name) LIKE ? OR LOWER(diameter) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ? OR LOWER(grade) LIKE ? OR LOWER(finish) LIKE ? OR LOWER(size_formatted) LIKE ? OR LOWER(hsn_code) LIKE ?)'
      );
      const q = `%${search.toLowerCase()}%`;
      params.push(q, q, q, q, q, q, q, q, q, q, q, q);
    }

    if (subGroup && subGroup !== 'all') {
      whereClauses.push('LOWER(sub_group) = ?');
      params.push(subGroup.toLowerCase());
    }

    if (category && category !== 'all') {
      whereClauses.push('LOWER(category) LIKE ?');
      params.push(`%${category.toLowerCase()}%`);
    }

    if (standard && standard !== 'all') {
      whereClauses.push('(LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ?)');
      const s = `%${standard.toLowerCase()}%`;
      params.push(s, s, s);
    }

    if (grade && grade !== 'all') {
      whereClauses.push('LOWER(grade) LIKE ?');
      params.push(`%${grade.toLowerCase()}%`);
    }

    if (surplus === 'true' || surplus === 'surplus') {
      whereClauses.push('is_surplus = 1');
    } else if (surplus === 'false' || surplus === 'standard') {
      whereClauses.push('is_surplus = 0');
    }

    if (stockStatus === 'in_stock') {
      whereClauses.push('stock_pcs > 5000');
    } else if (stockStatus === 'low_stock') {
      whereClauses.push('stock_pcs > 0 AND stock_pcs <= 5000');
    } else if (stockStatus === 'out_of_stock') {
      whereClauses.push('stock_pcs = 0');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderSql = 'id ASC';
    if (sortBy === 'price_asc') orderSql = 'price_per_piece ASC';
    else if (sortBy === 'price_desc') orderSql = 'price_per_piece DESC';
    else if (sortBy === 'stock_desc') orderSql = 'stock_pcs DESC';
    else if (sortBy === 'stock_asc') orderSql = 'stock_pcs ASC';
    else if (sortBy === 'sku_asc') orderSql = 'sku ASC';

    // Total count for current filter
    const countRes = await query<any>(`SELECT COUNT(*) AS total FROM products ${whereSql}`, params);
    const totalMatching = Number(countRes?.[0]?.total || 0);

    let rowsQuery = `SELECT * FROM products ${whereSql} ORDER BY ${orderSql}`;
    const queryParams = [...params];

    if (limit > 0) {
      rowsQuery += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, (page - 1) * limit);
    }

    const [rows, stats, filterOptions] = await Promise.all([
      query<any>(rowsQuery, queryParams),
      getCachedStats(),
      getCachedFilterOptions(),
    ]);

    const products = rows.map(mapRowToProduct);
    const totalPages = limit > 0 ? Math.ceil(totalMatching / limit) : 1;

    return NextResponse.json({
      success: true,
      count: products.length,
      total: totalMatching,
      pagination: {
        page,
        limit: limit > 0 ? limit : totalMatching,
        total: totalMatching,
        totalPages,
        hasMore: limit > 0 ? page < totalPages : false,
      },
      stats,
      filterOptions,
      data: products,
    });
  } catch (err) {
    console.warn('[Products API] MySQL paginated query fallback to memory cache:', err);
  }

  // 2. FALLBACK IN-MEMORY (JSON CACHE)
  const productsDb = await getProducts();
  let results = [...productsDb];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.diameter?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.standard?.toLowerCase().includes(q) ||
        p.grade?.toLowerCase().includes(q)
    );
  }

  if (subGroup && subGroup !== 'all') {
    results = results.filter((p) => (p.subGroup || '').toLowerCase() === subGroup.toLowerCase());
  }

  if (category && category !== 'all') {
    results = results.filter((p) => (p.category || '').toLowerCase().includes(category.toLowerCase()));
  }

  if (standard && standard !== 'all') {
    const s = standard.toLowerCase();
    results = results.filter(
      (p) =>
        p.standard.toLowerCase().includes(s) ||
        (p.din && p.din.toLowerCase().includes(s)) ||
        (p.isoStandard && p.isoStandard.toLowerCase().includes(s))
    );
  }

  if (grade && grade !== 'all') {
    results = results.filter((p) => p.grade.toLowerCase().includes(grade.toLowerCase()));
  }

  if (surplus === 'true') {
    results = results.filter((p) => p.isSurplus);
  } else if (surplus === 'false') {
    results = results.filter((p) => !p.isSurplus);
  }

  if (stockStatus === 'in_stock') {
    results = results.filter((p) => p.stockPcs > 5000);
  } else if (stockStatus === 'low_stock') {
    results = results.filter((p) => p.stockPcs > 0 && p.stockPcs <= 5000);
  } else if (stockStatus === 'out_of_stock') {
    results = results.filter((p) => p.stockPcs === 0);
  }

  if (sortBy === 'price_asc') {
    results.sort((a, b) => a.pricePerPiece - b.pricePerPiece);
  } else if (sortBy === 'price_desc') {
    results.sort((a, b) => b.pricePerPiece - a.pricePerPiece);
  } else if (sortBy === 'stock_desc') {
    results.sort((a, b) => b.stockPcs - a.stockPcs);
  } else if (sortBy === 'stock_asc') {
    results.sort((a, b) => a.stockPcs - b.stockPcs);
  } else if (sortBy === 'sku_asc') {
    results.sort((a, b) => a.sku.localeCompare(b.sku));
  }

  const totalMatching = results.length;
  let pagedResults = results;
  if (limit > 0) {
    pagedResults = results.slice((page - 1) * limit, page * limit);
  }

  const totalPages = limit > 0 ? Math.ceil(totalMatching / limit) : 1;

  return NextResponse.json({
    success: true,
    count: pagedResults.length,
    total: totalMatching,
    pagination: {
      page,
      limit: limit > 0 ? limit : totalMatching,
      total: totalMatching,
      totalPages,
      hasMore: limit > 0 ? page < totalPages : false,
    },
    stats: {
      total: productsDb.length,
      inStock: productsDb.filter((p) => p.stockPcs > 0).length,
      surplusCount: productsDb.filter((p) => p.isSurplus).length,
      erpSynced: productsDb.filter((p) => p.imageUrl && p.imageUrl.includes('frappe.cloud')).length,
      screwsCount: productsDb.filter((p) => (p.subGroup || '').toUpperCase().includes('SCREW')).length,
      boltsCount: productsDb.filter((p) => (p.subGroup || '').toUpperCase().includes('BOLT')).length,
    },
    data: pagedResults,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reset_defaults') {
      const restored = resetProductsToDefault();
      return NextResponse.json({
        success: true,
        message: `Catalog reset to factory default (${restored.length} products).`,
        count: restored.length,
        data: restored,
      });
    }

    if (!body.sku || !body.name || body.pricePerPiece === undefined || body.pricePerKg === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fastener fields: SKU, Name, PricePerPiece, PricePerKg' },
        { status: 400 }
      );
    }

    const weight = parseFloat(body.weightPerPcKg) || 0.06;
    const stockPcs = parseInt(body.stockPcs) || 10000;
    const prodDays = parseInt(body.productionDays) || 7;
    const packDays = parseInt(body.packingDays) || 3;
    const leadTime = body.leadTimeDays ? parseInt(body.leadTimeDays) : prodDays + packDays;

    const newProduct: Product = {
      id: Date.now(),
      sku: body.sku.trim().toUpperCase(),
      name: body.name.trim(),
      category: body.category || 'Hex Screws',
      subGroup: body.subGroup || '',
      subCategory: body.subCategory || '',
      standard: body.standard || 'DIN 933',
      din: body.din || '',
      isoStandard: body.isoStandard || '',
      bsStandard: body.bsStandard || '',
      asmeStandard: body.asmeStandard || '',
      grade: body.grade || '8.8',
      finish: body.finish || 'Black Passivated (BP)',
      threadType: body.threadType || 'Full Thread',
      threadLength: body.threadLength || '',
      diameter: body.diameter || 'M10',
      lengthMm: parseInt(body.lengthMm) || 100,
      pitchMm: parseFloat(body.pitchMm) || 1.5,
      sizeFormatted: body.sizeFormatted || `${body.diameter || 'M10'}x${body.lengthMm || 100}`,
      weightPerPcKg: weight,
      weightPer1000PcsKg: body.weightPer1000PcsKg ? parseFloat(body.weightPer1000PcsKg) : +(weight * 1000).toFixed(3),
      pricePerPiece: parseFloat(body.pricePerPiece),
      originalPricePerPiece: body.originalPricePerPiece ? parseFloat(body.originalPricePerPiece) : parseFloat(body.pricePerPiece),
      pricePerKg: parseFloat(body.pricePerKg),
      originalPricePerKg: body.originalPricePerKg ? parseFloat(body.originalPricePerKg) : parseFloat(body.pricePerKg),
      price100Pcs: body.price100Pcs ? parseFloat(body.price100Pcs) : +(parseFloat(body.pricePerPiece) * 100).toFixed(2),
      price1000Pcs: body.price1000Pcs ? parseFloat(body.price1000Pcs) : +(parseFloat(body.pricePerPiece) * 1000).toFixed(2),
      stockPcs: stockPcs,
      stockKg: parseFloat((stockPcs * weight).toFixed(2)),
      stockUom: body.stockUom || 'Nos',
      isInStock: stockPcs > 0,
      isSurplus: Boolean(body.isSurplus),
      surplusDiscountPct: body.isSurplus ? (parseInt(body.surplusDiscountPct) || 35) : 0,
      moq: body.moq || '25 KGS',
      leadTimeDays: leadTime,
      productionDays: prodDays,
      packingDays: packDays,
      pcsPerBox: body.pcsPerBox || '',
      smallBoxWeightKg: body.smallBoxWeightKg ? parseFloat(body.smallBoxWeightKg) : 2.5,
      pcsPerMasterCtn: body.pcsPerMasterCtn || '',
      masterCtnWeightKg: body.masterCtnWeightKg ? parseFloat(body.masterCtnWeightKg) : 20,
      brand: body.brand || 'CBH',
      hsnCode: body.hsnCode || '73181500',
      imageUrl: body.imageUrl || '/assets/bolt_zinc.jpg',
      drawingUrl: body.drawingUrl || '',
      gdriveImageUrl: body.gdriveImageUrl || '',
      descriptionHtml: body.descriptionHtml || '',
      description: body.description || body.name.trim(),
    };

    const productsDb = getProductsDb();
    productsDb.unshift(newProduct);
    setProductsDb(productsDb);

    invalidateProductsCache();
    return NextResponse.json(
      {
        success: true,
        message: `Fastener SKU ${newProduct.sku} created successfully.`,
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const productsDb = getProductsDb();
    const index = productsDb.findIndex((p) => p.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product SKU not found' }, { status: 404 });
    }

    const current = productsDb[index];
    const weight = updates.weightPerPcKg !== undefined ? parseFloat(updates.weightPerPcKg) : current.weightPerPcKg;
    const stockPcs = updates.stockPcs !== undefined ? parseInt(updates.stockPcs) : current.stockPcs;
    const pricePerPiece = updates.pricePerPiece !== undefined ? parseFloat(updates.pricePerPiece) : current.pricePerPiece;
    const pricePerKg = updates.pricePerKg !== undefined ? parseFloat(updates.pricePerKg) : current.pricePerKg;

    const updatedProduct: Product = {
      ...current,
      ...updates,
      weightPerPcKg: weight,
      weightPer1000PcsKg: updates.weightPer1000PcsKg !== undefined ? parseFloat(updates.weightPer1000PcsKg) : +(weight * 1000).toFixed(3),
      stockPcs: stockPcs,
      stockKg: parseFloat((stockPcs * weight).toFixed(2)),
      isInStock: stockPcs > 0,
      pricePerPiece: pricePerPiece,
      pricePerKg: pricePerKg,
      price100Pcs: updates.price100Pcs !== undefined ? parseFloat(updates.price100Pcs) : +(pricePerPiece * 100).toFixed(2),
      price1000Pcs: updates.price1000Pcs !== undefined ? parseFloat(updates.price1000Pcs) : +(pricePerPiece * 1000).toFixed(2),
    };

    productsDb[index] = updatedProduct;
    setProductsDb(productsDb);

    invalidateProductsCache();
    return NextResponse.json({
      success: true,
      message: `Fastener SKU ${updatedProduct.sku} updated successfully.`,
      data: updatedProduct,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const singleSku = searchParams.get('sku');
    const idsParam = searchParams.get('ids');
    const skusParam = searchParams.get('skus');
    const allParam = searchParams.get('all');

    let deleteAll = allParam === 'true' || idsParam === 'all' || singleId === 'all';
    let deleteMatching = false;
    let filterParams: any = {};
    const idsToDelete: number[] = [];
    const skusToDelete: string[] = [];

    // Parse query params
    if (!deleteAll) {
      if (singleId && singleId !== 'all') {
        const num = Number(singleId);
        if (!isNaN(num) && num > 0) idsToDelete.push(num);
        else skusToDelete.push(singleId.trim().toUpperCase());
      }
      if (singleSku) {
        skusToDelete.push(singleSku.trim().toUpperCase());
      }
      if (idsParam && idsParam !== 'all') {
        idsParam.split(',').forEach((s) => {
          const trimmed = s.trim();
          const num = Number(trimmed);
          if (!isNaN(num) && num > 0) idsToDelete.push(num);
          else if (trimmed) skusToDelete.push(trimmed.toUpperCase());
        });
      }
      if (skusParam) {
        skusParam.split(',').forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) skusToDelete.push(trimmed.toUpperCase());
        });
      }

      // Check request JSON body if available
      try {
        const body = await request.json();
        if (body.all === true || body.ids === 'all' || body.id === 'all') {
          deleteAll = true;
        } else if (body.allMatching === true) {
          deleteMatching = true;
          filterParams = {
            search: body.search || searchParams.get('search') || '',
            subGroup: body.subGroup || searchParams.get('subGroup') || '',
            category: body.category || searchParams.get('category') || '',
            standard: body.standard || searchParams.get('standard') || '',
            grade: body.grade || searchParams.get('grade') || '',
            surplus: body.surplus || searchParams.get('surplus') || '',
            stockStatus: body.stockStatus || searchParams.get('stockStatus') || '',
          };
          const hasAnyFilter = Object.values(filterParams).some((v) => v && v !== 'all');
          if (!hasAnyFilter) {
            deleteAll = true;
            deleteMatching = false;
          }
        } else {
          if (body.id !== undefined && body.id !== 'all') {
            const num = Number(body.id);
            if (!isNaN(num) && num > 0) idsToDelete.push(num);
            else skusToDelete.push(String(body.id).trim().toUpperCase());
          }
          if (body.sku) {
            skusToDelete.push(String(body.sku).trim().toUpperCase());
          }
          if (Array.isArray(body.ids)) {
            body.ids.forEach((i: any) => {
              const num = Number(i);
              if (!isNaN(num) && num > 0) idsToDelete.push(num);
              else if (i) skusToDelete.push(String(i).trim().toUpperCase());
            });
          }
          if (Array.isArray(body.skus)) {
            body.skus.forEach((s: any) => {
              if (s) skusToDelete.push(String(s).trim().toUpperCase());
            });
          }
        }
      } catch {
        // Body was empty or non-JSON
      }
    }

    const productsDb = getProductsDb();

    // ACTION A: DIRECT WIPE OF ALL PRODUCTS
    if (deleteAll) {
      let mysqlDeleted = 0;
      try {
        await query('UPDATE order_items SET product_id = NULL');
        await query('UPDATE rfq_items SET product_id = NULL');
        const res: any = await query('DELETE FROM products');
        mysqlDeleted = res?.affectedRows || 0;
      } catch (dbErr) {
        console.warn('MySQL products wipe error:', dbErr);
      }

      const prevCount = productsDb.length;
      setProductsDb([]);

      const totalDeleted = Math.max(mysqlDeleted, prevCount);
      invalidateProductsCache();
      return NextResponse.json({
        success: true,
        message: `Successfully deleted all ${totalDeleted} products from database and active inventory. Catalog is now empty.`,
        count: totalDeleted,
        remainingCount: 0,
      });
    }

    // ACTION B: DELETE ALL PRODUCTS MATCHING CURRENT FILTERS
    if (deleteMatching) {
      const whereClauses: string[] = [];
      const params: any[] = [];

      if (filterParams.search) {
        whereClauses.push(
          '(LOWER(sku) LIKE ? OR LOWER(name) LIKE ? OR LOWER(diameter) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sub_group) LIKE ? OR LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ? OR LOWER(grade) LIKE ? OR LOWER(finish) LIKE ? OR LOWER(size_formatted) LIKE ? OR LOWER(hsn_code) LIKE ?)'
        );
        const q = `%${filterParams.search.toLowerCase()}%`;
        params.push(q, q, q, q, q, q, q, q, q, q, q, q);
      }
      if (filterParams.subGroup && filterParams.subGroup !== 'all') {
        whereClauses.push('LOWER(sub_group) = ?');
        params.push(filterParams.subGroup.toLowerCase());
      }
      if (filterParams.category && filterParams.category !== 'all') {
        whereClauses.push('LOWER(category) LIKE ?');
        params.push(`%${filterParams.category.toLowerCase()}%`);
      }
      if (filterParams.standard && filterParams.standard !== 'all') {
        whereClauses.push('(LOWER(standard) LIKE ? OR LOWER(din) LIKE ? OR LOWER(iso_standard) LIKE ?)');
        const s = `%${filterParams.standard.toLowerCase()}%`;
        params.push(s, s, s);
      }
      if (filterParams.grade && filterParams.grade !== 'all') {
        whereClauses.push('LOWER(grade) LIKE ?');
        params.push(`%${filterParams.grade.toLowerCase()}%`);
      }
      if (filterParams.surplus === 'true' || filterParams.surplus === 'surplus') {
        whereClauses.push('is_surplus = 1');
      } else if (filterParams.surplus === 'false' || filterParams.surplus === 'standard') {
        whereClauses.push('is_surplus = 0');
      }
      if (filterParams.stockStatus === 'in_stock') {
        whereClauses.push('stock_pcs > 5000');
      } else if (filterParams.stockStatus === 'low_stock') {
        whereClauses.push('stock_pcs > 0 AND stock_pcs <= 5000');
      } else if (filterParams.stockStatus === 'out_of_stock') {
        whereClauses.push('stock_pcs = 0');
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      let mysqlDeleted = 0;
      try {
        await query(`UPDATE order_items SET product_id = NULL WHERE product_id IN (SELECT id FROM products ${whereSql})`, params);
        await query(`UPDATE rfq_items SET product_id = NULL WHERE product_id IN (SELECT id FROM products ${whereSql})`, params);
        const res: any = await query(`DELETE FROM products ${whereSql}`, params);
        mysqlDeleted = res?.affectedRows || 0;
      } catch (dbErr) {
        console.warn('MySQL delete matching error:', dbErr);
      }

      invalidateProductsCache();
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${mysqlDeleted} matching products from database.`,
        count: mysqlDeleted,
      });
    }

    if (idsToDelete.length === 0 && skusToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product ID or SKU (or all=true) is required for deletion' },
        { status: 400 }
      );
    }

    // Correlate IDs and SKUs using in-memory store
    productsDb.forEach((p) => {
      if (idsToDelete.includes(Number(p.id)) && p.sku) {
        skusToDelete.push(p.sku.toUpperCase());
      }
      if (p.sku && skusToDelete.includes(p.sku.toUpperCase()) && Number(p.id)) {
        idsToDelete.push(Number(p.id));
      }
    });

    const uniqueIds = Array.from(new Set(idsToDelete));
    const uniqueSkus = Array.from(new Set(skusToDelete.map((s) => s.toUpperCase())));

    // 1. Delete from MySQL database
    let mysqlDeleted = 0;
    try {
      if (uniqueIds.length > 0) {
        try {
          await query('UPDATE order_items SET product_id = NULL WHERE product_id IN (?)', [uniqueIds]);
          await query('UPDATE rfq_items SET product_id = NULL WHERE product_id IN (?)', [uniqueIds]);
        } catch {}
        const res: any = await query('DELETE FROM products WHERE id IN (?)', [uniqueIds]);
        mysqlDeleted += res?.affectedRows || 0;
      }
      if (uniqueSkus.length > 0) {
        const res: any = await query('DELETE FROM products WHERE UPPER(sku) IN (?)', [uniqueSkus]);
        mysqlDeleted += res?.affectedRows || 0;
      }
    } catch (dbErr) {
      console.warn('MySQL deletion error:', dbErr);
    }

    // 2. Remove from local cache and memory
    const idSet = new Set(uniqueIds);
    const skuSet = new Set(uniqueSkus);
    const remainingProducts = productsDb.filter(
      (p) => !idSet.has(Number(p.id)) && !skuSet.has(p.sku.toUpperCase())
    );
    const cacheDeleted = productsDb.length - remainingProducts.length;
    setProductsDb(remainingProducts);

    const totalDeleted = Math.max(mysqlDeleted, cacheDeleted, uniqueIds.length, uniqueSkus.length);

    invalidateProductsCache();
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} product${totalDeleted > 1 ? 's' : ''} from database.`,
      count: totalDeleted,
      mysqlDeleted,
      remainingCount: remainingProducts.length,
    });
  } catch (error: any) {
    console.error('Delete handler fatal error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 });
  }
}
