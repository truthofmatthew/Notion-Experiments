import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import localFont from 'next/font/local';

const vazir = localFont({ src: '../../fonts/Vazirmatn-Regular.woff2' });
const vazirBold = localFont({ src: '../../fonts/Vazirmatn-Bold.woff2' });

type CalendarDay = {
  solar: { day: number; month: number; year: number; dayWeek: string };
  moon: { day: number; month: number; year: number };
  gregorian: { day: number; month: number; year: number; dayWeek: string | null };
  holiday: boolean;
  event: string[];
};

export default function WideCalendar() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get('dark') !== null ? 'dark' : 'grey';

  const [data, setData] = useState<Record<string, CalendarDay> | null>(null);
  const [year, setYear] = useState<number>(1404);
  const [month, setMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const todayParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian').formatToParts(new Date());
  const getPart = (type: string) => +(todayParts.find(p => p.type === type)?.value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) || 0);
  const todayObj = { year: getPart('year'), month: getPart('month'), day: getPart('day') };
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
  const toFa = (n: number) => n.toLocaleString('fa-IR');

  const leftArrow = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  const rightArrow = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

  return (
    <div className={`${vazir.className} w-[600px] h-[320px] rounded-[20px] shadow-sm ${theme === 'dark' ? 'bg-black text-white border-gray-700' : 'bg-gray-50 text-black border-gray-200'} p-3 mx-auto mt-4 border select-none flex`}>
      <div className="w-1/2 pr-3 pt-6 text-right overflow-y-auto">
        {selectedDay && data && data[selectedDay] && data[selectedDay].event.length ?
          data[selectedDay].event.map((e, i) => <div key={i} className="mb-1 text-[16px]">{e}</div>) :
          <div className="text-gray-400 text-[16px]">رویدادی نیست</div>}
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="text-center text-[18px] font-bold mb-1">{getMonthName(month)} {toFa(year)}</div>
        <div className="grid grid-cols-7 text-center text-[12px] text-gray-400">
          {['ش','ی','د','س','چ','پ','ج'].map(d=><div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 text-center gap-y-1 text-[16px] mt-1">
          {data && (() => {
            const firstDay = getWeekIndex(data[1].solar.dayWeek);
            const blanks = Array(firstDay).fill(<div></div>);
            return [
              ...blanks,
              ...Object.values(data).map(day => {
                const isToday = todayObj.year === day.solar.year && todayObj.month === day.solar.month && todayObj.day === day.solar.day;
                const isSelected = selectedDay === day.solar.day;
                return <div key={day.solar.day} onClick={() => setSelectedDay(day.solar.day)}
                  className={`rounded-xl cursor-pointer flex flex-col items-center justify-center py-[2px] transition-all 
                  ${isToday ? (theme === 'dark' ? 'bg-white text-black' : 'bg-gray-200 border') : ''} 
                  ${isSelected ? (theme === 'dark' ? 'ring-2 ring-white' : 'ring-2 ring-gray-400') : ''}`}>
                  <span className={`${day.holiday ? 'text-red-500' : ''}`}>{toFa(day.solar.day)}</span>
                </div>
              })
            ];
          })()}
        </div>
      </div>
    </div>
  );
}
