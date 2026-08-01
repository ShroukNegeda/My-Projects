'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PackageOpen, Droplets, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const NAV = [
  { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'الطلبات', icon: PackageOpen },
  { href: '/admin/products', label: 'المنتجات', icon: Droplets },
];

export default function AdminShell({ title, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearCart } = useCart();

  async function logout() {
    clearCart();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-ink-900 text-white/80 shrink-0 flex flex-col p-6">
        <div className="mb-10 flex justify-center">
          <a href="/">
            <Image src="/Logoo.png" alt="Tasneem Ain" width={200} height={80} className="h-20 w-auto" />
          </a>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${ active ? 'bg-water-600 text-white' : 'hover:bg-white/5'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-20 flex items-center px-8 bg-white border-b border-water-400/15">
          <h1 className="font-display text-xl font-bold text-ink-900">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}