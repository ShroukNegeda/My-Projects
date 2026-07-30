import Link from 'next/link';
import db from '@/lib/db';
import AdminShell from '@/components/AdminShell';

export default function AdminDashboard() {
  const totalOrders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE payment_status = 'paid'").get().s;
  const totalProducts = db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1').get().c;
  const totalCustomers = db.prepare('SELECT COUNT(*) AS c FROM users WHERE is_admin = 0').get().c;

  const recentOrders = db
    .prepare(
      `SELECT orders.*, users.name AS user_name
      FROM orders JOIN users ON users.id = orders.user_id
      ORDER BY orders.created_at DESC LIMIT 6`
    )
    .all();

  const stats = [
    { label: 'إجمالي الطلبات', value: totalOrders },
    { label: 'طلبات قيد الانتظار', value: pendingOrders },
    { label: 'الإيرادات المحصّلة', value: `${revenue.toFixed(0)} ر.س` },
    { label: 'المنتجات النشطة', value: totalProducts },
    { label: 'عدد العملاء', value: totalCustomers },
  ];

  return (
    <AdminShell title="نظرة عامة">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-water-400/15 p-5">
            <p className="text-sm text-ink-700/50 mb-1">{s.label}</p>
            <p className="font-display text-2xl font-bold text-water-700">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-water-400/15 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-water-400/10">
          <h2 className="font-semibold text-ink-900">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="text-sm text-water-700 font-semibold">عرض الكل</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-ink-700/50 border-b border-water-400/10">
              <th className="px-6 py-3 font-medium">رقم الطلب</th>
              <th className="px-6 py-3 font-medium">العميل</th>
              <th className="px-6 py-3 font-medium">المدينة</th>
              <th className="px-6 py-3 font-medium">الإجمالي</th>
              <th className="px-6 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-water-400/5 last:border-0 hover:bg-laban-50">
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-water-700 font-semibold">#{o.id}</Link>
                </td>
                <td className="px-6 py-3">{o.user_name}</td>
                <td className="px-6 py-3">{o.city}</td>
                <td className="px-6 py-3">{o.total.toFixed(0)} ر.س</td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-water-100 text-water-700 font-semibold">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-700/40">لا توجد طلبات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}