import { NextResponse } from 'next/server';
import { getErpNextConfig, saveErpNextConfig, testErpNextConnection } from '@/lib/erpnext';

export async function GET() {
  const config = getErpNextConfig();
  
  // Mask secret for UI security
  const maskedSecret = config.apiSecret 
    ? `${config.apiSecret.slice(0, 4)}••••••••${config.apiSecret.slice(-4)}`
    : '';

  return NextResponse.json({
    success: true,
    data: {
      erpnextUrl: config.erpnextUrl,
      apiKey: config.apiKey,
      apiSecretMasked: maskedSecret,
      hasSecret: Boolean(config.apiSecret),
      defaultPriceList: config.defaultPriceList,
      defaultWarehouse: config.defaultWarehouse,
      autoSync: config.autoSync,
      lastSyncTime: config.lastSyncTime,
      lastSyncStatus: config.lastSyncStatus,
      lastError: config.lastError,
      syncedItemsCount: config.syncedItemsCount,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { erpnextUrl, apiKey, apiSecret, defaultPriceList, defaultWarehouse, autoSync, testOnly } = body;

    const updates: any = {};
    if (erpnextUrl !== undefined) updates.erpnextUrl = erpnextUrl.trim();
    if (apiKey !== undefined) updates.apiKey = apiKey.trim();
    if (apiSecret !== undefined && apiSecret.trim() !== '') updates.apiSecret = apiSecret.trim();
    if (defaultPriceList !== undefined) updates.defaultPriceList = defaultPriceList.trim();
    if (defaultWarehouse !== undefined) updates.defaultWarehouse = defaultWarehouse.trim();
    if (autoSync !== undefined) updates.autoSync = Boolean(autoSync);

    // Test connection first
    const testResult = await testErpNextConnection(updates);

    if (testOnly) {
      return NextResponse.json({
        success: testResult.success,
        message: testResult.success 
          ? `Connection verified! Authenticated as "${testResult.user}" on ${testResult.serverUrl}`
          : `Connection failed: ${testResult.error}`,
        user: testResult.user,
        serverUrl: testResult.serverUrl,
        error: testResult.error,
      });
    }

    // Save configuration
    const saved = saveErpNextConfig({
      ...updates,
      lastSyncStatus: testResult.success ? 'CONNECTED' : (updates.erpnextUrl ? 'ERROR' : 'STANDBY'),
      lastError: testResult.error || null,
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success
        ? `ERPNext credentials saved and connection established with ${saved.erpnextUrl}!`
        : `Credentials saved, but connection test failed: ${testResult.error}`,
      data: saved,
      testResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
