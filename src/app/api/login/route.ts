import { NextRequest, NextResponse } from 'next/server';

const SITE_PASSWORD = process.env.SITE_PASSWORD;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (!SITE_PASSWORD) {
    return NextResponse.json({ success: false, error: 'No password configured' }, { status: 500 });
  }

  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('optc-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 });
}
