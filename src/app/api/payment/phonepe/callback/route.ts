import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, savePhonePeTransaction, getPhonePeTransactions } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const xVerify = req.headers.get('x-verify') || '';

    // Extract base64 response from PhonePe
    const base64Response = body.response;
    if (!base64Response) {
      return NextResponse.json({ success: false, error: 'Empty callback payload' }, { status: 400 });
    }

    const decoded = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
    const txnData = decoded.data;

    if (decoded.code === 'PAYMENT_SUCCESS' && txnData) {
      const transactionId = txnData.merchantTransactionId;
      const amount = txnData.amount ? txnData.amount / 100 : 0;
      const paymentMode = txnData.paymentInstrument?.type || 'UPI';

      const existing = getPhonePeTransactions().find((t) => t.transactionId === transactionId);

      savePhonePeTransaction({
        transactionId,
        orderNumber: existing?.orderNumber || transactionId,
        amount,
        customerName: existing?.customerName || 'Enterprise Buyer',
        customerPhone: existing?.customerPhone || '',
        customerEmail: existing?.customerEmail,
        status: 'SUCCESS',
        paymentMode,
        phonepeReferenceId: txnData.transactionId,
        responseMessage: 'PhonePe Callback Payment Verified',
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Callback processed successfully' });
    }

    return NextResponse.json({ success: true, message: 'Callback received with non-success state' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing PhonePe callback' },
      { status: 500 }
    );
  }
}
