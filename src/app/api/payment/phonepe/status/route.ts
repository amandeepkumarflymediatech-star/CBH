import { NextRequest, NextResponse } from 'next/server';
import {
  checkPhonePePaymentStatus,
  getPhonePeTransactions,
  deletePhonePeTransaction,
  clearAllPhonePeTransactions,
} from '@/lib/phonepe';

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get('txnId') || searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      // Body may be empty or non-JSON for query-based DELETE
    }

    // 1. Wipe all transactions
    if (all || body?.all === true) {
      clearAllPhonePeTransactions();
      return NextResponse.json({
        success: true,
        message: 'All payment transaction records cleared from ledger.',
      });
    }

    // 2. Single transaction delete
    const targetId = txnId || body?.txnId || body?.id;
    if (targetId) {
      const deleted = deletePhonePeTransaction(targetId);
      return NextResponse.json({
        success: true,
        message: deleted
          ? `Transaction ${targetId} removed from ledger.`
          : `Transaction ${targetId} not found or already removed.`,
      });
    }

    // 3. Batch delete by array of IDs
    if (Array.isArray(body?.ids)) {
      let count = 0;
      for (const id of body.ids) {
        if (deletePhonePeTransaction(id)) count++;
      }
      return NextResponse.json({
        success: true,
        message: `Removed ${count} transactions from ledger.`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Transaction ID or all=true required for deletion' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
