import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'من فضلك أدخل الإيميل وكلمة المرور' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'الإيميل أو كلمة المرور خطأ' }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id, isAdmin: !!user.is_admin });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, is_admin: !!user.is_admin },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع، حاول مره اخرى' }, { status: 500 });
  }
}