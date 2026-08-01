'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = [
  ['pending', 'قيد الانتظار'],
  ['processing', 'قيد التجهيز'],
  ['shipped', 'تم الشحن'],
  ['delivered', 'تم التوصيل'],
  ['cancelled', 'ملغى'],
];

export default function OrderStatusUpdater({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(e) {
    const value = e.target.value;
    setStatus(value);
    setSaving(true);
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select value={status} onChange={handleChange} disabled={saving} className="px-4 py-2 rounded-xl border border-water-400/25 bg-white text-sm font-semibold text-water-700">
        {STATUSES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-ink-700/40">جارِ الحفظ...</span>}
    </div>
  );
}