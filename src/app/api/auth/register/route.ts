import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, companyName, gstin, email, phone, password, tierPreference } = body;

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, and password are required' },
        { status: 400 }
      );
    }

    if (gstin && gstin.length !== 15) {
      return NextResponse.json(
        { success: false, error: 'GSTIN must be a valid 15-character Indian Tax ID' },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now(),
      fullName,
      companyName: companyName || fullName,
      gstin: gstin || 'UNREGISTERED',
      email,
      phone,
      tier: tierPreference || 'GOLD',
      tierDiscountPct: tierPreference === 'DIAMOND' ? 18 : 8,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully. Verification link and OTP dispatched.',
      user: newUser,
      token: 'cbh_token_' + Date.now(),
      redirectTo: '/customer',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
