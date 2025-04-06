import localFont from 'next/font/local';

const vazirBlack = localFont({ src: '../fonts/Vazirmatn-Black.woff2' });

export default function Hero() {
    return (
<section className={`${vazirBlack.className} relative text-center py-16 max-w-2xl mx-auto px-4`}>
<div className="w-full text-right mb-2">
  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">آزمایشی</span>
</div>


<h1 className="text-4xl md:text-4xl font-black leading-relaxed md:leading-tight mb-6">
  تقویم فارسیِ ساده و <span className="block md:inline">کاربردی برای نُوشن</span>
</h1>


  <a href="#widgets" className="bg-blue-600 text-white py-2 px-6 rounded-xl hover:opacity-90 transition inline-block">دریافت تقویم</a>
</section>


    );
  }
  