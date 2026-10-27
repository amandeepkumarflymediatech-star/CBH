import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, savePhonePeConfig, PhonePeConfig } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getPhonePeConfig();
    // Mask salt key for security in response
    const masked = {
      ...config,
      saltKey: config.saltKey ? `${config.saltKey.slice(0, 8)}...${config.saltKey.slice(-4)}` : '',
    };

    return NextResponse.json({
      success: true,
      data: masked,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching PhonePe config' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const updates: Partial<PhonePeConfig> = await req.json();

    const current = getPhonePeConfig();
    // Only update saltKey if a real non-masked value is provided
    if (updates.saltKey && updates.saltKey.includes('...')) {
      delete updates.saltKey;
    }

    const saved = savePhonePeConfig({
      ...updates,
      merchantId: updates.merchantId || current.merchantId,
      saltIndex: updates.saltIndex || current.saltIndex,
      environment: updates.environment || current.environment,
    });

    return NextResponse.json({
      success: true,
      message: 'PhonePe gateway configuration saved successfully',
      data: {
        ...saved,
        saltKey: saved.saltKey ? `${saved.saltKey.slice(0, 8)}...${saved.saltKey.slice(-4)}` : '',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error saving PhonePe config' },
      { status: 500 }
    );
  }
}
