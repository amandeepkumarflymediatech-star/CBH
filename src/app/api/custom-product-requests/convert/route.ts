import { NextRequest, NextResponse } from 'next/server';
import { convertCustomRequestToProduct } from '@/lib/custom-requests-db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.requestId || !body.sku || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Request ID, SKU, and Name are required for catalog conversion.' },
        { status: 400 }
      );
    }

    if (!body.pricePerPiece || !body.pricePerKg) {
      return NextResponse.json(
        { success: false, error: 'Standard selling rates (Price per Pc and Price per Kg) are required.' },
        { status: 400 }
      );
    }

    const result = await convertCustomRequestToProduct({
      requestId: Number(body.requestId),
      sku: String(body.sku),
      name: String(body.name),
      pricePerPiece: Number(body.pricePerPiece),
      pricePerKg: Number(body.pricePerKg),
      weightPerPcKg: Number(body.weightPerPcKg) || 0.05,
      stockPcs: body.stockPcs !== undefined ? Number(body.stockPcs) : 5000,
      isSurplus: Boolean(body.isSurplus),
      surplusDiscountPct: Number(body.surplusDiscountPct) || 0,
      syncToErpNext: Boolean(body.syncToErpNext),
      adminNotes: body.adminNotes,
      moq: body.moq,
      leadTimeDays: body.leadTimeDays ? Number(body.leadTimeDays) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Product ${result.product.sku} successfully onboarded to catalog!`,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to convert request to catalog product' },
      { status: 500 }
    );
  }
}

