import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const orders = db
    .prepare(
      `SELECT orders.*, users.name AS user_name, users.email AS user_email
      FROM orders JOIN users ON users.id = orders.user_id
      ORDER BY orders.created_at DESC`
    )
    .all();

  return NextResponse.json({ orders });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول اولا' }, { status: 401 });
  }

  try {
    const {
      items,
      customer_name,
      customer_phone,
      city,
      district,
      address_line,
      notes,
      payment_method,
      payment_note,
    } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'السلة فارغه' }, { status: 400 });
    }
    if (!customer_name || !customer_phone || !city || !address_line) {
      return NextResponse.json({ error: 'من فضلك أكمل بيانات التوصيل' }, { status: 400 });
    }

    const allowedMethods = ['cod', 'bank_transfer'];
    const method = allowedMethods.includes(payment_method) ? payment_method : 'cod';

    let total = 0;
    const resolvedItems = items.map((item) => {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
      if (!product) throw new Error('يوجد منتج غير متاح في السلة');
      const quantity = Math.max(1, Number(item.quantity) || 1);
      total += product.price * quantity;
      return { product_id: product.id, product_name: product.name, unit_price: product.price, quantity };
    });

    const orderInfo = db
      .prepare(
        `INSERT INTO orders
        (user_id, total, customer_name, customer_phone, city, district, address_line, notes, payment_method, payment_note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        session.userId,
        total,
        customer_name,
        customer_phone,
        city,
        district || null,
        address_line,
        notes || null,
        method,
        method === 'bank_transfer' ? payment_note || null : null
      );

    const orderId = orderInfo.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
      VALUES (?, ?, ?, ?, ?)`
    );
    for (const it of resolvedItems) {
      insertItem.run(orderId, it.product_id, it.product_name, it.unit_price, it.quantity);
    }

    return NextResponse.json({ orderId, total, paymentMethod: method }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'حصل خطأ أثناء إنشاء الطلب' }, { status: 500 });
  }
}