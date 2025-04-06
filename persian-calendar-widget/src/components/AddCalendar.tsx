import Image from 'next/image';

export default function AddCalendar() {
  return (
<section className="py-16 space-y-6 relative max-w-2xl mx-auto">
<div className="flex flex-col items-center md:items-start md:text-right md:ml-[190px]">
    <h2 className="text-3xl font-black">تقویم رو همین حالا اضافه کن</h2>
    <a href="#widgets" className="bg-blue-600 text-white py-2 px-6 rounded-xl hover:opacity-90 transition inline-block mt-4">دریافت تقویم</a>
  </div>
  <div className="flex justify-end mt-8">
    <Image src="/images/demo_mobile_desktop.png" alt="calendar demo" width={1073} height={565} />
  </div>
</section>

  );
}
