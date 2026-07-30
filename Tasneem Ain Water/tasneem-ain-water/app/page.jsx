import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import ProductsSection from '@/components/ProductsSection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProductsSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}