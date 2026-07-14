'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Component from './PendingScreen';

export default function Page() {
  const router = useRouter();
  const app = useApp();
  const setPage = (route) => {
    const map = {'landing':'/landing','events':'/events','login':'/login','signup':'/signup','admin-dashboard':'/admin-dashboard'};
    router.push(map[route] || `/${route}`);
  };
  return <Component {...app} setPage={setPage} />;
}
