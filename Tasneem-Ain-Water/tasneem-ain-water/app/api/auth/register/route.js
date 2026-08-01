import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'من فضلك أدخل الاسم والإيميل وكلمة المرور' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب ان تكون 6 حروف على الأقل' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'هذا الإيميل مسجل من قبل ' }, { status: 409 });
    }

    const password_hash = hashPassword(password);
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)')
      .run(name.trim(), email.toLowerCase().trim(), password_hash, phone || null);

    const user = { id: info.lastInsertRowid, name, email: email.toLowerCase().trim(), is_admin: 0 };
    await setSessionCookie({ userId: user.id, isAdmin: false });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع، حاول مره اخرى' }, { status: 500 });
  }
}