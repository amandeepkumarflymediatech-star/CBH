import { NextResponse } from 'next/server';
import { getVirtualStoreZones, updateVirtualStoreZone } from '@/lib/virtual-store-db';

export async function GET() {
  try {
    const zones = await getVirtualStoreZones();
    return NextResponse.json({ success: true, count: zones.length, data: zones });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch zones' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Zone ID is required' }, { status: 400 });
    }

    const updated = await updateVirtualStoreZone(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Zone updated successfully', data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update zone' }, { status: 500 });
  }
}
