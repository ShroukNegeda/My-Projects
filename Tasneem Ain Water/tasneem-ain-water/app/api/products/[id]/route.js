import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
  const { id } = await params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return NextResponse.json({ error: 'المنتج غير متاح' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const { id } = await params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'المنتج غير متاح' }, { status: 404 });

  const body = await req.json();
  const updated = {
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    category: body.category ?? existing.category,
    size_label: body.size_label ?? existing.size_label,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    image_url: body.image_url ?? existing.image_url,
    is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active,
  };

  db.prepare(
    `UPDATE products SET name=?, description=?, category=?, size_label=?, price=?, image_url=?, is_active=?
    WHERE id=?`
  ).run(
    updated.name,
    updated.description,
    updated.category,
    updated.size_label,
    updated.price,
    updated.image_url,
    updated.is_active,
    id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
  }

  const { id } = await params;
  db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}