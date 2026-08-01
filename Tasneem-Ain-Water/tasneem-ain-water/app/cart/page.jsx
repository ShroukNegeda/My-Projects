'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Droplets, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, hydrated } = useCart();

  return (
    <>
      <Navbar />
      <main className="container-page py-16 max-w-3xl mx-auto min-h-[50vh]">
        <h1 className="font-display text-3xl font-bold mb-8">سلة المشتريات</h1>

        {!hydrated ? null : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-water-400/15">
            <ShoppingCart className="w-12 h-12 text-water-400 mx-auto mb-4" />
            <p className="text-ink-700/60 mb-6">السله فارغه </p>
            <Link href="/#products" className="px-6 py-3 rounded-full bg-water-600 text-white font-semibold">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-water-400/15 divide-y divide-water-400/10">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-4 p-5">
                  <div className="w-16 h-16 rounded-xl bg-laban-100 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Droplets className="w-8 h-8 text-water-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900">{item.name}</p>
                    <p className="text-sm text-ink-700/50">{item.size_label}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-laban-100 rounded-full">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-water-700 hover:bg-white">
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-water-700 hover:bg-white">
                      +
                    </button>
                  </div>
                  <p className="w-24 text-left font-display font-bold text-water-700">
                    {(item.price * item.quantity).toFixed(0)} ر.س
                  </p>
                  <button onClick={() => removeItem(item.product_id)} className="text-ink-700/40 hover:text-red-500 transition-colors" aria-label="حذف">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between bg-white rounded-2xl p-6 border border-water-400/15">
              <span className="font-semibold text-ink-700">الإجمالى</span>
              <span className="font-display text-2xl font-bold text-water-700">{totalPrice.toFixed(0)} ر.س</span>
            </div>

            <Link href="/checkout" className="mt-6 block text-center w-full py-3.5 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors">
              إتمام الطلب
            </Link>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}