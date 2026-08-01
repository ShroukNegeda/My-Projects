import WaveDivider from './WaveDivider';

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-water-700 text-white overflow-hidden mt-8">
      <WaveDivider className="absolute -top-[1px] left-0 text-water-700 rotate-180" />
      <div className="container-page py-24 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-water-200 font-semibold text-sm">قصتنا</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 leading-tight">
            من ينابيع المملكة،
            <br />
            إلى كل بيت سعودى
          </h2>
          <p className="mt-5 text-water-50/80 leading-relaxed">
            بدأت Tasneem Ain من إيمان بسيط: إن أنقى مياه تستحق تصل لبيتك مثل ما هي، بدون أي إضافات. مياهنا
            تُستخرج من مصادر معدنية طبيعية داخل المملكة، وتُعبأ بمعايير جودة صارمة، وتوصل لباب بيتك
            و توفر توصيل سريعة تغطى أغلب مدن المملكة.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['+50', 'ألف عميل راضٍ'],
            ['+20', 'مدينة نوصّل لها'],
            ['24', 'ساعة توصيل سريع'],
            ['100%', 'مصدر طبيعي'],
          ].map(([num, label]) => (
            <div key={label} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
              <p className="font-display text-3xl font-bold">{num}</p>
              <p className="text-sm text-water-50/70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}