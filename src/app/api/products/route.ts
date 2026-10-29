import { NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { getProductsDb, setProductsDb, resetProductsToDefault } from '@/lib/products-db';
import { query } from '@/lib/db';
import { resolveProductImageUrl } from '@/lib/product-image-resolver';

async function getProducts(): Promise<Product[]> {
  try {
    const rows = await query<any[]>(`
      SELECT * FROM products ORDER BY id ASC
    `);
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        // Database is active and empty (0 products) - do not insert or fallback to static data
        setProductsDb([]);
        return [];
      }
      const mysqlItems: Product[] = rows.map((r: any) => ({
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
      }));

      // Keep cache in sync with MySQL
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
  const search = searchParams.get('search')?.toLowerCase() || '';
  const standard = searchParams.get('standard');
  const grade = searchParams.get('grade');
  const surplus = searchParams.get('surplus');
  const stockStatus = searchParams.get('stockStatus');
  const sortBy = searchParams.get('sortBy');

  const productsDb = await getProducts();
  let results = [...productsDb];

  // Search filter
  if (search) {
    results = results.filter(
      (p) =>
        p.sku.toLowerCase().includes(search) ||
        p.name.toLowerCase().includes(search) ||
        p.diameter?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search)
    );
  }

  // Standard filter
  if (standard && standard !== 'all') {
    results = results.filter((p) => p.standard.toLowerCase().includes(standard.toLowerCase()));
  }

  // Grade filter
  if (grade && grade !== 'all') {
    results = results.filter((p) => p.grade.toLowerCase().includes(grade.toLowerCase()));
  }

  // Surplus filter
  if (surplus === 'true') {
    results = results.filter((p) => p.isSurplus);
  } else if (surplus === 'false') {
    results = results.filter((p) => !p.isSurplus);
  }

  // Stock status filter
  if (stockStatus === 'in_stock') {
    results = results.filter((p) => p.stockPcs > 5000);
  } else if (stockStatus === 'low_stock') {
    results = results.filter((p) => p.stockPcs > 0 && p.stockPcs <= 5000);
  } else if (stockStatus === 'out_of_stock') {
    results = results.filter((p) => p.stockPcs === 0);
  }

  // Sorting
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

  return NextResponse.json({
    success: true,
    count: results.length,
    total: productsDb.length,
    data: results,
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
      return NextResponse.json({
        success: true,
        message: `Successfully deleted all ${totalDeleted} products from database and active inventory. Catalog is now empty.`,
        count: totalDeleted,
        remainingCount: 0,
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
