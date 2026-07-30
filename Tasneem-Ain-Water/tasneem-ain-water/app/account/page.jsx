'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const PAYMENT_LABELS = {
  unpaid: 'لم يُدفع بعد',
  paid: 'تم الدفع',
  failed: 'فشل الدفع',
};

const PAYMENT_METHOD_LABELS = {
  cod: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
};

export default function AccountPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetch('/api/orders/mine')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container-page py-16 max-w-2xl mx-auto min-h-[60vh]">
        <h1 className="font-display text-3xl font-bold mb-8">طلباتي</h1>

        {orders === null ? (
          <p className="text-ink-700/60">جارِ التحميل...</p>
        ) : orders.length === 0 ? (
          <p className="text-ink-700/60">لا يوجد طلبات .</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-water-400/15 p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-ink-900">طلب #{o.id}</p>
                  <p className="text-sm text-ink-700/50">{new Date(o.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-water-100 text-water-700 font-semibold">
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {PAYMENT_LABELS[o.payment_status] || o.payment_status}
                  </span>
                </div>
                <ul className="text-sm text-ink-700/70 mb-3 space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.product_name} × {it.quantity}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink-700/40 mb-3">طريقة الدفع: {PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}</p>
                <div className="flex items-center justify-between pt-3 border-t border-water-400/10">
                  <span className="text-sm text-ink-700/50">{o.city} — {o.address_line}</span>
                  <span className="font-display font-bold text-water-700">{o.total.toFixed(0)} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}