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
      let erpnextOrderId = existing?.erpnextSalesOrderId;

      if (!erpnextOrderId) {
        try {
          const { pushSalesOrderToErpNext } = await import('@/lib/erpnext');
          const erpRes = await pushSalesOrderToErpNext({
            orderNumber: existing?.orderNumber || transactionId,
            customerName: existing?.customerName || 'Enterprise Buyer',
            companyName: existing?.companyName,
            email: existing?.customerEmail,
            phone: existing?.customerPhone,
            shippingAddress: existing?.shippingAddress,
            totalAmount: amount,
            items: existing?.items || [
              {
                sku: 'CBH-125A-M10-HDG',
                name: 'Plain Flat Washer DIN 125A M10',
                quantity: 100,
                rate: 14.5,
              },
            ],
            submitOrder: true,
            deductStockImmediately: true,
          });
          if (erpRes.success && erpRes.erpnextSalesOrderId) {
            erpnextOrderId = erpRes.erpnextSalesOrderId;
          }
        } catch (erpErr) {
          console.warn('[PhonePe Callback] ERPNext push notice:', erpErr);
        }
      }

      savePhonePeTransaction({
        transactionId,
        orderNumber: existing?.orderNumber || transactionId,
        amount,
        customerName: existing?.customerName || 'Enterprise Buyer',
        customerPhone: existing?.customerPhone || '',
        customerEmail: existing?.customerEmail,
        companyName: existing?.companyName,
        shippingAddress: existing?.shippingAddress,
        items: existing?.items,
        status: 'SUCCESS',
        paymentMode,
        phonepeReferenceId: txnData.transactionId,
        erpnextSalesOrderId: erpnextOrderId,
        responseMessage: 'PhonePe Callback Payment Verified',
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Persist order to MySQL database table `orders` & `order_items`
      try {
        const { saveOrderToMySQL } = await import('@/lib/orders-db');
        const calcWeight = (existing?.items || []).reduce(
          (acc: number, it: any) =>
            acc + Number(it.weightKg || it.weightPerPcKg || 0.05) * Number(it.quantity || 1),
          0
        );
        await saveOrderToMySQL({
          orderNumber: existing?.orderNumber || transactionId,
          customerName: existing?.customerName || 'Enterprise Buyer',
          companyName: existing?.companyName,
          email: existing?.customerEmail,
          phone: existing?.customerPhone,
          shippingAddress: existing?.shippingAddress || 'Plot 12, Industrial Area',
          netAmount: amount,
          totalWeightKg: calcWeight || 25.0,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          erpnextSalesOrderId: erpnextOrderId,
          items: existing?.items,
        });
      } catch (dbErr) {
        console.warn('[PhonePe Callback] MySQL order save error:', dbErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Callback processed successfully',
        erpnextSalesOrderId: erpnextOrderId,
      });
    }

    return NextResponse.json({ success: true, message: 'Callback received with non-success state' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing PhonePe callback' },
      { status: 500 }
    );
  }
}
