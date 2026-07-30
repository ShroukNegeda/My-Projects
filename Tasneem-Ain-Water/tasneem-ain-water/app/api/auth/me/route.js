import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = db
    .prepare('SELECT id, name, email, phone, is_admin FROM users WHERE id = ?')
    .get(session.userId);

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: { ...user, is_admin: !!user.is_admin } });
}