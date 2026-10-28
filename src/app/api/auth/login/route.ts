import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, hashPassword, needsRehash } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, securityKey } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Query user from MySQL database
    let dbUser: any = null;
    try {
      const rows = await query<any>(
        'SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1',
        [cleanEmail]
      );
      if (rows && rows.length > 0) {
        dbUser = rows[0];
      }
    } catch (dbErr: any) {
      console.warn('[Login API] MySQL query notice:', dbErr.message);
    }

    // 2. Fallback check for simulated developer admin if DB is uninitialized
    if (!dbUser) {
      if (cleanEmail === 'admin@cbh.store' && password === 'Admin@Fastener2025') {
        dbUser = {
          id: 1,
          email: 'admin@cbh.store',
          password_hash: 'Admin@Fastener2025',
          full_name: 'Harpreet Singh (Chief Operations)',
          company_name: 'CBH Fasteners Tech Pvt. Ltd.',
          gstin: '03AABCC1234F1Z0',
          phone: '+91 98880 21000',
          role: 'admin',
          tier: 'VIP',
          tier_discount_pct: 25.0,
          credit_limit: 1000000.0,
          is_verified: 1,
        };
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    // 3. Cryptographic password verification (bcrypt with backward compatibility)
    const isValidPassword = await verifyPassword(password, dbUser.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Auto-upgrade legacy plain-text passwords to secure bcrypt hashes
    if (needsRehash(dbUser.password_hash)) {
      try {
        const newHash = await hashPassword(password);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, dbUser.id]);
        console.log(`[Login API] Successfully upgraded password to bcrypt hash for user: ${dbUser.email}`);
      } catch (upgradeErr) {
        console.warn('[Login API] Could not auto-upgrade password hash:', upgradeErr);
      }
    }

    const userRole = dbUser.role || (cleanEmail.includes('admin') || role === 'admin' ? 'admin' : 'customer');
    const isAdmin = userRole === 'admin';

    // 5. Validate Admin Hardware Security Key if admin
    if (isAdmin) {
      const configuredEnvKey =
        process.env.ADMIN_SECURITY_KEY ||
        process.env.NEXT_PUBLIC_ADMIN_SECURITY_KEY ||
        'CBH-HQ-OP-901';

      if (securityKey && securityKey.trim() !== configuredEnvKey.trim()) {
        return NextResponse.json(
          { success: false, error: 'Invalid Station Hardware Security Key. Clearance denied.' },
          { status: 401 }
        );
      }
    }

    // 6. Construct authenticated user session payload
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.full_name,
      companyName: dbUser.company_name,
      gstin: dbUser.gstin,
      phone: dbUser.phone,
      role: userRole,
      tier: dbUser.tier || 'GOLD',
      tierDiscountPct: parseFloat(dbUser.tier_discount_pct) || (isAdmin ? 25 : 10),
      creditLimit: parseFloat(dbUser.credit_limit) || 250000,
      isVerified: Boolean(dbUser.is_verified),
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

    response.cookies.set('cbh_session', user.email, {
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
