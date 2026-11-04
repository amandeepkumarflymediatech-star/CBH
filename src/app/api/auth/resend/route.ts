import { NextResponse } from 'next/server';
import { createPasswordReset } from '@/lib/password-reset-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const result = await createPasswordReset(email);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to resend code' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Fresh verification token and 6-digit OTP re-sent to ${email}.`,
      otp: result.otp,
      resetToken: result.resetToken,
      sentAt: new Date().toISOString(),
      countdownSeconds: 45,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend code' },
      { status: 500 }
    );
  }
}
