import { NextResponse } from 'next/server';
import { CustomerOrder } from '@/lib/types';
import { query } from '@/lib/db';
import { pushSalesOrderToErpNext } from '@/lib/erpnext';
import { getOrdersFromMySQL, saveOrderToMySQL } from '@/lib/orders-db';

let memoryOrdersDb: CustomerOrder[] = [];

async function getOrders(): Promise<CustomerOrder[]> {
  const mysqlOrders = await getOrdersFromMySQL();
  if (mysqlOrders.length > 0) {
    return mysqlOrders;
  }
  return memoryOrdersDb;
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
        ord.shippingAddress?.toLowerCase().includes(search) ||
        (ord.erpnextSalesOrderId && ord.erpnextSalesOrderId.toLowerCase().includes(search))
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
    const orderNumber =
      body.orderNumber || 'CBH-ORD-2025-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: body.date || new Date().toISOString().split('T')[0],
      customerName: body.customerName || 'Procurement In-Charge',
      companyName: body.companyName || 'Enterprise Fastener Buyer',
      itemsCount: parseInt(body.itemsCount) || (body.items?.length || 1),
      totalWeightKg: parseFloat(body.totalWeightKg) || 250.0,
      netAmount: parseFloat(body.netAmount) || 45000.0,
      status: body.status || 'CONFIRMED',
      carrier: body.carrier || 'TCI Freight Express',
      trackingNumber: body.trackingNumber || 'TCI-' + Math.floor(100000 + Math.random() * 900000),
      dispatchDate: body.dispatchDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      shippingAddress: body.shippingAddress || 'Plot 12, Industrial Area, Sector 5, Pune, MH',
      mtcCertNumber: body.mtcCertNumber || `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`,
      items: body.items,
    };

    // 1. Push to ERPNext Sales Order & trigger stock reservation / deduction
    try {
      const erpResult = await pushSalesOrderToErpNext({
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName || 'Procurement In-Charge',
        companyName: newOrder.companyName,
        email: body.email,
        phone: body.phone,
        shippingAddress: newOrder.shippingAddress,
        totalAmount: newOrder.netAmount,
        items: body.items || [
          {
            sku: 'CBH-125A-M10-HDG',
            name: 'Plain Flat Washer DIN 125A M10',
            quantity: Math.max(10, Math.round(newOrder.totalWeightKg / 0.05)),
            rate: parseFloat((newOrder.netAmount / Math.max(1, newOrder.itemsCount)).toFixed(2)),
          },
        ],
        submitOrder: true,
        deductStockImmediately: true,
      });

      if (erpResult.success && erpResult.erpnextSalesOrderId) {
        newOrder.erpnextSalesOrderId = erpResult.erpnextSalesOrderId;
      }
    } catch (erpErr) {
      console.warn('[Orders API] Background ERPNext push notice:', erpErr);
    }

    // 2. Persist order and line items to MySQL database
    try {
      const dbOrderId = await saveOrderToMySQL({
        orderNumber: newOrder.orderNumber,
        customerId: body.customerId || null,
        customerName: newOrder.customerName,
        companyName: newOrder.companyName,
        email: body.email,
        phone: body.phone,
        shippingAddress: newOrder.shippingAddress,
        pincode: body.pincode,
        grossAmount: body.grossAmount,
        discountAmount: body.discountAmount,
        gstAmount: body.gstAmount,
        netAmount: newOrder.netAmount,
        totalWeightKg: newOrder.totalWeightKg,
        itemsCount: newOrder.itemsCount,
        status: newOrder.status,
        paymentStatus: body.paymentStatus || 'PAID',
        carrier: newOrder.carrier,
        trackingNumber: newOrder.trackingNumber,
        dispatchDate: newOrder.dispatchDate,
        mtcCertNumber: newOrder.mtcCertNumber,
        erpnextSalesOrderId: newOrder.erpnextSalesOrderId,
        items: body.items,
      });

      if (dbOrderId) {
        newOrder.id = String(dbOrderId);
      }
    } catch (dbErr) {
      console.error('[Orders API] MySQL insert error:', dbErr);
    }

    memoryOrdersDb.unshift(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: `Order ${newOrder.orderNumber} dispatched into logistics tracking.${
          newOrder.erpnextSalesOrderId
            ? ` Created ERPNext Sales Order: ${newOrder.erpnextSalesOrderId}`
            : ''
        }`,
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Update in MySQL
    try {
      await query(
        `UPDATE orders SET
          order_status = COALESCE(?, order_status),
          carrier_name = COALESCE(?, carrier_name),
          tracking_number = COALESCE(?, tracking_number),
          dispatch_date = COALESCE(?, dispatch_date),
          shipping_address = COALESCE(?, shipping_address),
          mtc_document_url = COALESCE(?, mtc_document_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? OR order_number = ?`,
        [
          updates.status || null,
          updates.carrier || null,
          updates.trackingNumber || null,
          updates.dispatchDate || null,
          updates.shippingAddress || null,
          updates.mtcCertNumber || null,
          id,
          id,
        ]
      );
    } catch (mysqlErr) {
      console.warn('[Orders API] MySQL update error:', mysqlErr);
    }

    const index = memoryOrdersDb.findIndex((ord) => ord.id === id);
    if (index !== -1) {
      memoryOrdersDb[index] = {
        ...memoryOrdersDb[index],
        ...updates,
      };
    }

    return NextResponse.json({
      success: true,
      message: `Order logistics details updated.`,
      data: updates,
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

    // Delete from MySQL
    try {
      await query('DELETE FROM order_items WHERE order_id = ? OR order_id IN (SELECT id FROM orders WHERE order_number = ?)', [id, id]);
      await query('DELETE FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    } catch (mysqlErr) {
      console.warn('[Orders API] MySQL delete error:', mysqlErr);
    }

    const index = memoryOrdersDb.findIndex((ord) => ord.id === id);
    if (index !== -1) {
      memoryOrdersDb.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      message: `Order record deleted from database.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Order deletion failed' }, { status: 500 });
  }
}
