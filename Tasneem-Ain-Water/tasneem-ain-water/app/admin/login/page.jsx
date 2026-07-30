'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DropletIcon from '@/components/DropletIcon';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.user.is_admin) throw new Error('ليس لديك صلاحية الوصول للوحة التحكم');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-900 px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-white mb-8">
          <DropletIcon className="w-7 h-7 text-water-400" />
          Tasneem Ain — لوحة التحكم
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'جارِ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </main>
  );
}