import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'ERPNext integration is disabled.',
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'ERPNext integration is disabled.',
  });
}
