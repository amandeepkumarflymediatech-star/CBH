import { NextRequest, NextResponse } from 'next/server';
import { checkPhonePePaymentStatus, getPhonePeTransactions } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get('txnId');

    if (!txnId) {
      // If no txnId is passed, return recent transactions list
      const txns = getPhonePeTransactions();
      return NextResponse.json({
        success: true,
        count: txns.length,
        data: txns,
      });
    }

    const result = await checkPhonePePaymentStatus(txnId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking payment status' },
      { status: 500 }
    );
  }
}
