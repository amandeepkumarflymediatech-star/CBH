import { NextResponse } from 'next/server';
import { verifyAndResetPassword } from '@/lib/password-reset-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, token, newPassword } = body;

    const code = (otp || token || '').trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification OTP or reset token is required' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const result = await verifyAndResetPassword(email, code, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Password has been successfully updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset' },
      { status: 500 }
    );
  }
}

