"use client";
import { useState } from "react";

export default function Feedback() {
  const [form, setForm] = useState({ message: "", name: "", email: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
    setForm({ message: "", name: "", email: "" });
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-2xl font-black">نسخه آزمایشی هستیم 🚧</h2>
      <p className="text-gray-700">اگه نظری داری، خیلی خوشحال می‌شم بشنوم.</p>

      {sent ? (
        <p className="text-green-600 font-bold">مرسی! نظرت ثبت شد 🌟</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <textarea
            required
            name="message"
            className="w-full p-3 border rounded"
            placeholder="نظرتو اینجا بنویس و اگه دوست داری اسم و ایمیلتم بگو که در ارتباط باشیم..."
            value={form.message}
            onChange={handleChange}
          />
          <input
            name="name"
            className="w-full p-3 border rounded"
            placeholder="اسم (اختیاری)"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            className="w-full p-3 border rounded"
            placeholder="ایمیل (اختیاری)"
            value={form.email}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-[#ea4e43] text-white font-bold py-2 px-6 rounded-xl hover:opacity-90 transition w-full"
          >
            ارسال بازخورد ✉️
          </button>
        </form>
      )}
    </section>
  );
}
