'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BANK_DETAILS } from '@/lib/siteConfig';

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
        <p className="text-6xl mb-4">✅</p>
        <h1 className="font-display text-2xl font-bold mb-2">تم استلام طلبك رقم #{orderId}</h1>

        {method === 'cod' && (
          <p className="text-ink-700/60 mb-8">
            طلبك قيد التجهيز الآن، دفع المبلغ كاش أو بالشبكة للمندوب وقت التوصيل.
          </p>
        )}

        {method === 'bank_transfer' && (
          <>
            <p className="text-ink-700/60 mb-6">
              تحوبل المبلغ على الحساب البنكي التالي، وطلبك هيتأكد فور استلام التحويل.
            </p>
            <div className="bg-white rounded-2xl border border-water-400/15 p-6 text-right text-sm mb-8 space-y-2">
              <p><span className="text-ink-700/50">اسم البنك:</span> <span className="font-semibold">{BANK_DETAILS.bankName}</span></p>
              <p><span className="text-ink-700/50">اسم الحساب:</span> <span className="font-semibold">{BANK_DETAILS.accountName}</span></p>
              <p dir="ltr" className="text-right"><span className="text-ink-700/50 ml-1">IBAN:</span> <span className="font-semibold font-mono">{BANK_DETAILS.iban}</span></p>
            </div>
            <p className="text-xs text-ink-700/40 mb-8">
              بعد عمليه التحويل نرجوا ارسال رقم العملية لنا عبر واتساب أو من صفحة "طلباتي" للتاكد من الطلب .
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