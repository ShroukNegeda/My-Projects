'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BANK_DETAILS } from '@/lib/siteConfig';
import { CheckCircle, Banknote, Building2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const method = params.get('method');

  return (
    <>
      <Navbar />
      <main className="container-page py-20 max-w-lg mx-auto text-center min-h-[50vh]">
        <CheckCircle className="w-16 h-16 text-water-600 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">تم استلام طلبك رقم #{orderId}</h1>

        {method === 'cod' && (
          <div className="flex items-center justify-center gap-2 text-ink-700/60 mb-8">
            <Banknote className="w-5 h-5" />
            <p>طلبك قيد التجهيز، يمكنك الدفع نقداً للمندوب عند استلام الطلب.</p>
          </div>
        )}

        {method === 'network' && (
          <div className="flex items-center justify-center gap-2 text-ink-700/60 mb-8">
            <Banknote className="w-5 h-5" />
            <p>طلبك قيد التجهيز، يمكنك الدفع بالبطاقة البنكية للمندوب عند استلام الطلب.</p>
          </div>
        )}

        {method === 'bank_transfer' && (
          <>
            <p className="text-ink-700/60 mb-6">
              شكراً لك، تم استلام بيانات التحويل وسيتم مراجعتها وتأكيد طلبك في أقرب وقت.
            </p>
            <p className="text-sm text-ink-700/50 mb-8">
              يمكنك متابعة حالة طلبك من صفحة "طلباتى".
            </p>
          </>
        )}

        <Link href="/account" className="px-6 py-3 rounded-full bg-water-600 text-white font-semibold">
          عرض طلباتى
        </Link>
      </main>
      <Footer />
    </>
  );
}