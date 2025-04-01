import Image from 'next/image';

export default function AddCalendar() {
  return (
    <section className="text-center py-16 space-y-6">
      <h2 className="text-3xl font-black">تقویم رو همین حالا اضافه کن</h2>
      <a href="#widgets" className="bg-blue-600 text-white py-2 px-6 rounded-xl hover:opacity-90 transition inline-block">دریافت تقویم</a>
      <div className="flex justify-center mt-8">
        <Image src="/images/demo_mobile_desktop.png" alt="calendar demo" width={1147} height={565} />
      </div>
    </section>
  );
}
