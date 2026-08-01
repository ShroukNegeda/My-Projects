import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'يجب تسجل الدخول' }, { status: 401 });

  const { id } = await params;
  const order = db
    .prepare(
      `SELECT orders.*, users.name AS user_name, users.email AS user_email
      FROM orders JOIN users ON users.id = orders.user_id
      WHERE orders.id = ?`
    )
    .get(id);

  if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });

  if (!session.isAdmin && order.user_id !== session.userId) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

  return NextResponse.json({ order: { ...order, items } });
}

export async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowedStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const allowedPayment = ['unpaid', 'paid', 'failed'];

  const updates = [];
  const values = [];

  if (body.status !== undefined) {
    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 });
    }
    updates.push('status = ?');
    values.push(body.status);
    if (body.status === 'delivered' && body.payment_status === undefined) {
      updates.push('payment_status = ?');
      values.push('paid');
    }
  }

  if (body.payment_status !== undefined) {
    if (!allowedPayment.includes(body.payment_status)) {
      return NextResponse.json({ error: 'حالة دفع غير صحيحة' }, { status: 400 });
    }
    updates.push('payment_status = ?');
    values.push(body.payment_status);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'لا يوجد تحديث مطلوب' }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return NextResponse.json({ order });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const { id } = await params;
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}