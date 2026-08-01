import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Tasneem Ain | مياه معدنية طبيعية',
  icons: { icon: '/Logo.png' },
  description: 'مياه معدنية طبيعية نقية، توصيل سريع لجميع مناطق المملكة العربية السعودية.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="font-body bg-laban-50 text-ink-900 antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}