import { NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { getProductsDb, setProductsDb } from '@/lib/products-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const standard = searchParams.get('standard');
  const grade = searchParams.get('grade');
  const surplus = searchParams.get('surplus');
  const stockStatus = searchParams.get('stockStatus');
  const sortBy = searchParams.get('sortBy');

  const productsDb = getProductsDb();
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

    if (!body.sku || !body.name || body.pricePerPiece === undefined || body.pricePerKg === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fastener fields: SKU, Name, PricePerPiece, PricePerKg' },
        { status: 400 }
      );
    }

    const weight = parseFloat(body.weightPerPcKg) || 0.06;
    const stockPcs = parseInt(body.stockPcs) || 10000;

    const newProduct: Product = {
      id: Date.now(),
      sku: body.sku.trim().toUpperCase(),
      name: body.name.trim(),
      category: body.category || 'Hex Screws',
      standard: body.standard || 'DIN 933',
      grade: body.grade || '8.8',
      finish: body.finish || 'Black Passivated (BP)',
      threadType: body.threadType || 'Full Thread',
      diameter: body.diameter || 'M10',
      lengthMm: parseInt(body.lengthMm) || 100,
      pitchMm: parseFloat(body.pitchMm) || 1.5,
      weightPerPcKg: weight,
      pricePerPiece: parseFloat(body.pricePerPiece),
      originalPricePerPiece: body.originalPricePerPiece ? parseFloat(body.originalPricePerPiece) : parseFloat(body.pricePerPiece),
      pricePerKg: parseFloat(body.pricePerKg),
      originalPricePerKg: body.originalPricePerKg ? parseFloat(body.originalPricePerKg) : parseFloat(body.pricePerKg),
      stockPcs: stockPcs,
      stockKg: stockPcs * weight,
      isInStock: stockPcs > 0,
      isSurplus: Boolean(body.isSurplus),
      surplusDiscountPct: body.isSurplus ? (parseInt(body.surplusDiscountPct) || 35) : 0,
      imageUrl: body.imageUrl || '/assets/bolt_zinc.jpg',
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

    const updatedProduct: Product = {
      ...current,
      ...updates,
      weightPerPcKg: weight,
      stockPcs: stockPcs,
      stockKg: stockPcs * weight,
      isInStock: stockPcs > 0,
      pricePerPiece: updates.pricePerPiece !== undefined ? parseFloat(updates.pricePerPiece) : current.pricePerPiece,
      pricePerKg: updates.pricePerKg !== undefined ? parseFloat(updates.pricePerKg) : current.pricePerKg,
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for deletion' }, { status: 400 });
    }

    const productsDb = getProductsDb();
    const index = productsDb.findIndex((p) => p.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product SKU not found' }, { status: 404 });
    }

    const deleted = productsDb.splice(index, 1)[0];
    setProductsDb(productsDb);

    return NextResponse.json({
      success: true,
      message: `Fastener SKU ${deleted.sku} removed from catalog database.`,
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 });
  }
}
