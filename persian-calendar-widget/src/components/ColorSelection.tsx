import Image from 'next/image';

export default function ColorSelection() {
  return (
    <section className="text-center py-16 space-y-4">
      <h2 className="text-2xl font-black">انتخاب با شماست</h2>
      <p className="text-gray-600">این تقویم‌ها با ۲ رنگ تیره و خاکستری روشن آماده استفاده هستند.</p>

      <div className="flex justify-center items-end gap-12 mt-12 flex-wrap">

        <div className="flex flex-col items-center">
          <Image src="/images/today-grey.png" alt="grey calendar" width={140} height={140} />
          <p className="mt-2">خاکستری</p>
        </div>

        <div className="flex flex-col items-center">
          <Image src="/images/today-dark.png" alt="dark calendar" width={140} height={140} />
          <p className="mt-2">تیره</p>
        </div>

      </div>
    </section>
  );
}
