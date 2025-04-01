import Image from 'next/image';

export default function ColorSelection() {
  return (
    <section className="text-center py-16 space-y-4">
      <h2 className="text-2xl font-black">انتخاب با شماست</h2>
      <p className="text-gray-600">این تقویم‌ها با ۲ رنگ تیره و خاکستری روشن آماده استفاده هستند.</p>
      <div className="flex justify-center items-center gap-8 mt-8 flex-wrap">
        <div className="relative">
          <Image src="/images/left_arrow.png" alt="left arrow" width={50} height={50} className="absolute -left-12 top-1/2 transform -translate-y-1/2" />
          <p className="mb-2">خاکستری</p>
          <Image src="/images/today-grey.png" alt="grey calendar" width={280} height={280} />
        </div>
        <div className="relative">
          <Image src="/images/right_arrow.png" alt="right arrow" width={50} height={50} className="absolute -right-12 top-1/2 transform -translate-y-1/2" />
          <p className="mb-2">تیره</p>
          <Image src="/images/today-dark.png" alt="dark calendar" width={280} height={280} />
        </div>
      </div>
    </section>
  );
}
