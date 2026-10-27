import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Admin shortcut or standard client authentication simulation
    const isAdmin = email.includes('admin') || role === 'admin';

    const user = {
      id: isAdmin ? 1 : 101,
      email,
      fullName: isAdmin ? 'Harpreet Singh (Chief Operations)' : 'Rajesh Sharma',
      companyName: isAdmin ? 'CBH Fasteners Tech Pvt. Ltd.' : 'Apex Heavy Infrastructure Ltd.',
      gstin: isAdmin ? '03AABCC1234F1Z0' : '29AABCA1234F1Z5',
      phone: '+91 98880 21000',
      role: isAdmin ? 'admin' : 'customer',
      tier: isAdmin ? 'VIP' : 'DIAMOND',
      tierDiscountPct: isAdmin ? 25 : 18,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Secure session initialized.',
      user,
      token: 'cbh_token_' + Date.now(),
      redirectTo: isAdmin ? '/admin' : '/customer',
    });

    response.cookies.set('cbh_role', user.role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
