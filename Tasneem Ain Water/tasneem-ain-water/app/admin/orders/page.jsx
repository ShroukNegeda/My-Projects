import Link from 'next/link';
import db from '@/lib/db';
import AdminShell from '@/components/AdminShell';

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const PAYMENT_METHOD_LABELS = {
  cod: 'عند الاستلام',
  bank_transfer: 'تحويل بنكي',
};

export default function AdminOrdersPage() {
  const orders = db
    .prepare(
      `SELECT orders.*, users.name AS user_name, users.email AS user_email
      FROM orders JOIN users ON users.id = orders.user_id
      ORDER BY orders.created_at DESC`
    )
    .all();

  return (
    <AdminShell title="الطلبات">
      <div className="bg-white rounded-2xl border border-water-400/15 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-right text-ink-700/50 border-b border-water-400/10">
              <th className="px-6 py-3 font-medium">رقم الطلب</th>
              <th className="px-6 py-3 font-medium">العميل</th>
              <th className="px-6 py-3 font-medium">الجوال</th>
              <th className="px-6 py-3 font-medium">الموقع</th>
              <th className="px-6 py-3 font-medium">الإجمالي</th>
              <th className="px-6 py-3 font-medium">طريقة الدفع</th>
              <th className="px-6 py-3 font-medium">الدفع</th>
              <th className="px-6 py-3 font-medium">الحالة</th>
              <th className="px-6 py-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-water-400/5 last:border-0 hover:bg-laban-50">
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-water-700 font-semibold">#{o.id}</Link>
                </td>
                <td className="px-6 py-3">
                  <p className="font-medium text-ink-900">{o.user_name}</p>
                  <p className="text-xs text-ink-700/40">{o.user_email}</p>
                </td>
                <td className="px-6 py-3" dir="ltr">{o.customer_phone}</td>
                <td className="px-6 py-3">{o.city}{o.district ? ` — ${o.district}` : ''}</td>
                <td className="px-6 py-3 font-semibold">{o.total.toFixed(0)} ر.س</td>
                <td className="px-6 py-3 text-ink-700/60">{PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      o.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : o.payment_status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {o.payment_status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-water-100 text-water-700 font-semibold">
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-ink-700/50">
                  {new Date(o.created_at).toLocaleDateString('ar-SA')}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-8 text-center text-ink-700/40">لا توجد طلبات </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}