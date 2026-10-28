import { NextResponse } from 'next/server';
import { INITIAL_SURPLUS_LOTS } from '@/lib/mock-data';
import { SurplusLot } from '@/lib/types';
import { query } from '@/lib/db';

let surplusDb: SurplusLot[] = [...INITIAL_SURPLUS_LOTS];

async function getSurplusLots(): Promise<SurplusLot[]> {
  try {
    const rows = await query<any>(`SELECT * FROM surplus_lots ORDER BY created_at DESC`);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        sku: r.lot_number,
        name: r.title,
        standard: r.spec_standard,
        grade: r.spec_standard.includes('8.8') ? '8.8 HT' : r.spec_standard.includes('12.9') ? '12.9 Alloy' : r.spec_standard.includes('SS316') || r.spec_standard.includes('SS 316') ? 'SS 316' : 'B7 Alloy',
        excessQtyPcs: Math.round(parseFloat(r.total_weight_tonnes) * 1000 / 0.08),
        excessQtyKg: parseFloat(r.total_weight_tonnes) * 1000,
        regularPriceKg: parseFloat(r.market_price_per_kg),
        clearanceDiscountPct: r.discount_pct,
        clearancePriceKg: parseFloat(r.clearance_price_per_kg),
        locationHub: r.depot_location,
        isActive: r.status === 'AVAILABLE',
      }));
    }
  } catch (err) {
    console.warn('[Surplus API] MySQL query fallback:', err);
  }
  return surplusDb;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const standard = searchParams.get('standard');
  const location = searchParams.get('location');
  const active = searchParams.get('active');
  const sortBy = searchParams.get('sortBy');

  const allLots = await getSurplusLots();
  let results = [...allLots];

  if (search) {
    results = results.filter(
      (lot) =>
        lot.sku.toLowerCase().includes(search) ||
        lot.name.toLowerCase().includes(search) ||
        lot.grade.toLowerCase().includes(search) ||
        lot.locationHub.toLowerCase().includes(search)
    );
  }

  if (standard && standard !== 'all') {
    results = results.filter((lot) => lot.standard.toLowerCase().includes(standard.toLowerCase()));
  }

  if (location && location !== 'all') {
    results = results.filter((lot) => lot.locationHub.toLowerCase().includes(location.toLowerCase()));
  }

  if (active === 'true') {
    results = results.filter((lot) => lot.isActive);
  } else if (active === 'false') {
    results = results.filter((lot) => !lot.isActive);
  }

  if (sortBy === 'discount_desc') {
    results.sort((a, b) => b.clearanceDiscountPct - a.clearanceDiscountPct);
  } else if (sortBy === 'price_asc') {
    results.sort((a, b) => a.clearancePriceKg - b.clearancePriceKg);
  } else if (sortBy === 'qty_desc') {
    results.sort((a, b) => b.excessQtyKg - a.excessQtyKg);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    total: allLots.length,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.sku || !body.name || !body.regularPriceKg) {
      return NextResponse.json(
        { success: false, error: 'SKU, Name, and Regular Price/Kg are required' },
        { status: 400 }
      );
    }

    const regPrice = parseFloat(body.regularPriceKg);
    const discountPct = parseFloat(body.clearanceDiscountPct) || 35;
    const clearancePrice = regPrice * (1 - discountPct / 100);
    const qtyPcs = parseInt(body.excessQtyPcs) || 10000;
    const qtyKg = parseFloat(body.excessQtyKg) || 750.0;

    const newLot: SurplusLot = {
      id: Date.now(),
      sku: body.sku.trim().toUpperCase(),
      name: body.name.trim(),
      standard: body.standard || 'DIN 933',
      grade: body.grade || '8.8 HT',
      excessQtyPcs: qtyPcs,
      excessQtyKg: qtyKg,
      regularPriceKg: regPrice,
      clearanceDiscountPct: discountPct,
      clearancePriceKg: clearancePrice,
      locationHub: body.locationHub || 'Bhiwandi Hub (MH)',
      isActive: true,
    };

    surplusDb.unshift(newLot);

    return NextResponse.json(
      {
        success: true,
        message: `Surplus Lot ${newLot.sku} opened for rapid liquidation (-${discountPct}%).`,
        data: newLot,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Surplus creation failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Surplus lot ID is required' }, { status: 400 });
    }

    const index = surplusDb.findIndex((lot) => lot.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Surplus lot not found' }, { status: 404 });
    }

    const current = surplusDb[index];
    const regPrice = updates.regularPriceKg !== undefined ? parseFloat(updates.regularPriceKg) : current.regularPriceKg;
    const discountPct = updates.clearanceDiscountPct !== undefined ? parseFloat(updates.clearanceDiscountPct) : current.clearanceDiscountPct;
    const clearancePrice = regPrice * (1 - discountPct / 100);

    const updated: SurplusLot = {
      ...current,
      ...updates,
      regularPriceKg: regPrice,
      clearanceDiscountPct: discountPct,
      clearancePriceKg: clearancePrice,
      excessQtyPcs: updates.excessQtyPcs !== undefined ? parseInt(updates.excessQtyPcs) : current.excessQtyPcs,
      excessQtyKg: updates.excessQtyKg !== undefined ? parseFloat(updates.excessQtyKg) : current.excessQtyKg,
    };

    surplusDb[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Surplus Lot ${updated.sku} updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Surplus update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Surplus lot ID is required' }, { status: 400 });
    }

    const index = surplusDb.findIndex((lot) => lot.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Surplus lot not found' }, { status: 404 });
    }

    const deleted = surplusDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `Surplus Lot ${deleted.sku} delisted from liquidation pool.`,
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Surplus delete failed' }, { status: 500 });
  }
}
