import DropletIcon from './DropletIcon';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white/80">
      <div className="container-page py-14 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold text-white mb-3">
            <DropletIcon className="w-6 h-6 text-water-400" />
            Tasneem Ain
          </div>
          <p className="text-sm leading-relaxed text-white/60">
            مياه معدنية طبيعية نقية، من الينبوع إلى بيتك، بجودة موثوقة في جميع أنحاء المملكة العربية السعودية.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="#products" className="hover:text-water-400 transition-colors">المنتجات</a></li>
            <li><a href="#about" className="hover:text-water-400 transition-colors">من نحن</a></li>
            <li><a href="/login" className="hover:text-water-400 transition-colors">تسجيل الدخول</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">تواصل معنا</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>الرياض، المملكة العربية السعودية</li>
            <li dir="ltr" className="text-right">+966 5X XXX XXXX</li>
            <li>support@salsabil.sa</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Tasneem Ain للمياه المعدنية. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}