import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'يجب تسجل الدخول' }, { status: 401 });

  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(session.userId);

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));

  return NextResponse.json({ orders: withItems });
}