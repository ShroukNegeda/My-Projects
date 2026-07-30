'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';

const EMPTY_FORM = { name: '', description: '', category: 'bottles', size_label: '', price: '', image_url: '' };

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function load() {
    const res = await fetch('/api/products?all=1');
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({ name: p.name, price: p.price, size_label: p.size_label, is_active: !!p.is_active });
  }

  async function saveEdit(id) {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
  }

  async function deactivate(id) {
    if (!confirm('هل تحب اخفاء هذا المنتج من الموقع؟')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <AdminShell title="المنتجات">
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <form onSubmit={handleCreate} className="lg:col-span-1 bg-white rounded-2xl border border-water-400/15 p-6 space-y-3 h-fit">
          <h2 className="font-semibold text-ink-900 mb-1">إضافة منتج جديد</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <input
            required
            placeholder="اسم المنتج"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-sm"
          />
          <textarea
            placeholder="وصف مختصر"
            rows={2}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 outline-none text-sm bg-white"
          >
            <option value="bottles">كراتين مياه</option>
            <option value="gallons">قوارير</option>
          </select>
          <input
            required
            placeholder="الحجم (مثال: 24 × 200 مل)"
            value={form.size_label}
            onChange={(e) => update('size_label', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-sm"
          />
          <input
            required
            type="number"
            step="0.01"
            placeholder="السعر بالريال"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-sm"
          />
          <input
            placeholder="رابط صورة المنتج (اختياري)"
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'جارِ الإضافة...' : 'إضافة المنتج'}
          </button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-water-400/15 overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-ink-700/50 border-b border-water-400/10">
                <th className="px-5 py-3 font-medium">المنتج</th>
                <th className="px-5 py-3 font-medium">الحجم</th>
                <th className="px-5 py-3 font-medium">السعر</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products === null ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-700/40">جارِ التحميل...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-700/40">لا توجد منتجات</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-water-400/5 last:border-0">
                    {editingId === p.id ? (
                      <>
                        <td className="px-5 py-2">
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full px-2 py-1.5 rounded-lg border border-water-400/25 text-sm"
                          />
                        </td>
                        <td className="px-5 py-2">
                          <input
                            value={editForm.size_label}
                            onChange={(e) => setEditForm((f) => ({ ...f, size_label: e.target.value }))}
                            className="w-full px-2 py-1.5 rounded-lg border border-water-400/25 text-sm"
                          />
                        </td>
                        <td className="px-5 py-2">
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                            className="w-20 px-2 py-1.5 rounded-lg border border-water-400/25 text-sm"
                          />
                        </td>
                        <td className="px-5 py-2">
                          <label className="flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={editForm.is_active}
                              onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                            />
                            نشط
                          </label>
                        </td>
                        <td className="px-5 py-2 flex gap-2">
                          <button onClick={() => saveEdit(p.id)} className="text-water-700 font-semibold text-xs">حفظ</button>
                          <button onClick={() => setEditingId(null)} className="text-ink-700/40 text-xs">إلغاء</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 font-medium text-ink-900">{p.name}</td>
                        <td className="px-5 py-3 text-ink-700/60">{p.size_label}</td>
                        <td className="px-5 py-3 font-semibold">{p.price} ر.س</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.is_active ? 'نشط' : 'مخفي'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => startEdit(p)} className="text-water-700 text-xs font-semibold">تعديل</button>
                            <button onClick={() => deactivate(p.id)} className="text-red-500 text-xs font-semibold">إخفاء</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}