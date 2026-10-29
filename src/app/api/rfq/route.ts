import { NextResponse } from 'next/server';
import { BulkQuotation } from '@/lib/types';
import { pushRfqToErpNext, convertRfqToSalesOrder } from '@/lib/erpnext';
import { query } from '@/lib/db';

let quotesDb: BulkQuotation[] = [];

async function getQuotes(): Promise<BulkQuotation[]> {
  try {
    const rows = await query<any>(`
      SELECT r.*,
             (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = r.id) as items_count
      FROM bulk_rfqs r
      ORDER BY r.created_at DESC
    `);
    if (Array.isArray(rows)) {
      if (rows.length === 0) return [];
      return rows.map((r: any) => ({
        id: String(r.id),
        rfqNumber: r.rfq_number,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customerName: r.contact_name,
        companyName: r.company_name,
        gstin: r.gstin,
        shippingPincode: r.shipping_pincode || '',
        itemsCount: Number(r.items_count) || 1,
        totalWeightKg: parseFloat(r.total_weight_kg) || 0,
        grossAmount: parseFloat(r.gross_amount) || 0,
        discountPct: parseFloat(r.slab_discount_pct) || 0,
        netTotal: parseFloat(r.net_total) || 0,
        status: r.status || 'PENDING',
        globalUnit: r.global_unit || 'PCS',
        validUntil: r.validity_date ? new Date(r.validity_date).toISOString().split('T')[0] : '2026-12-31',
      }));
    }
  } catch (err) {
    console.warn('[RFQ API] MySQL query fallback:', err);
  }
  return quotesDb;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy');

  const allQuotes = await getQuotes();
  let results = [...allQuotes];

  if (search) {
    results = results.filter(
      (q) =>
        q.rfqNumber.toLowerCase().includes(search) ||
        q.customerName?.toLowerCase().includes(search) ||
        q.companyName?.toLowerCase().includes(search) ||
        q.gstin?.toLowerCase().includes(search) ||
        (q.erpnextQuoteId && q.erpnextQuoteId.toLowerCase().includes(search)) ||
        (q.erpnextSalesOrderId && q.erpnextSalesOrderId.toLowerCase().includes(search))
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
    total: allQuotes.length,
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
      itemsCount: parseInt(body.itemsCount) || (body.items?.length || 3),
      totalWeightKg: parseFloat(body.totalWeightKg) || 350.0,
      grossAmount: gross,
      discountPct: discountPct,
      netTotal: netTotal,
      status: body.status || 'QUOTED',
      items: body.items,
    };

    // Push to ERPNext Quotation doctype
    try {
      const erpRes = await pushRfqToErpNext({
        rfqNumber: newQuotation.rfqNumber,
        customerName: newQuotation.customerName,
        companyName: newQuotation.companyName,
        email: newQuotation.email,
        phone: newQuotation.phone,
        gstin: newQuotation.gstin,
        totalWeightKg: newQuotation.totalWeightKg,
        grossAmount: newQuotation.grossAmount,
        items: body.items,
      });
      if (erpRes.success && erpRes.erpnextQuoteId) {
        newQuotation.erpnextQuoteId = erpRes.erpnextQuoteId;
      }
    } catch (e: any) {
      console.warn('[RFQ API] ERPNext Quotation push background notice:', e.message);
    }

    quotesDb.unshift(newQuotation);

    return NextResponse.json(
      {
        success: true,
        message: `Bulk RFQ ${newQuotation.rfqNumber} registered successfully.${
          newQuotation.erpnextQuoteId ? ` Created ERPNext Quotation: ${newQuotation.erpnextQuoteId}` : ''
        }`,
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

    let erpnextSalesOrderId = current.erpnextSalesOrderId;

    // If quotation is converted into a Purchase Order, auto-create ERPNext Sales Order & deduct stock
    if (
      (updates.status === 'CONVERTED_TO_PO' || updates.status === 'PO_ISSUED' || updates.status === 'APPROVED') &&
      !erpnextSalesOrderId
    ) {
      try {
        const erpSoRes = await convertRfqToSalesOrder({
          rfqNumber: current.rfqNumber,
          customerName: current.customerName || 'Procurement Executive',
          companyName: current.companyName || 'Industrial Heavy Corp',
          email: current.email,
          phone: current.phone,
          netTotal,
          items: current.items,
        });
        if (erpSoRes.success && erpSoRes.erpnextSalesOrderId) {
          erpnextSalesOrderId = erpSoRes.erpnextSalesOrderId;
        }
      } catch (err: any) {
        console.warn('[RFQ API] Error converting quote to ERPNext Sales Order:', err.message);
      }
    }

    const updated: BulkQuotation = {
      ...current,
      ...updates,
      grossAmount: gross,
      discountPct: discountPct,
      netTotal: netTotal,
      erpnextSalesOrderId,
    };

    quotesDb[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Quotation ${updated.rfqNumber} updated successfully.${
        erpnextSalesOrderId ? ` ERPNext Sales Order Generated: ${erpnextSalesOrderId}` : ''
      }`,
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
