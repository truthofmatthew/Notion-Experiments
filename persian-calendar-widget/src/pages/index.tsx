import { useState } from "react";
import { useRouter } from "next/router";
import localFont from "next/font/local";

const vazir = localFont({ src: "../fonts/Vazirmatn-Regular.woff2" });
const vazirBold = localFont({ src: "../fonts/Vazirmatn-Bold.woff2" });

const calendars = [
  { name: "Today Dark", url: "/calendar/today?dark" },
  { name: "Today Grey", url: "/calendar/today?grey" },
  { name: "Small Dark", url: "/calendar/small?dark" },
  { name: "Small Grey", url: "/calendar/small?grey" },
  { name: "Wide Dark", url: "/calendar/wide?dark" },
  { name: "Wide Grey", url: "/calendar/wide?grey" },
  { name: "Full Dark", url: "/calendar/full?dark" },
  { name: "Full Grey", url: "/calendar/full?grey" }
];

export default function Index() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (url: string) => {
    navigator.clipboard.writeText(location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`${vazir.className} max-w-3xl mx-auto py-10 px-4`}>
      <h1 className="text-3xl font-bold mb-2 text-center">Persian Calendar for Notion</h1>
      <p className="text-center text-gray-600 mb-10">Modern, Minimal, and Fully Customizable Persian Calendar Widgets for Notion Users</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Mission</h2>
        <p className="text-gray-600">We bring the beauty of the Persian calendar to Notion. Different styles, simple setup, and always free.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Features</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-600">
          <li>Fully responsive widgets</li>
          <li>Dark and Grey themes</li>
          <li>Simple copy & embed into Notion</li>
          <li>Includes Today, Small, Wide, and Full Calendar versions</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-5">Previews & Links</h2>
        <div className="grid grid-cols-2 gap-6">
          {calendars.map((cal, i) => (
            <div key={i} className="border rounded-xl p-2 flex flex-col items-center">
              <iframe src={cal.url} className="w-full rounded-xl border h-40" />
              <button
                onClick={() => copy(cal.url)}
                className="mt-2 text-[12px] px-3 py-1 rounded bg-gray-100 border hover:bg-gray-200"
              >
                {copied === cal.url ? "Copied!" : "Copy URL"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 text-[13px] text-gray-500 text-center">
        Simply copy the widget link and paste it into your Notion page as an Embed block.
      </section>

      <footer className="mt-6 text-[11px] text-gray-400 text-center">
        Made with ❤️ for Notion users — Persian Calendar Project
      </footer>
    </div>
  );
}
