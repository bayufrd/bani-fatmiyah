import { NextRequest, NextResponse } from 'next/server';

export function checkAdminPassword(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password');
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  if (!expectedPassword) {
    console.warn('⚠️ ADMIN_PASSWORD not set in .env');
    return false;
  }
  
  return password === expectedPassword;
}

export function createAdminResponse(message: string, status: number = 401) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}
