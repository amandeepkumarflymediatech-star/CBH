import { NextResponse } from 'next/server';
import { INITIAL_QUOTES } from '@/lib/mock-data';
import { BulkQuotation } from '@/lib/types';
import { pushRfqToErpNext } from '@/lib/erpnext';

let quotesDb: BulkQuotation[] = [...INITIAL_QUOTES];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy');

  let results = [...quotesDb];

  if (search) {
    results = results.filter(
      (q) =>
        q.rfqNumber.toLowerCase().includes(search) ||
        q.customerName?.toLowerCase().includes(search) ||
        q.companyName?.toLowerCase().includes(search) ||
        q.gstin?.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    results = results.filter((q) => q.status.toLowerCase() === status.toLowerCase());
  }

  if (sortBy === 'date_desc') {
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy === 'amount_desc') {
    results.sort((a, b) => b.netTotal - a.netTotal);
  } else if (sortBy === 'discount_desc') {
    results.sort((a, b) => b.discountPct - a.discountPct);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    total: quotesDb.length,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rfqNumber = body.rfqNumber || 'RFQ-CBH-2025-' + Math.floor(1000 + Math.random() * 9000);

    const gross = parseFloat(body.grossAmount) || 50000;
    const discountPct = parseFloat(body.discountPct) || 15;
    const netTotal = gross * (1 - discountPct / 100);

    const newQuotation: BulkQuotation = {
      id: `quote-${Date.now()}`,
      rfqNumber,
      customerName: body.customerName || 'Procurement Executive',
      companyName: body.companyName || 'Industrial Heavy Corp',
      gstin: body.gstin || '29AABCA9999F1Z0',
      phone: body.phone || '+91 98880 21000',
      email: body.email || 'procurement@client.com',
      date: body.date || new Date().toISOString().split('T')[0],
      validUntil: body.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      itemsCount: parseInt(body.itemsCount) || 3,
      totalWeightKg: parseFloat(body.totalWeightKg) || 350.0,
      grossAmount: gross,
      discountPct: discountPct,
      netTotal: netTotal,
      status: body.status || 'QUOTED',
    };

    quotesDb.unshift(newQuotation);

    // Asynchronously push to ERPNext Quotation doctype if configured
    try {
      pushRfqToErpNext({
        rfqNumber: newQuotation.rfqNumber,
        customerName: newQuotation.customerName,
        companyName: newQuotation.companyName,
        email: newQuotation.email,
        phone: newQuotation.phone,
        totalWeightKg: newQuotation.totalWeightKg,
        grossAmount: newQuotation.grossAmount,
      }).catch((e) => console.log('ERPNext Quotation push background notice:', e.message));
    } catch {
      // Ignore if ERPNext not connected
    }

    return NextResponse.json(
      {
        success: true,
        message: `Bulk RFQ ${newQuotation.rfqNumber} registered successfully.`,
        data: newQuotation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'RFQ creation failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID is required' }, { status: 400 });
    }

    const index = quotesDb.findIndex((q) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const current = quotesDb[index];
    const gross = updates.grossAmount !== undefined ? parseFloat(updates.grossAmount) : current.grossAmount;
    const discountPct = updates.discountPct !== undefined ? parseFloat(updates.discountPct) : current.discountPct;
    const netTotal = gross * (1 - discountPct / 100);

    const updated: BulkQuotation = {
      ...current,
      ...updates,
      grossAmount: gross,
      discountPct: discountPct,
      netTotal: netTotal,
    };

    quotesDb[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Quotation ${updated.rfqNumber} updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'RFQ update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Quotation ID is required' }, { status: 400 });
    }

    const index = quotesDb.findIndex((q) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const deleted = quotesDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `Quotation ${deleted.rfqNumber} deleted from approvals records.`,
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'RFQ deletion failed' }, { status: 500 });
  }
}
