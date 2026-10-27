import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check MySQL users table
    try {
      const rows = await query<any>(
        'SELECT id, email, full_name, company_name, role FROM users WHERE LOWER(email) = ? LIMIT 1',
        [cleanEmail]
      );

      if (rows && rows.length > 0) {
        const u = rows[0];
        return NextResponse.json({
          success: true,
          exists: true,
          user: {
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            companyName: u.company_name,
            role: u.role || 'customer',
          },
        });
      }
    } catch (dbErr) {
      console.warn('[check-email] DB lookup failed, falling back:', dbErr);
    }

    // Known fallback accounts for dev / demo
    if (cleanEmail === 'admin@cbh.store' || cleanEmail.includes('admin@')) {
      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          email: cleanEmail,
          fullName: 'Harpreet Singh (Chief Operations)',
          companyName: 'CBH Fasteners Tech Pvt. Ltd.',
          role: 'admin',
        },
      });
    }

    if (cleanEmail === 'procurement@apexinfra.com') {
      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          email: cleanEmail,
          fullName: 'Rajesh Sharma',
          companyName: 'Apex Heavy Infrastructure Ltd.',
          role: 'customer',
        },
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking email' },
      { status: 500 }
    );
  }
}
