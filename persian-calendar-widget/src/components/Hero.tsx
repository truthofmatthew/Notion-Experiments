import localFont from 'next/font/local';

const vazirBlack = localFont({ src: '../fonts/Vazirmatn-Black.woff2' });

export default function Hero() {
  return (
    <section className={`${vazirBlack.className} text-center py-16`}>
      <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mb-4">آزمایشی</span>
      <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">تقویم فارسیِ ساده و کاربردی برای نُوشن</h1>
      <a href="#widgets" className="bg-blue-600 text-white py-2 px-6 rounded-xl hover:opacity-90 transition inline-block">دریافت تقویم</a>
      </section>
  );
}
