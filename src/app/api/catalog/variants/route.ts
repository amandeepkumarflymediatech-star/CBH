import { NextResponse } from 'next/server';
import { getFamilyBySlug } from '@/lib/catalog-data';
import { TechnicalVariant } from '@/lib/catalog-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const familySlug = searchParams.get('familySlug');
  if (!familySlug) {
    return NextResponse.json({ success: false, error: 'familySlug query parameter is required' }, { status: 400 });
  }

  const family = getFamilyBySlug(familySlug);
  if (!family) {
    return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, count: family.variants.length, data: family.variants });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const familySlug = body.familySlug;
    if (!familySlug || !body.itemNo || !body.artName) {
      return NextResponse.json(
        { success: false, error: 'familySlug, itemNo, and artName are required' },
        { status: 400 }
      );
    }

    const family = getFamilyBySlug(familySlug);
    if (!family) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }

    const newVariant: TechnicalVariant = {
      id: `var-${body.itemNo}-${Date.now()}`,
      itemNo: String(body.itemNo).trim(),
      artName: body.artName.trim(),
      familySlug: familySlug,
      materialCode: body.materialCode || 'gvz',
      materialName: body.materialName || 'Zinc-plated steel',
      drillHoleDiameterMm: Number(body.drillHoleDiameterMm) || 10,
      effectiveAnchorageDepthMm: Number(body.effectiveAnchorageDepthMm) || 60,
      minDrillHoleDepthMm: Number(body.minDrillHoleDepthMm) || 75,
      maxFixtureThicknessMm: Number(body.maxFixtureThicknessMm) || 10,
      thread: body.thread || 'M10 x 20',
      widthAcrossFlatsMm: Number(body.widthAcrossFlatsMm) || 17,
      anchorageDepthMm: Number(body.anchorageDepthMm) || 68,
      installationTorqueNm: Number(body.installationTorqueNm) || 45,
      totalLengthMm: Number(body.totalLengthMm) || 95,
      gtin: body.gtin || `4048962${Math.floor(100000 + Math.random() * 900000)}`,
      salesUnit: body.salesUnit || '50 Pcs/Box',
      packQty: Number(body.packQty) || 50,
      unitPriceInr: Number(body.unitPriceInr) || 85,
      boxPriceInr: Number(body.boxPriceInr) || (Number(body.unitPriceInr) || 85) * (Number(body.packQty) || 50),
      stockPcs: Number(body.stockPcs) || 5000,
      inStock: (Number(body.stockPcs) || 5000) > 0,
      etaApproved: Boolean(body.etaApproved ?? true),
      iccApproved: Boolean(body.iccApproved ?? true),
      seismicApproved: body.seismicApproved || 'C1/C2',
      fireResistance: body.fireResistance || 'R 120',
    };

    family.variants.push(newVariant);
    family.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, message: 'Variant created', data: newVariant }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const familySlug = body.familySlug;
    if (!familySlug || !body.id) {
      return NextResponse.json({ success: false, error: 'familySlug and id are required' }, { status: 400 });
    }

    const family = getFamilyBySlug(familySlug);
    if (!family) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }

    const idx = family.variants.findIndex((v) => v.id === body.id || v.itemNo === body.itemNo);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
    }

    family.variants[idx] = { ...family.variants[idx], ...body };
    family.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, message: 'Variant updated', data: family.variants[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familySlug = searchParams.get('familySlug');
    const id = searchParams.get('id');

    if (!familySlug || !id) {
      return NextResponse.json({ success: false, error: 'familySlug and id are required' }, { status: 400 });
    }

    const family = getFamilyBySlug(familySlug);
    if (!family) {
      return NextResponse.json({ success: false, error: 'Product family not found' }, { status: 404 });
    }

    const idx = family.variants.findIndex((v) => v.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
    }

    const removed = family.variants.splice(idx, 1)[0];
    family.updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, message: 'Variant deleted', data: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
