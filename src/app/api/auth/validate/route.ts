import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password harus diisi' },
        { status: 400 }
      );
    }

    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    if (!expectedPassword) {
      console.error('❌ ADMIN_PASSWORD tidak dikonfigurasi di .env.local');
      return NextResponse.json(
        { error: 'Server error: password tidak dikonfigurasi' },
        { status: 500 }
      );
    }

    if (password === expectedPassword) {
      return NextResponse.json({ message: 'Password valid' }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat validasi' },
      { status: 500 }
    );
  }
}
