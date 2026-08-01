'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartProvider } from '@/context/CartContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (user?.id) {
      localStorage.removeItem(`salsabil_cart_${user.id}`);
    }
    localStorage.removeItem('salsabil_cart_guest');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, logout }}>
      <CartProvider userId={user?.id}>{children}</CartProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth يجب اتستخدام  AuthProvider');
  return ctx;
}