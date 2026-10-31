import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomRequests,
  getCustomRequestById,
  createCustomRequest,
  updateCustomRequest,
  deleteCustomRequest,
} from '@/lib/custom-requests-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const single = await getCustomRequestById(Number(id));
      if (!single) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: single });
    }

    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const customerEmail = searchParams.get('customerEmail') || undefined;
    const customerPhone = searchParams.get('customerPhone') || undefined;

    const list = await getCustomRequests({
      status,
      search,
      customerEmail,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch custom product requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.productName || !body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Product Name, Customer Name, Email, and Phone are required.' },
        { status: 400 }
      );
    }

    if (!body.diameter || !body.lengthMm) {
      return NextResponse.json(
        { success: false, error: 'Diameter and Length dimensions are required.' },
        { status: 400 }
      );
    }

    const created = await createCustomRequest(body);

    return NextResponse.json(
      {
        success: true,
        message: `Custom request ${created.requestNumber} submitted successfully.`,
        data: created,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit custom product request' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body.id);

    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const updated = await updateCustomRequest(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Request #${updated.requestNumber} updated successfully.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const deleted = await deleteCustomRequest(id);
    return NextResponse.json({
      success: true,
      message: deleted ? `Request #${id} removed` : `Request #${id} not found`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}

