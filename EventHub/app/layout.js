import { AppProvider } from '../context/AppContext';
import GlobalApiLoadingOverlay from '../components/GlobalApiLoadingOverlay';
import './globals.css';
import { Poppins } from "next/font/google";

export const metadata = {
  title: 'EventHub',
  description: 'Discover and manage events',
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/img/logo.jpg" />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        <AppProvider>
          {children}
          <GlobalApiLoadingOverlay />
        </AppProvider>
      </body>
    </html>
  );
}