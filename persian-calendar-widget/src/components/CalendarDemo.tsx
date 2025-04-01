import Image from 'next/image';

export default function CalendarDemo() {
  return (
    <section className="flex justify-center items-center gap-4 py-16 flex-wrap">
      <Image src="/images/no_girl.png" alt="no girl" width={268} height={328} />
      <Image src="/images/arrow.png" alt="arrow" width={50} height={50} />
      <Image src="/images/yes_girl.png" alt="yes girl" width={268} height={328} />
    </section>
  );
}
