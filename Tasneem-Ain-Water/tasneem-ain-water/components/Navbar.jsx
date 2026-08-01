'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { totalItems, clearCart } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-laban-50/90 backdrop-blur border-b border-water-400/20">
      <nav className="container-page flex items-center justify-between h-20">
        <Link href="/">
          <Image src="/Logo.png" alt="Tasneem Ain" width={280} height={112} className="h-28 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-ink-700 font-medium">
          <Link href="/#products" className="hover:text-water-600 transition-colors">
            المنتجات
          </Link>
          <Link href="/#about" className="hover:text-water-600 transition-colors">
            من نحن
          </Link>
          {user && (
            <Link href="/account" className="hover:text-water-600 transition-colors">
              طلباتى
            </Link>
          )}
          {user?.is_admin && (
            <Link href="/admin" className="hover:text-water-600 transition-colors">
              لوحة التحكم
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border border-water-400/30 hover:border-water-500 transition-colors" aria-label="السلة">
            <ShoppingCart className="w-5 h-5 text-water-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 bg-water-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <button onClick={() => { clearCart(); logout(); }} className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold text-water-700 hover:bg-water-100 transition-colors">
              خروج
            </button>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-water-600 text-white hover:bg-water-700 transition-colors">
              تسجيل الدخول
            </Link>
          )}

          <button className="md:hidden w-10 h-10 flex items-center justify-center" onClick={() => setOpen((o) => !o)} aria-label="القائمة">
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden container-page pb-4 flex flex-col gap-3 text-ink-700 font-medium">
          <Link href="/#products" onClick={() => setOpen(false)}>المنتجات</Link>
          <Link href="/#about" onClick={() => setOpen(false)}>من نحن</Link>
          {user && <Link href="/account" onClick={() => setOpen(false)}>طلباتى</Link>}
          {user?.is_admin && <Link href="/admin" onClick={() => setOpen(false)}>لوحة التحكم</Link>}
          {user ? (
            <button onClick={() => { clearCart(); logout(); }} className="text-right text-water-700">خروج</button>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="text-water-700">تسجيل الدخول</Link>
          )}
        </div>
      )}
    </header>
  );
}