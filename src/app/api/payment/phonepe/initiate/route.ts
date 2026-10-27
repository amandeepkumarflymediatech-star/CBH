import { NextRequest, NextResponse } from 'next/server';
import { initiatePhonePePayment } from '@/lib/phonepe';

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
    const redirectUrl = `${protocol}://${host}/order-success`;
    const callbackUrl = `${protocol}://${host}/api/payment/phonepe/callback`;

    const result = await initiatePhonePePayment({
      merchantTransactionId: transactionId,
      merchantUserId: body.customerPhone ? `CUST-${body.customerPhone.slice(-10)}` : `USER-${Date.now()}`,
      amount: Number(body.amount),
      customerName: body.customerName || 'Procurement In-Charge',
      customerPhone: body.customerPhone || '9888021000',
      customerEmail: body.customerEmail || 'orders@cbh.store',
      redirectUrl,
      callbackUrl,
      notes: {
        orderId,
        companyName: body.companyName || '',
        gstin: body.gstin || '',
        totalWeightKg: String(body.totalWeightKg || '0'),
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
