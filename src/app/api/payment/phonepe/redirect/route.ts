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

    // Update transaction record
    const existing = getPhonePeTransactions().find((t) => t.transactionId === transactionId);
    if (existing) {
      savePhonePeTransaction({
        ...existing,
        status: status as any,
        updatedAt: new Date().toISOString(),
      });
      if (!orderNumber) orderNumber = existing.orderNumber;
      if (!amount) amount = existing.amount;
    }
  }

  const successUrl = new URL('/order-success', `${protocol}://${host}`);
  if (transactionId) successUrl.searchParams.set('txnId', transactionId);
  if (orderNumber) successUrl.searchParams.set('orderNumber', orderNumber);
  if (amount) successUrl.searchParams.set('amount', String(amount));
  if (status) successUrl.searchParams.set('status', status);

  return NextResponse.redirect(successUrl.toString(), 303);
}

export async function GET(req: NextRequest) {
  return handleRedirect(req);
}

export async function POST(req: NextRequest) {
  return handleRedirect(req);
}
