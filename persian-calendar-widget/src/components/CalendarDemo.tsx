import Image from 'next/image';

export default function CalendarDemo() {
  return (
    <section className="py-16">
    <div className="flex justify-center items-center gap-4 flex-wrap md:flex-nowrap relative max-w-3xl mx-auto">
      {/* arrow for mobile absolute */}
      <Image src="/images/arrow.png" alt="arrow" width={40} height={40}
        className="block md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
  
      <Image src="/images/yes_girl.png" alt="yes girl" width={268} height={328} className="order-2 md:order-1" />
      <Image src="/images/no_girl.png" alt="no girl" width={268} height={328} className="order-1 md:order-3" />
  
      {/* arrow for desktop normal */}
      <Image src="/images/arrow.png" alt="arrow" width={50} height={50} className="hidden md:block md:order-2 rotate-0" />
    </div>
  </section>
  
  );
}
