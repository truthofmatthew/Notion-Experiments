import Image from 'next/image';

export default function AboutMe() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-16 text-center md:text-right">
      <div className="space-y-4 max-w-lg leading-loose">
        <p>من متیو تروث‌ام، بیش از ۵۰۰۰ روزه که با طراحی و ساخت محصول زندگی می‌کنم.</p>
        <p>این تقویم رو اول برای تیمی ساختم که کنارشون کار می‌کردم، چون جاش خالی بود.</p>
        <p>بعد دیدم خیلی‌های دیگه هم لازمش دارن.</p>
        <p>شبیه‌ترش کردم به تقویمی که دوستش داشتم، مثل «روزگار»</p>
        <p>امیدوارم به کارت بیاد و کنارت بمونه.</p>
      </div>
      <div>
        <Image src="/images/mt.png" alt="me" width={266} height={399} />
      </div>
    </section>
  );
}
