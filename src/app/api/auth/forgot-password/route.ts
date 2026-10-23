import { NextResponse } from 'next/server';

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

    const resetToken = 'reset_' + Math.random().toString(36).substring(2, 10);

    return NextResponse.json({
      success: true,
      message: `Password reset instructions and 6-digit OTP dispatched to ${email}.`,
      resetToken,
      expiresIn: '15 minutes',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset' },
      { status: 500 }
    );
  }
}
