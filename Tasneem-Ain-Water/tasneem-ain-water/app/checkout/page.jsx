'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const SAUDI_CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'تبوك', 'أبها', 'حائل'];

const PAYMENT_METHODS = [
  { id: 'cod', label: 'الدفع عند الاستلام', desc: 'ادفعي كاش أو بالشبكة للمندوب وقت التوصيل', icon: '💵' },
  { id: 'bank_transfer', label: 'تحويل بنكي', desc: 'حوّلي المبلغ يدويًا وابعتي رقم العملية', icon: '🏦' },
];

export default function CheckoutPage() {
  const { items, totalPrice, hydrated, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    city: SAUDI_CITIES[0],
    district: '',
    address_line: '',
    notes: '',
    payment_note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, customer_name: f.customer_name || user.name, customer_phone: f.customer_phone || user.phone || '' }));
    }
  }, [user]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          ...form,
          payment_method: paymentMethod,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      clearCart();
      router.push(`/checkout/success?orderId=${orderData.orderId}&method=${paymentMethod}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container-page py-24 text-center">
          <p className="text-ink-700/60">سلتك فاضية، مافيش حاجة تكمّلي بيها الطلب.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container-page py-16 max-w-xl mx-auto min-h-[60vh]">
        <h1 className="font-display text-3xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-water-400/15 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">الاسم بالكامل</label>
            <input
              required
              value={form.customer_name}
              onChange={(e) => update('customer_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">رقم الجوال</label>
            <input
              required
              value={form.customer_phone}
              onChange={(e) => update('customer_phone', e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">المدينة</label>
              <select
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none bg-white"
              >
                {SAUDI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">الحي</label>
              <input
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">العنوان بالتفصيل</label>
            <textarea
              required
              rows={2}
              value={form.address_line}
              onChange={(e) => update('address_line', e.target.value)}
              placeholder="اسم الشارع، رقم المبنى، أقرب معلم..."
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">ملاحظات (اختياري)</label>
            <input
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>

          <div className="pt-2 border-t border-water-400/10">
            <label className="block text-sm font-semibold text-ink-700 mb-3">طريقة الدفع</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === m.id ? 'border-water-500 bg-water-50' : 'border-water-400/20 hover:border-water-400/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-water-600"
                  />
                  <span className="text-xl">{m.icon}</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink-900 text-sm">{m.label}</span>
                    <span className="block text-xs text-ink-700/50">{m.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  رقم عملية التحويل (لو حوّلتي فعلاً)
                </label>
                <input
                  value={form.payment_note}
                  onChange={(e) => update('payment_note', e.target.value)}
                  placeholder="اختياري، تقدري تبعتيه بعدين"
                  className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-water-400/10">
            <span className="font-semibold text-ink-700">الإجمالي</span>
            <span className="font-display text-xl font-bold text-water-700">{totalPrice.toFixed(0)} ر.س</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'جارِ التجهيز...' : 'تأكيد الطلب'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
