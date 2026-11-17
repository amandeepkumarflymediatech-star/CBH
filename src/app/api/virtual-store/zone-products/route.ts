import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getWatermarkedProductImageUrl } from '@/lib/product-image-resolver';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || '').trim();
    const search = (searchParams.get('search') || '').trim();
    const standard = (searchParams.get('standard') || '').trim();
    const diameter = (searchParams.get('diameter') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
    const offset = (page - 1) * limit;

    let whereSql = ' WHERE 1=1';
    const params: any[] = [];

    if (category && category.toLowerCase() === 'surplus') {
      whereSql += ' AND is_surplus = 1';
    } else if (category && category !== 'ALL') {
      whereSql += ' AND (category LIKE ? OR sub_group LIKE ? OR sub_category LIKE ?)';
      const catParam = `%${category}%`;
      params.push(catParam, catParam, catParam);
    }

    if (standard && standard !== 'ALL') {
      whereSql += ' AND (standard = ? OR din = ? OR iso_standard = ?)';
      params.push(standard, standard, standard);
    }

    if (diameter && diameter !== 'ALL') {
      whereSql += ' AND diameter = ?';
      params.push(diameter);
    }

    if (search) {
      whereSql += ' AND (sku LIKE ? OR name LIKE ? OR diameter LIKE ? OR standard LIKE ? OR grade LIKE ?)';
      const sParam = `%${search}%`;
      params.push(sParam, sParam, sParam, sParam, sParam);
    }

    // 1. Total Count Query
    const countSql = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    const countResult = await query<any>(countSql, params);
    const total = countResult?.[0]?.total ? Number(countResult[0].total) : 0;

    // 2. Fetch distinct standards for filter pills
    let standardsList: string[] = [];
    try {
      const stdSql = `SELECT DISTINCT standard FROM products ${whereSql} AND standard != '' ORDER BY standard ASC LIMIT 10`;
      const stdRows = await query<any>(stdSql, params);
      standardsList = (stdRows || []).map((r: any) => r.standard).filter(Boolean);
    } catch {
      standardsList = [];
    }

    // 3. Fetch distinct diameters for filter pills
    let diametersList: string[] = [];
    try {
      const diaSql = `SELECT DISTINCT diameter FROM products ${whereSql} AND diameter != '' ORDER BY diameter ASC LIMIT 15`;
      const diaRows = await query<any>(diaSql, params);
      diametersList = (diaRows || []).map((r: any) => r.diameter).filter(Boolean);
    } catch {
      diametersList = [];
    }

    // 4. Products query with pagination
    const productSql = `SELECT * FROM products ${whereSql} ORDER BY stock_pcs DESC, id ASC LIMIT ? OFFSET ?`;
    const productParams = [...params, limit, offset];
    const rows = await query<any>(productSql, productParams);

    const mapped = (rows || []).map((p: any) => ({
      id: Number(p.id),
      sku: p.sku,
      name: p.name,
      category: p.category || '',
      subCategory: p.sub_category || '',
      standard: p.standard || p.din || 'DIN 933',
      grade: p.grade || '8.8',
      finish: p.finish || 'Zinc Plated',
      diameter: p.diameter || 'M10',
      lengthMm: Number(p.length_mm) || 50,
      pricePerPiece: parseFloat(p.price_per_piece) || 5.0,
      pricePerKg: parseFloat(p.price_per_kg) || 90.0,
      weightPerPcKg: parseFloat(p.weight_per_pc_kg) || 0.05,
      stockPcs: Number(p.stock_pcs) || 0,
      isInStock: Boolean(p.is_in_stock),
      isSurplus: Boolean(p.is_surplus),
      imageUrl: getWatermarkedProductImageUrl(p.image_url, p.category, p.id),
    }));

    return NextResponse.json({
      success: true,
      category,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      availableStandards: standardsList,
      availableDiameters: diametersList,
      data: mapped,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch zone products' },
      { status: 500 }
    );
  }
}
