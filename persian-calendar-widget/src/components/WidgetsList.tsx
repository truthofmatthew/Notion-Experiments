import Image from 'next/image';

const calendars = [
  {
    title: "تقویم عریض",
    images: [
      { src: "/images/wide-dark.png", alt: "wide dark", link: "/calendar/wide?dark" },
      { src: "/images/wide-grey.png", alt: "wide grey", link: "/calendar/wide?grey" },
    ],
  },
  {
    title: "تقویم ماهانه + جزئیات روزها",
    images: [
      { src: "/images/full-dark.png", alt: "full dark", link: "/calendar/full?dark" },
      { src: "/images/full-grey.png", alt: "full grey", link: "/calendar/full?grey" },
    ],
  },
  {
    title: "تقویم جمع‌وجور برای گوشه‌ صفحه",
    images: [
      { src: "/images/small-dark.png", alt: "small dark", link: "/calendar/small?dark" },
      { src: "/images/small-grey.png", alt: "small grey", link: "/calendar/small?grey" },
    ],
  },
  {
    title: "فقط تاریخ امروز، ساده و مرتب",
    images: [
      { src: "/images/today-dark.png", alt: "today dark", link: "/calendar/today?dark" },
      { src: "/images/today-grey.png", alt: "today grey", link: "/calendar/today?grey" },
    ],
  },
];

import { useState } from 'react';

function CopyButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="relative border rounded px-4 py-1 text-sm hover:bg-gray-100 active:scale-95 transition"
    >
      {copied && (
        <span className="absolute -top-6 right-1/2 translate-x-1/2 bg-black text-white text-xs rounded px-2 py-0.5">
          کپی شد
        </span>
      )}
      کپی لینک
    </button>
  );
}


export default function WidgetsList() {
  return (
    

    <section id="widgets" className="space-y-16 py-16 text-center">
      {calendars.map((cal, i) => (
        <div key={i}>
          <h3 className="text-xl font-bold mb-6">{cal.title}</h3>
          <div className="flex justify-center gap-8 flex-wrap">
            {cal.images.map((img, j) => (
              <div key={j} className="space-y-2">
                <Image src={img.src} alt={img.alt} width={280} height={280} />
                <CopyButton link={img.link} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
