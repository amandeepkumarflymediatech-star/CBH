import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let inMemorySession: { user: any; token: string } | null = null;
const SESSION_FILE = path.resolve(process.cwd(), '.mobile_session.json');

function loadSessionFromFile() {
  if (inMemorySession) return inMemorySession;
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const raw = fs.readFileSync(SESSION_FILE, 'utf8');
      inMemorySession = JSON.parse(raw);
      return inMemorySession;
    }
  } catch {}
  return null;
}

function saveSessionToFile(session: { user: any; token: string } | null) {
  inMemorySession = session;
  try {
    if (session) {
      fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
    } else if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch {}
}

export async function GET() {
  const session = loadSessionFromFile();
  if (session && session.user) {
    return NextResponse.json({
      success: true,
      user: session.user,
      token: session.token || 'token_live',
    });
  }
  return NextResponse.json({
    success: false,
    user: null,
    token: null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, token } = body;
    if (user) {
      saveSessionToFile({ user, token: token || 'token_live' });
      return NextResponse.json({ success: true, message: 'Session persisted' });
    }
    saveSessionToFile(null);
    return NextResponse.json({ success: true, message: 'Session cleared' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  saveSessionToFile(null);
  return NextResponse.json({ success: true, message: 'Session cleared' });
}

