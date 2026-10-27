import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    const cleanEmail = email.trim().toLowerCase();
    const discountPct = tierPreference === 'DIAMOND' ? 18 : tierPreference === 'PLATINUM' ? 12 : 5;

    let insertedId = Date.now();
    try {
      const res: any = await query(
        `INSERT INTO users (email, password_hash, full_name, company_name, gstin, phone, role, tier, tier_discount_pct, credit_limit, is_verified, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'customer', ?, ?, 250000, 1, NOW())`,
        [cleanEmail, password || 'Password@123', fullName, companyName || fullName, gstin || '', phone, tierPreference || 'GOLD', discountPct]
      );
      if (res && res.insertId) {
        insertedId = Number(res.insertId);
      }
    } catch (dbErr) {
      console.warn('[Register API] Could not insert to MySQL:', dbErr);
    }

    const newUser = {
      id: insertedId,
      fullName,
      companyName: companyName || fullName,
      gstin: gstin || 'UNREGISTERED',
      email: cleanEmail,
      phone,
      role: 'customer',
      tier: tierPreference || 'GOLD',
      tierDiscountPct: discountPct,
      creditLimit: 250000,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully. Enterprise procurement clearance granted.',
      user: newUser,
      token: 'cbh_token_' + Date.now(),
      redirectTo: '/customer',
    }, { status: 201 });

    response.cookies.set('cbh_role', 'customer', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
