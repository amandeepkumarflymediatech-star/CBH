import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      success: true,
      message: `Fresh verification token and OTP re-sent to ${email}.`,
      sentAt: new Date().toISOString(),
      countdownSeconds: 60,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend code' },
      { status: 500 }
    );
  }
}
