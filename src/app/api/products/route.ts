import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const standard = searchParams.get('standard');
  const grade = searchParams.get('grade');
  const isSurplus = searchParams.get('surplus');

  let results = [...INITIAL_PRODUCTS];

  if (standard && standard !== 'all') {
    results = results.filter((p) => p.standard.toLowerCase().includes(standard.toLowerCase()));
  }
  if (grade && grade !== 'all') {
    results = results.filter((p) => p.grade.toLowerCase().includes(grade.toLowerCase()));
  }
  if (isSurplus === 'true') {
    results = results.filter((p) => p.isSurplus);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate required fields
    if (!body.sku || !body.name || !body.pricePerPiece || !body.pricePerKg) {
      return NextResponse.json(
        { success: false, error: 'Missing required fastener fields (sku, name, pricePerPiece, pricePerKg)' },
        { status: 400 }
      );
    }

    const newProduct = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Fastener SKU successfully registered in catalog database.',
      data: newProduct,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
