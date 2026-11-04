import { NextResponse } from 'next/server';
import { createPasswordReset } from '@/lib/password-reset-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address or registered phone is required' },
        { status: 400 }
      );
    }

    const result = await createPasswordReset(email);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate reset code' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions and 6-digit OTP dispatched to ${email}.`,
      otp: result.otp,
      resetToken: result.resetToken,
      expiresIn: result.expiresIn || '15 minutes',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset' },
      { status: 500 }
    );
  }
}
