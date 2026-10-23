import { NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_ORDERS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = 'CBH-ORD-2025-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'PROCESSING',
      carrier: 'TCI Freight Express',
      trackingNumber: 'TCI-' + Math.floor(100000 + Math.random() * 900000),
      dispatchDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      mtcCertNumber: `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`,
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: `Purchase Order ${orderNumber} created. Metallurgical testing initiated.`,
      data: newOrder,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
