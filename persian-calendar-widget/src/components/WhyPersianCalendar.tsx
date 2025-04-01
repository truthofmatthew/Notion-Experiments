import Image from 'next/image';

export default function WhyPersianCalendar() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-16 gap-8">
      <div className="text-right space-y-4 max-w-lg">
        <h2 className="text-2xl font-black leading-relaxed">تقویمی دم‌دست، شیک و کاملاً فارسی، همیشه توی صفحه‌هات</h2>
        <h3 className="font-bold text-lg">چرا تقویم فارسی؟</h3>
        <p>نُوشِن تقویم فارسی ندارد. این ویجت‌ها دقیقاً برای همین مشکل ساخته شده‌اند.</p>
        <p>ساده، کاربردی و هماهنگ با حال و هوای نُوشِن.</p>
      </div>
      <div>
        <Image src="/images/double_calendar.png" alt="persian calendar example" width={366} height={366} />
      </div>
    </section>
  );
}
