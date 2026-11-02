import { NextResponse } from 'next/server';
import { SurplusLot } from '@/lib/types';
import { query } from '@/lib/db';

const DEFAULT_SURPLUS_SEEDS = [
  {
    lot_number: 'SURP-DIN933-M12-100-8.8',
    title: 'Hex Head Screws DIN 933 M12x100mm Grade 8.8 Black Phosphate',
    description: 'Certified EPC surplus lot from Solar Plant construction. 100% mill inspected with 3.1 NABL certs.',
    spec_standard: 'DIN 933 / IS 1364 Grade 8.8 M12x100mm',
    total_weight_tonnes: 1.09,
    market_price_per_kg: 165.00,
    clearance_price_per_kg: 99.00,
    discount_pct: 40,
    depot_location: 'Bhiwandi Logistics Hub, Maharashtra',
    status: 'AVAILABLE',
    image_url: '/assets/bolt_zinc.jpg',
  },
  {
    lot_number: 'SURP-DIN912-M16-80-12.9',
    title: 'Socket Head Cap Screws DIN 912 M16x80mm Grade 12.9 High Tensile',
    description: 'Heavy machinery manufacturing excess inventory. Unopened factory barrels with rust-preventive oil coating.',
    spec_standard: 'DIN 912 / ISO 4762 Grade 12.9 M16x80mm',
    total_weight_tonnes: 1.15,
    market_price_per_kg: 210.00,
    clearance_price_per_kg: 115.50,
    discount_pct: 45,
    depot_location: 'Ludhiana Central Depot, Punjab',
    status: 'AVAILABLE',
    image_url: '/assets/bolt_zinc.jpg',
  },
  {
    lot_number: 'SURP-SS316-M10-60-A4',
    title: 'Marine Grade Stainless Hex Bolts SS 316 (A4-70) M10x60mm',
    description: 'High corrosion resistance austenitic stainless fasteners for coastal dockyards and chemical plants.',
    spec_standard: 'ISO 4017 / DIN 933 SS316 (A4-70)',
    total_weight_tonnes: 0.62,
    market_price_per_kg: 420.00,
    clearance_price_per_kg: 252.00,
    discount_pct: 40,
    depot_location: 'Hazira Port Warehouse, Gujarat',
    status: 'AVAILABLE',
    image_url: '/assets/bolt_zinc.jpg',
  },
  {
    lot_number: 'SURP-ASTM-B7-M24-3000',
    title: 'ASTM A193 Grade B7 Heavy Continuous Studs M24x3000mm',
    description: 'Refinery expansion surplus studs. Heat treated chrome-moly steel for high temperature flanged joints.',
    spec_standard: 'ASTM A193 B7 / IS 1862 M24x3000mm',
    total_weight_tonnes: 3.50,
    market_price_per_kg: 195.00,
    clearance_price_per_kg: 117.00,
    discount_pct: 40,
    depot_location: 'Jamnagar Refinery Ancillary Yard, Gujarat',
    status: 'AVAILABLE',
    image_url: '/assets/bolt_zinc.jpg',
  },
];

async function ensureSurplusTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS surplus_lots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lot_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        spec_standard VARCHAR(100) NOT NULL,
        total_weight_tonnes DECIMAL(8, 2) NOT NULL,
        market_price_per_kg DECIMAL(10, 2) NOT NULL,
        clearance_price_per_kg DECIMAL(10, 2) NOT NULL,
        discount_pct INTEGER NOT NULL,
        depot_location VARCHAR(150) NOT NULL,
        status VARCHAR(30) DEFAULT 'AVAILABLE',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('[Surplus API] ensureSurplusTable notice:', err);
  }
}

async function getSurplusLots(): Promise<SurplusLot[]> {
  try {
    await ensureSurplusTable();
    let rows = await query<any>(`SELECT * FROM surplus_lots ORDER BY created_at DESC`);

    // Auto-seed if database table is empty so the surplus page is never blank
    if (!Array.isArray(rows) || rows.length === 0) {
      for (const s of DEFAULT_SURPLUS_SEEDS) {
        try {
          await query(
            `INSERT IGNORE INTO surplus_lots (
              lot_number, title, description, spec_standard, total_weight_tonnes,
              market_price_per_kg, clearance_price_per_kg, discount_pct, depot_location, status, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.lot_number, s.title, s.description, s.spec_standard, s.total_weight_tonnes,
              s.market_price_per_kg, s.clearance_price_per_kg, s.discount_pct, s.depot_location,
              s.status, s.image_url,
            ]
          );
        } catch {}
      }
      rows = await query<any>(`SELECT * FROM surplus_lots ORDER BY created_at DESC`);
    }

    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((r: any) => {
        const std = String(r.spec_standard || '');
        const gradeStr = std.includes('8.8')
          ? '8.8 HT'
          : std.includes('12.9')
          ? '12.9 Alloy'
          : std.includes('SS316') || std.includes('SS 316')
          ? 'SS 316'
          : std.includes('B7')
          ? 'B7 Alloy'
          : 'High Tensile';

        const weightTonnes = parseFloat(r.total_weight_tonnes) || 1.0;
        const excessKg = weightTonnes * 1000;
        const estQtyPcs = Math.round(excessKg / 0.08);

        return {
          id: r.id,
          sku: r.lot_number,
          name: r.title,
          standard: std,
          grade: gradeStr,
          excessQtyPcs: estQtyPcs,
          excessQtyKg: excessKg,
          regularPriceKg: parseFloat(r.market_price_per_kg) || 180,
          clearanceDiscountPct: r.discount_pct || 35,
          clearancePriceKg: parseFloat(r.clearance_price_per_kg) || 110,
          locationHub: r.depot_location || 'Central Clearance Yard',
          isActive: r.status === 'AVAILABLE',
          imageUrl: r.image_url || '/assets/bolt_zinc.jpg',
        };
      });
    }
  } catch (err) {
    console.warn('[Surplus API] MySQL query fallback:', err);
  }

  // Resilient memory fallback if database is momentarily unreachable
  return DEFAULT_SURPLUS_SEEDS.map((s, idx) => ({
    id: idx + 1,
    sku: s.lot_number,
    name: s.title,
    standard: s.spec_standard,
    grade: s.spec_standard.includes('8.8') ? '8.8 HT' : 'High Tensile',
    excessQtyPcs: Math.round((s.total_weight_tonnes * 1000) / 0.08),
    excessQtyKg: s.total_weight_tonnes * 1000,
    regularPriceKg: s.market_price_per_kg,
    clearanceDiscountPct: s.discount_pct,
    clearancePriceKg: s.clearance_price_per_kg,
    locationHub: s.depot_location,
    isActive: s.status === 'AVAILABLE',
    imageUrl: s.image_url,
  }));
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

    const sku = String(body.sku).trim().toUpperCase();
    const name = String(body.name).trim();
    const standard = body.standard || 'DIN 933';
    const grade = body.grade || '8.8 HT';
    const regPrice = parseFloat(body.regularPriceKg) || 160;
    const discountPct = parseFloat(body.clearanceDiscountPct) || 35;
    const clearancePrice = body.clearancePriceKg
      ? parseFloat(body.clearancePriceKg)
      : regPrice * (1 - discountPct / 100);
    const qtyKg = parseFloat(body.excessQtyKg) || 750.0;
    const qtyPcs = parseInt(body.excessQtyPcs) || Math.round(qtyKg / 0.08);
    const weightTonnes = +(qtyKg / 1000).toFixed(3);
    const locationHub = body.locationHub || 'Bhiwandi Hub (MH)';
    const spec = body.spec || `${standard} Grade ${grade}`;
    const statusVal = body.isActive !== false ? 'AVAILABLE' : 'RESERVED';
    const imageUrl = body.imageUrl || '/assets/bolt_zinc.jpg';

    await ensureSurplusTable();

    // Persist directly to MySQL database
    const insertResult: any = await query(
      `INSERT INTO surplus_lots (
        lot_number, title, description, spec_standard, total_weight_tonnes,
        market_price_per_kg, clearance_price_per_kg, discount_pct, depot_location, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        spec_standard = VALUES(spec_standard),
        total_weight_tonnes = VALUES(total_weight_tonnes),
        market_price_per_kg = VALUES(market_price_per_kg),
        clearance_price_per_kg = VALUES(clearance_price_per_kg),
        discount_pct = VALUES(discount_pct),
        depot_location = VALUES(depot_location),
        status = VALUES(status),
        image_url = VALUES(image_url)`,
      [
        sku,
        name,
        body.description || `${name} - Verified surplus inventory lot.`,
        spec,
        weightTonnes,
        regPrice,
        clearancePrice,
        discountPct,
        locationHub,
        statusVal,
        imageUrl,
      ]
    );

    const insertedId = insertResult?.insertId || Date.now();

    const newLot: SurplusLot = {
      id: insertedId,
      sku,
      name,
      standard,
      grade,
      excessQtyPcs: qtyPcs,
      excessQtyKg: qtyKg,
      regularPriceKg: regPrice,
      clearanceDiscountPct: discountPct,
      clearancePriceKg: clearancePrice,
      locationHub,
      isActive: statusVal === 'AVAILABLE',
      imageUrl,
    };

    return NextResponse.json(
      {
        success: true,
        message: `Surplus Lot ${newLot.sku} opened for rapid liquidation (-${discountPct}%).`,
        data: newLot,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Surplus API] POST error:', error);
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

    await ensureSurplusTable();

    const regPrice = updates.regularPriceKg !== undefined ? parseFloat(updates.regularPriceKg) : undefined;
    const discountPct = updates.clearanceDiscountPct !== undefined ? parseFloat(updates.clearanceDiscountPct) : undefined;
    let clearancePrice = updates.clearancePriceKg !== undefined ? parseFloat(updates.clearancePriceKg) : undefined;
    if (clearancePrice === undefined && regPrice !== undefined && discountPct !== undefined) {
      clearancePrice = regPrice * (1 - discountPct / 100);
    }
    const weightTonnes = updates.excessQtyKg !== undefined ? +(parseFloat(updates.excessQtyKg) / 1000).toFixed(3) : undefined;
    const statusVal = updates.isActive !== undefined ? (updates.isActive ? 'AVAILABLE' : 'RESERVED') : undefined;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('title = ?');
      values.push(updates.name);
    }
    if (updates.standard !== undefined || updates.grade !== undefined) {
      const spec = updates.standard && updates.grade ? `${updates.standard} Grade ${updates.grade}` : updates.standard;
      fields.push('spec_standard = ?');
      values.push(spec);
    }
    if (weightTonnes !== undefined) {
      fields.push('total_weight_tonnes = ?');
      values.push(weightTonnes);
    }
    if (regPrice !== undefined) {
      fields.push('market_price_per_kg = ?');
      values.push(regPrice);
    }
    if (clearancePrice !== undefined) {
      fields.push('clearance_price_per_kg = ?');
      values.push(clearancePrice);
    }
    if (discountPct !== undefined) {
      fields.push('discount_pct = ?');
      values.push(discountPct);
    }
    if (updates.locationHub !== undefined) {
      fields.push('depot_location = ?');
      values.push(updates.locationHub);
    }
    if (statusVal !== undefined) {
      fields.push('status = ?');
      values.push(statusVal);
    }

    if (fields.length > 0) {
      values.push(id);
      values.push(String(id));
      await query(
        `UPDATE surplus_lots SET ${fields.join(', ')} WHERE id = ? OR lot_number = ?`,
        values
      );
    }

    return NextResponse.json({
      success: true,
      message: `Surplus Lot updated successfully.`,
      data: { id, ...updates },
    });
  } catch (error: any) {
    console.error('[Surplus API] PUT error:', error);
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

    await ensureSurplusTable();
    await query(`DELETE FROM surplus_lots WHERE id = ? OR lot_number = ?`, [id, id]);

    return NextResponse.json({
      success: true,
      message: `Surplus Lot ${id} delisted from liquidation pool.`,
    });
  } catch (error: any) {
    console.error('[Surplus API] DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Surplus delete failed' }, { status: 500 });
  }
}
