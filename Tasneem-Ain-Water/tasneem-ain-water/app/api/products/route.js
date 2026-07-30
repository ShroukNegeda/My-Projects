import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get('all') === '1';

  const session = await getSession();
  const canSeeAll = includeInactive && session?.isAdmin;

  const products = canSeeAll
    ? db.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC').all();

  return NextResponse.json({ products });
}

export async function POST(req) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  try {
    const { name, description, category, size_label, price, image_url } = await req.json();

    if (!name || !size_label || !price) {
      return NextResponse.json({ error: 'من فضلك أدخل اسم المنتج والحجم والسعر' }, { status: 400 });
    }

    const info = db
      .prepare(
        `INSERT INTO products (name, description, category, size_label, price, image_url)
        VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        name.trim(),
        description || '',
        category || 'bottles',
        size_label.trim(),
        Number(price),
        image_url || null
      );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'حصل خطأ أثناء إضافة المنتج' }, { status: 500 });
  }
}