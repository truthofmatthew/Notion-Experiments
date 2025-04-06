import localFont from 'next/font/local';
const vazirBlack = localFont({ src: '../fonts/Vazirmatn-Black.woff2' });

export default function EaseOfUse() {
    return (
<section className={`${vazirBlack.className} flex flex-col md:flex-row justify-between items-center py-16 gap-8 max-w-2xl mx-auto`}>
        
        <div className="text-center md:text-right space-y-2">
          <h2 className="text-3xl font-black">خیلی ساده</h2>
          <p className="text-gray-600">بدون دردسر، مستقیم بچسبون تو نُوشن</p>
        </div>
  
        <div className="flex flex-col md:flex-row gap-6 text-center">
          <div>
            <div className="text-5xl font-black">۱</div>
            <p className="font-regular text-gray-600">تقویمتو انتخاب کن</p>
          </div>
          <div>
            <div className="text-5xl font-black">۲</div>
            <p>لینک رو کپی کن</p>
          </div>
          <div>
            <div className="text-5xl font-black">۳</div>
            <p>با /embed توی نُوشِن بذارش</p>
          </div>
        </div>
  
      </section>
    );
  }
  