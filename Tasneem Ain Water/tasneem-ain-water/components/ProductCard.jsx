'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-water-400/15 hover:shadow-xl hover:shadow-water-600/10 transition-shadow duration-300 flex flex-col">
      <div className="aspect-square bg-laban-100 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-water-400 text-5xl">💧</div>
        )}
        <span className="absolute top-3 right-3 bg-white/90 text-water-700 text-xs font-semibold px-3 py-1 rounded-full">
          {product.size_label}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg text-ink-900">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-ink-700/60 mt-1 mb-4 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display font-bold text-xl text-water-700">{product.price} ر.س</span>

          <div className="flex items-center gap-1 bg-laban-100 rounded-full">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-water-700 hover:bg-white transition-colors"
              aria-label="إنقاص الكمية"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold text-ink-900">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-water-700 hover:bg-white transition-colors"
              aria-label="زيادة الكمية"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`mt-4 w-full py-2.5 rounded-full font-semibold transition-colors ${
            added ? 'bg-emerald-500 text-white' : 'bg-water-600 text-white hover:bg-water-700'
          }`}
        >
          {added ? 'تمت الإضافة ✓' : 'أضيف للسلة'}
        </button>
      </div>
    </div>
  );
}