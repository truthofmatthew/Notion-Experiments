import { useState } from "react";

const faqs = [
  { q: "چطور ویجت رو به نُوشِن اضافه کنم؟", a: "لینک رو کپی کن و توی صفحه‌ات /embed بنویس، لینک رو بچسبون و تمام." },
  { q: "آیا با تم تیره و روشن کار می‌کنه؟", a: "بله! هر ویجت دو نسخه داره، تیره و خاکستری." },
  { q: "چطور می‌تونم تقویم رو شخصی‌سازی کنم؟", a: "فعلاً نسخه‌ها ثابتن، اما داریم روی تنظیمات شخصی‌سازی کار می‌کنیم." },
  { q: "آیا این ابزار رایگانه؟", a: "بله، رایگانه. ولی اگه دوست داشتی می‌تونی ازمون حمایت کنی." },
  { q: "چرا روزهای خاص یا تعطیلات نشون داده نمی‌شن؟", a: "فقط بعضی از ویجت‌ها شامل مناسبت‌ها هستن، حتماً توضیحات رو بخون." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">سوالات رایج</h2>
      {faqs.map((item, i) => (
        <div key={i} className="border-t py-3 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
          <div className="flex justify-between items-center">
            <span>{item.q}</span>
            <span>{open === i ? "-" : "+"}</span>
          </div>
          {open === i && <p className="mt-2 text-sm text-gray-600">{item.a}</p>}
        </div>
      ))}
    </section>
  );
}
