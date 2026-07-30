import db from '@/lib/db';
import AdminShell from '@/components/AdminShell';
import OrderStatusUpdater from '@/components/OrderStatusUpdater';
import PaymentStatusUpdater from '@/components/PaymentStatusUpdater';

const PAYMENT_METHOD_LABELS = {
  cod: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
};

export default async function AdminOrderDetail({ params }) {
  const { id } = await params;

  const order = db
    .prepare(
      `SELECT orders.*, users.name AS user_name, users.email AS user_email, users.phone AS user_phone
      FROM orders JOIN users ON users.id = orders.user_id
      WHERE orders.id = ?`
    )
    .get(id);

  if (!order) {
    return (
      <AdminShell title="الطلب غير موجود">
        <p className="text-ink-700/60">الطلب رقم #{id} غير موجود.</p>
      </AdminShell>
    );
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

  return (
    <AdminShell title={`تفاصيل الطلب #${order.id}`}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-water-400/15 p-6">
            <h2 className="font-semibold text-ink-900 mb-4">المنتجات المطلوبة</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-ink-700/50 border-b border-water-400/10">
                  <th className="py-2 font-medium">المنتج</th>
                  <th className="py-2 font-medium">السعر</th>
                  <th className="py-2 font-medium">الكمية</th>
                  <th className="py-2 font-medium">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-water-400/5 last:border-0">
                    <td className="py-3">{it.product_name}</td>
                    <td className="py-3">{it.unit_price.toFixed(0)} ر.س</td>
                    <td className="py-3">{it.quantity}</td>
                    <td className="py-3 font-semibold">{(it.unit_price * it.quantity).toFixed(0)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between pt-4 mt-4 border-t border-water-400/10">
              <span className="font-semibold text-ink-700">الإجمالى</span>
              <span className="font-display font-bold text-xl text-water-700">{order.total.toFixed(0)} ر.س</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-water-400/15 p-6">
            <h2 className="font-semibold text-ink-900 mb-4">موقع التوصيل</h2>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-700/40 mb-1">المدينة</dt>
                <dd className="font-medium text-ink-900">{order.city}</dd>
              </div>
              <div>
                <dt className="text-ink-700/40 mb-1">الحي</dt>
                <dd className="font-medium text-ink-900">{order.district || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-700/40 mb-1">العنوان بالتفصيل</dt>
                <dd className="font-medium text-ink-900">{order.address_line}</dd>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-700/40 mb-1">ملاحظات</dt>
                  <dd className="font-medium text-ink-900">{order.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-water-400/15 p-6">
            <h2 className="font-semibold text-ink-900 mb-4">حالة الطلب</h2>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>

          <div className="bg-white rounded-2xl border border-water-400/15 p-6">
            <h2 className="font-semibold text-ink-900 mb-4">بيانات العميل</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-700/40 mb-1">الاسم</dt>
                <dd className="font-medium text-ink-900">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-ink-700/40 mb-1">البريد الإلكتروني</dt>
                <dd className="font-medium text-ink-900">{order.user_email}</dd>
              </div>
              <div>
                <dt className="text-ink-700/40 mb-1">رقم الجوال</dt>
                <dd className="font-medium text-ink-900" dir="ltr">{order.customer_phone}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-water-400/15 p-6">
            <h2 className="font-semibold text-ink-900 mb-4">الدفع</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-700/40 mb-1">طريقة الدفع</dt>
                <dd className="font-medium text-ink-900">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</dd>
              </div>
              {order.payment_note && (
                <div>
                  <dt className="text-ink-700/40 mb-1">رقم عملية التحويل</dt>
                  <dd className="font-medium text-ink-900 font-mono">{order.payment_note}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-700/40 mb-1.5">حالة الدفع</dt>
                <dd><PaymentStatusUpdater orderId={order.id} currentStatus={order.payment_status} /></dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}