'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

function storageKey(userId) {
  return userId ? `salsabil_cart_${userId}` : 'salsabil_cart_guest';
}

export function CartProvider({ children, userId }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [currentKey, setCurrentKey] = useState(() => storageKey(userId));

  useEffect(() => {
    const key = storageKey(userId);
    setCurrentKey(key);
    try {
      const raw = localStorage.getItem(key);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(currentKey, JSON.stringify(items));
  }, [items, hydrated, currentKey]);

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          size_label: product.size_label,
          price: product.price,
          image_url: product.image_url,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product_id !== productId)
        : prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart يجب اتستخدام CartProvider');
  return ctx;
}