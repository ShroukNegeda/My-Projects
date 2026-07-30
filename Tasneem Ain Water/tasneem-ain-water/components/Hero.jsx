import Link from 'next/link';
import WaveDivider from './WaveDivider';
import DropletIcon from './DropletIcon';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-laban-100 to-laban-50 overflow-hidden">
      <div className="container-page grid md:grid-cols-2 gap-12 items-center pt-16 pb-28 md:pt-20 md:pb-36">
        <div>
          <span className="inline-flex items-center gap-2 text-water-700 bg-white/70 border border-water-400/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <DropletIcon className="w-4 h-4" /> من قلب المملكة العربية السعودية
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink-900 leading-[1.15]">
            نقاء الينبوع،
            <br />
            <span className="text-water-600">في كل رشفة</span>
          </h1>
          <p className="mt-6 text-lg text-ink-700/80 max-w-md leading-relaxed">
            مياه Tasneem Ain المعدنية الطبيعية، مُعبأة عند المصدر ومُوصّلة لباب بيتك في نفس اليوم بجميع مناطق المملكة.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#products"
              className="px-7 py-3.5 rounded-full bg-water-600 text-white font-semibold hover:bg-water-700 transition-colors shadow-lg shadow-water-600/20"
            >
              اطلب الآن
            </Link>
            <Link
              href="#about"
              className="px-7 py-3.5 rounded-full border border-water-500/40 text-water-700 font-semibold hover:bg-white transition-colors"
            >
              تعرف على القصة
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-56 md:w-64 aspect-[2/5] animate-float">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/40 to-water-400/30 backdrop-blur-sm border border-white/60 shadow-2xl shadow-water-600/20" />
            <div className="absolute inset-x-6 top-8 bottom-8 rounded-[1.75rem] bg-gradient-to-b from-water-400/40 to-water-600/50 border border-white/40 flex items-center justify-center">
              <div className="text-center text-white">
                <DropletIcon className="w-10 h-10 mx-auto mb-2 opacity-90" />
                <p className="font-display text-xl font-bold tracking-wide">Tasneem Ain</p>
              </div>
            </div>
          </div>
          <div className="absolute -z-10 w-72 h-72 rounded-full bg-water-400/20 blur-3xl" />
        </div>
      </div>

      <WaveDivider className="absolute bottom-0 left-0 text-laban-50" />
    </section>
  );
}