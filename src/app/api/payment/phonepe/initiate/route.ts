import { NextRequest, NextResponse } from 'next/server';
import { initiatePhonePePayment } from '@/lib/phonepe';
import { saveOrderToMySQL } from '@/lib/orders-db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid payment amount in INR is required' },
        { status: 400 }
      );
    }

    const orderId = body.orderId || `CBH-ORD-${Date.now()}`;
    const transactionId = `TXN-${orderId}-${Math.floor(100 + Math.random() * 900)}`;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const source = body.source || 'web';
    const redirectUrl = `${protocol}://${host}/api/payment/phonepe/redirect?source=${encodeURIComponent(source)}`;
    const callbackUrl = `${protocol}://${host}/api/payment/phonepe/callback`;

    // 1. Immediately persist the incoming order into MySQL orders and order_items
    // so the admin panel can identify the order and all its items right away.
    try {
      await saveOrderToMySQL({
        orderNumber: orderId,
        customerId: body.customerId || null,
        customerName: body.customerName || 'Procurement In-Charge',
        companyName: body.companyName || 'Enterprise Fastener Buyer',
        email: body.customerEmail || body.email,
        phone: body.customerPhone || body.phone,
        shippingAddress: body.shippingAddress || 'Plot 12, Industrial Area',
        pincode: body.pincode || body.deliveryPincode,
        grossAmount: body.grossAmount,
        discountAmount: body.discountAmount,
        gstAmount: body.gstAmount,
        netAmount: Number(body.amount),
        totalWeightKg: Number(body.totalWeightKg) || 0,
        itemsCount: Array.isArray(body.items) ? body.items.length : 1,
        status: 'PROCESSING',
        paymentStatus: 'PENDING',
        carrier: body.carrier || 'TCI Freight Express',
        items: body.items,
      });
    } catch (dbErr) {
      console.warn('[PhonePe Initiate] MySQL initial order save notice:', dbErr);
    }

    // 2. Initiate PhonePe Payment Gateway session
    const result = await initiatePhonePePayment({
      merchantTransactionId: transactionId,
      merchantUserId: body.customerPhone ? `CUST-${body.customerPhone.slice(-10)}` : `USER-${Date.now()}`,
      amount: Number(body.amount),
      customerName: body.customerName || 'Procurement In-Charge',
      customerPhone: body.customerPhone || '9888021000',
      customerEmail: body.customerEmail || 'orders@cbh.store',
      companyName: body.companyName,
      shippingAddress: body.shippingAddress,
      items: body.items,
      redirectUrl,
      callbackUrl,
      notes: {
        orderId,
        companyName: body.companyName || '',
        gstin: body.gstin || '',
        totalWeightKg: String(body.totalWeightKg || '0'),
        source,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to initiate PhonePe payment' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      transactionId: result.transactionId,
      orderNumber: orderId,
      isSimulated: result.isSimulated,
      amount: body.amount,
      message: 'PhonePe checkout initiated successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error initiating PhonePe' },
      { status: 500 }
    );
  }
}
