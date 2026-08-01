'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refresh();
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container-page py-16 max-w-md mx-auto">
        <h1 className="font-display text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-water-400/15 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">الاسم بالكامل</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">البريد الإلكترونى</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">رقم الجوال</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+966 5X XXX XXXX" dir="ltr" className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none text-right"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">كلمة المرور</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-water-400/25 focus:border-water-500 outline-none"/>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors disabled:opacity-60">
            {loading ? 'جارِ الإنشاء...' : 'إنشاء الحساب'}
          </button>
          <p className="text-center text-sm text-ink-700/60">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-water-700 font-semibold">تسجيل الدخول</Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}