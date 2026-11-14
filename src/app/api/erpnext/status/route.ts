import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      erpnextUrl: '',
      apiKey: '',
      apiSecretMasked: '',
      hasSecret: false,
      defaultPriceList: '',
      defaultWarehouse: '',
      autoSync: false,
      lastSyncTime: null,
      lastSyncStatus: 'DISABLED',
      lastError: null,
      syncedItemsCount: 0,
      enabled: false,
    },
    message: 'ERPNext integration is disabled.',
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'ERPNext integration is disabled.',
  });
}
