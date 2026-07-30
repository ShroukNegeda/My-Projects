const FEATURES = [
  { title: 'مصدر طبيعي 100%', desc: 'مياه معدنية من ينابيع طبيعية معتمدة داخل المملكة.' },
  { title: 'توصيل سريع', desc: 'توصيل لجميع المدن الرئيسية خلال نفس اليوم أو اليوم التالي.' },
  { title: 'جودة معتمدة', desc: 'مطابقة لمواصفات الهيئة السعودية للغذاء والدواء.' },
  { title: 'دفع آمن', desc: 'ادفع كاش عند التوصيل أو بالشبكه مع المندوب أو عبر التحويل على الحساب المذكور.' },
];

export default function TrustStrip() {
  return (
    <section className="container-page py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl p-6 border border-water-400/15 hover:border-water-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="font-display font-bold text-ink-900 mb-2">{f.title}</h3>
            <p className="text-sm text-ink-700/70 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}