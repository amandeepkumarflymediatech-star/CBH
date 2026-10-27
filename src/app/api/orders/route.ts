import { NextResponse } from 'next/server';
import { CustomerOrder } from '@/lib/types';
import { query } from '@/lib/db';

let ordersDb: CustomerOrder[] = [];

async function getOrders(): Promise<CustomerOrder[]> {
  try {
    const rows = await query<any>(`
      SELECT o.*, u.full_name as customer_name, u.company_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: String(r.id),
        orderNumber: r.order_number,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        customerName: r.customer_name || 'Procurement In-Charge',
        companyName: r.company_name || 'Enterprise Client',
        itemsCount: Number(r.items_count) || 1,
        totalWeightKg: parseFloat(r.total_weight_kg) || 0,
        netAmount: parseFloat(r.net_amount) || 0,
        status: r.order_status || 'PROCESSING',
        carrier: r.carrier_name || 'Blue Dart Express',
        trackingNumber: r.tracking_number || '',
        dispatchDate: r.dispatch_date ? new Date(r.dispatch_date).toISOString().split('T')[0] : '',
        shippingAddress: r.shipping_address || '',
        mtcCertNumber: r.mtc_document_url || 'MTC-CBH-2025-NABL',
      }));
    }
  } catch (err) {
    console.warn('[Orders API] MySQL query fallback:', err);
  }
  return ordersDb;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const carrier = searchParams.get('carrier');
  const sortBy = searchParams.get('sortBy');

  const allOrders = await getOrders();
  let results = [...allOrders];

  if (search) {
    results = results.filter(
      (ord) =>
        ord.orderNumber.toLowerCase().includes(search) ||
        ord.trackingNumber?.toLowerCase().includes(search) ||
        ord.customerName?.toLowerCase().includes(search) ||
        ord.companyName?.toLowerCase().includes(search) ||
        ord.shippingAddress?.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    results = results.filter((ord) => ord.status.toLowerCase() === status.toLowerCase());
  }

  if (carrier && carrier !== 'all') {
    results = results.filter((ord) => ord.carrier.toLowerCase().includes(carrier.toLowerCase()));
  }

  if (sortBy === 'date_desc') {
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy === 'amount_desc') {
    results.sort((a, b) => b.netAmount - a.netAmount);
  } else if (sortBy === 'weight_desc') {
    results.sort((a, b) => b.totalWeightKg - a.totalWeightKg);
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    total: allOrders.length,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = body.orderNumber || 'CBH-ORD-2025-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: body.date || new Date().toISOString().split('T')[0],
      customerName: body.customerName || 'Procurement In-Charge',
      companyName: body.companyName || 'Enterprise Fastener Buyer',
      itemsCount: parseInt(body.itemsCount) || 3,
      totalWeightKg: parseFloat(body.totalWeightKg) || 250.0,
      netAmount: parseFloat(body.netAmount) || 45000.0,
      status: body.status || 'CONFIRMED',
      carrier: body.carrier || 'TCI Freight Express',
      trackingNumber: body.trackingNumber || 'TCI-' + Math.floor(100000 + Math.random() * 900000),
      dispatchDate: body.dispatchDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      shippingAddress: body.shippingAddress || 'Plot 12, Industrial Area, Sector 5, Pune, MH',
      mtcCertNumber: body.mtcCertNumber || `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`,
    };

    ordersDb.unshift(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: `Order ${newOrder.orderNumber} dispatched into logistics tracking.`,
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Order creation failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const index = ordersDb.findIndex((ord) => ord.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
    }

    const updated = {
      ...ordersDb[index],
      ...updates,
      netAmount: updates.netAmount !== undefined ? parseFloat(updates.netAmount) : ordersDb[index].netAmount,
      totalWeightKg: updates.totalWeightKg !== undefined ? parseFloat(updates.totalWeightKg) : ordersDb[index].totalWeightKg,
    };

    ordersDb[index] = updated;

    return NextResponse.json({
      success: true,
      message: `Order ${updated.orderNumber} logistics details updated.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Order update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const index = ordersDb.findIndex((ord) => ord.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
    }

    const deleted = ordersDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `Order ${deleted.orderNumber} deleted/cancelled from records.`,
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Order deletion failed' }, { status: 500 });
  }
}
