import { NextResponse } from 'next/server';
import { calculateRfqSummary } from '@/lib/rfq-calculator';
import { RfqLineItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, companyName, gstin, phone, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one fastener line item is required' },
        { status: 400 }
      );
    }

    const summary = calculateRfqSummary(items as RfqLineItem[]);
    const rfqNumber = 'RFQ-CBH-2025-' + Math.floor(1000 + Math.random() * 9000);

    const quotation = {
      rfqNumber,
      customerName: customerName || 'Procurement Manager',
      companyName: companyName || 'Enterprise OEM Client',
      gstin: gstin || 'UNREGISTERED',
      phone: phone || '+91 98880 21000',
      email: email || 'rfq@cbh.store',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      itemsCount: items.length,
      ...summary,
      status: 'QUOTED',
    };

    return NextResponse.json({
      success: true,
      message: 'Official bulk quotation calculated and generated.',
      data: quotation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
