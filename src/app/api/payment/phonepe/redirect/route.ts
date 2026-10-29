import { NextRequest, NextResponse } from 'next/server';
import { checkPhonePePaymentStatus, savePhonePeTransaction, getPhonePeTransactions } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

async function handleRedirect(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

  let transactionId = '';
  let orderNumber = '';
  let amount = 0;
  let status = 'PENDING';
  let erpnextOrderId = '';

  if (req.method === 'GET') {
    const sp = req.nextUrl.searchParams;
    transactionId = sp.get('txnId') || sp.get('transactionId') || sp.get('merchantTransactionId') || '';
    orderNumber = sp.get('orderNumber') || transactionId;
    amount = Number(sp.get('amount') || 0);
    const code = sp.get('code') || '';
    if (code === 'PAYMENT_SUCCESS') status = 'SUCCESS';
  } else if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}));
        transactionId = body.transactionId || body.merchantTransactionId || '';
        orderNumber = body.orderNumber || transactionId;
        amount = Number(body.amount ? body.amount / 100 : 0);
        if (body.code === 'PAYMENT_SUCCESS') status = 'SUCCESS';
      } else {
        const formData = await req.formData().catch(() => null);
        if (formData) {
          transactionId = (formData.get('transactionId') || formData.get('merchantTransactionId'))?.toString() || '';
          orderNumber = formData.get('orderNumber')?.toString() || transactionId;
          const code = formData.get('code')?.toString() || '';
          if (code === 'PAYMENT_SUCCESS') status = 'SUCCESS';
        }
      }
    } catch (e) {
      console.warn('[PhonePe Redirect] Parse error:', e);
    }
  }

  // If transactionId is present, verify with PhonePe S2S status check
  if (transactionId) {
    try {
      const statusRes = await checkPhonePePaymentStatus(transactionId);
      if (statusRes.success && statusRes.status === 'SUCCESS') {
        status = 'SUCCESS';
        if (statusRes.amount) amount = statusRes.amount;
      }
    } catch (err) {
      console.warn('[PhonePe Redirect] Status check error:', err);
    }

    // Update transaction record and push Sales Order to ERPNext if SUCCESS
    const existing = getPhonePeTransactions().find((t) => t.transactionId === transactionId);
    erpnextOrderId = existing?.erpnextSalesOrderId || '';

    if (status === 'SUCCESS' && existing && !erpnextOrderId) {
      try {
        const { pushSalesOrderToErpNext } = await import('@/lib/erpnext');
        const erpRes = await pushSalesOrderToErpNext({
          orderNumber: orderNumber || existing.orderNumber,
          customerName: existing.customerName || 'Procurement In-Charge',
          companyName: existing.companyName,
          email: existing.customerEmail,
          phone: existing.customerPhone,
          shippingAddress: existing.shippingAddress,
          totalAmount: amount || existing.amount,
          items: existing.items || [
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
      } catch (err) {
        console.warn('[PhonePe Redirect] ERPNext Sales Order push notice:', err);
      }
    }

    if (existing) {
      savePhonePeTransaction({
        ...existing,
        status: status as any,
        erpnextSalesOrderId: erpnextOrderId || existing.erpnextSalesOrderId,
        updatedAt: new Date().toISOString(),
      });
      if (!orderNumber) orderNumber = existing.orderNumber;
      if (!amount) amount = existing.amount;

      // If payment is SUCCESS, persist or update order in MySQL database
      if (status === 'SUCCESS') {
        try {
          const { saveOrderToMySQL } = await import('@/lib/orders-db');
          const calcWeight = (existing.items || []).reduce(
            (acc: number, it: any) =>
              acc + Number(it.weightKg || it.weightPerPcKg || 0.05) * Number(it.quantity || 1),
            0
          );
          await saveOrderToMySQL({
            orderNumber: orderNumber || existing.orderNumber,
            customerName: existing.customerName || 'Enterprise Buyer',
            companyName: existing.companyName,
            email: existing.customerEmail,
            phone: existing.customerPhone,
            shippingAddress: existing.shippingAddress || 'Plot 12, Industrial Area',
            netAmount: amount || existing.amount,
            totalWeightKg: calcWeight || 25.0,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            erpnextSalesOrderId: erpnextOrderId || existing.erpnextSalesOrderId,
            items: existing.items,
          });
        } catch (dbErr) {
          console.warn('[PhonePe Redirect] MySQL order save error:', dbErr);
        }
      }
    }
  }

  const successUrl = new URL('/order-success', `${protocol}://${host}`);
  if (transactionId) successUrl.searchParams.set('txnId', transactionId);
  if (orderNumber) successUrl.searchParams.set('orderNumber', orderNumber);
  if (amount) successUrl.searchParams.set('amount', String(amount));
  if (status) successUrl.searchParams.set('status', status);
  if (erpnextOrderId) successUrl.searchParams.set('erpId', erpnextOrderId);

  return NextResponse.redirect(successUrl.toString(), 303);
}

export async function GET(req: NextRequest) {
  return handleRedirect(req);
}

export async function POST(req: NextRequest) {
  return handleRedirect(req);
}
