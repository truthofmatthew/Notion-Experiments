// full.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import localFont from "next/font/local";

const vazir = localFont({ src: "../../fonts/Vazirmatn-Regular.woff2" });
const vazirBold = localFont({ src: "../../fonts/Vazirmatn-Bold.woff2" });

type CalendarDay = {
  solar: { day: number; month: number; year: number; dayWeek: string };
  moon: { day: number; month: number; year: number };
  gregorian: { day: number; month: number; year: number; dayWeek: string | null };
  holiday: boolean;
  event: string[];
};

export default function Home() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("dark") !== null ? "dark" : "grey";

  const [data, setData] = useState<Record<string, CalendarDay> | null>(null);
  const [year, setYear] = useState<number>(1404);
  const [month, setMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const todayParts = new Intl.DateTimeFormat("fa-IR-u-ca-persian").formatToParts(new Date());
  const getPart = (type: string) => +(todayParts.find(p => p.type === type)?.value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) || 0);
  const todayObj = { year: getPart("year"), month: getPart("month"), day: getPart("day") };

  const [todayData, setTodayData] = useState<CalendarDay | null>(null);

  const load = async () => {
    const res = await fetch(`https://pnldev.com/api/calender?year=${year}&month=${month}`);
    const json = await res.json();
    setData(json.result);
    if (!todayData && json.result && json.result[todayObj.day]) {
      setTodayData(json.result[todayObj.day]);
    }
  };

  useEffect(() => { load(); }, [year, month]);

  const getMonthName = (m: number) => ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][m-1];
  const getWeekIndex = (d: string) => ['ش','ی','د','س','چ','پ','ج'].indexOf(d);
  const weekDayName = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  const gregorianMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const moonMonths = ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'];
  const toFa = (n: number) => n.toLocaleString("fa-IR");

  const leftArrow = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  const rightArrow = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

  return (
    <div className={`${vazir.className} w-[330px] h-[440px] rounded-[20px] shadow-sm ${theme === "dark" ? "bg-black border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-black"} p-3 mx-auto mt-4 border select-none flex flex-col justify-between`}>

      <div className="text-[11px] text-center text-gray-500 leading-5 mb-1">
        امروز: {todayData ? `${weekDayName[getWeekIndex(todayData.solar.dayWeek || '')]} ${toFa(todayData.solar.day)} ${getMonthName(todayData.solar.month)} ${toFa(todayData.solar.year)}` : 'ناعدد'}
      </div>

      <hr className="mb-1"/>

      <div className="flex justify-between items-center mb-1">
        <button onClick={() => setMonth(m => m === 1 ? (setYear(y => y - 1), 12) : m - 1)} className="p-1 rounded hover:bg-gray-200 transition text-current">{leftArrow}</button>
        <div className="text-center">
          <div className={`${vazirBold.className} text-[15px]`}>{getMonthName(month)} {toFa(year)}</div>
          <div className="text-[11px] text-gray-400">{data && `${toFa(data[1].moon.year)} ${moonMonths[(data[1].moon.month||1)-1]} - ${gregorianMonths[(data[1].gregorian.month||1)-1]}/${gregorianMonths[(data[31]?.gregorian.month||data[1].gregorian.month||1)-1]} ${data[1].gregorian.year}`}</div>
        </div>
        <button onClick={() => setMonth(m => m === 12 ? (setYear(y => y + 1), 1) : m + 1)} className="p-1 rounded hover:bg-gray-200 transition text-current">{rightArrow}</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {['ش','ی','د','س','چ','پ','ج'].map(d=><div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 text-center gap-y-1 text-[13px] mb-1 grow">
        {data && (() => {
          const firstDay = getWeekIndex(data[1].solar.dayWeek);
          const blanks = Array(firstDay).fill(<div></div>);
          return [
            ...blanks,
            ...Object.values(data).map(day => {
              const isToday = todayObj.year === day.solar.year && todayObj.month === day.solar.month && todayObj.day === day.solar.day;
              const isSelected = selectedDay === day.solar.day;
              return <div key={day.solar.day} onClick={() => setSelectedDay(day.solar.day)}
                className={`rounded-xl cursor-pointer flex flex-col items-center justify-center py-[2px] transition-all ${isToday ? theme === "dark" ? "border border-white text-black bg-white" : "border border-gray-400 bg-gray-200" : ""} ${isSelected ? "ring-2 ring-gray-400" : ""}`}>
                <span className={`leading-4 ${day.holiday ? "text-red-500" : ""}`}>{toFa(day.solar.day)}</span>
                <span className="text-[9px] text-gray-400">{toFa(day.gregorian.day)}</span>
              </div>
            })
          ];
        })()}
      </div>

      <div className={`rounded-xl px-2 pt-2 pb-1 text-right space-y-1 overflow-y-auto max-h-[80px] min-h-[40px] text-[11px] ${theme === "dark" ? "bg-black text-white border border-gray-700" : "bg-white"}`}>
        {selectedDay && data && data[selectedDay] && data[selectedDay].event.length ?
          data[selectedDay].event.map((e, i) => <div key={i} className="flex items-start gap-1 leading-5"><b className="text-gray-400">|</b><span className="break-words">{e}</span></div>)
          : <div className="text-gray-400 text-center">رویدادی نیست</div>}
      </div>

    </div>
  );
}
