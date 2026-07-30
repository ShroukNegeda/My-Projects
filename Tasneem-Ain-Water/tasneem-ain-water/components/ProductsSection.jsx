import db from '@/lib/db';
import ProductCard from './ProductCard';

export default function ProductsSection() {
  const products = db
    .prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC')
    .all()
    .map((p) => ({ ...p }));

  return (
    <section id="products" className="container-page py-8 md:py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-water-600 font-semibold text-sm">منتجاتنا</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mt-2">
          اختار ما يناسب بيتك
        </h2>
        <p className="text-ink-700/60 mt-3">من الكرتونة الصغيرة لقارورة الكولر، كل احتياجاتك من المياه في مكان واحد.</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-ink-700/60">لا توجد منتجات متاحة حاليًا.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}