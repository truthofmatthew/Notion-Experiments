// small.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import localFont from 'next/font/local';

const vazir = localFont({ src: '../../fonts/Vazirmatn-Regular.woff2' });
const vazirBold = localFont({ src: '../../fonts/Vazirmatn-Bold.woff2' });

type CalendarDay = {
  solar: { day: number; month: number; year: number; dayWeek: string };
  holiday: boolean;
};

export default function SmallCalendar() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get('dark') !== null ? 'dark' : 'grey';

  const [data, setData] = useState<Record<string, CalendarDay> | null>(null);
  const [year, setYear] = useState<number>(1404);
  const [month, setMonth] = useState<number>(1);
  const todayParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian').formatToParts(new Date());
  const getPart = (type: string) => +(todayParts.find(p => p.type === type)?.value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) || 0);
  const todayObj = { year: getPart('year'), month: getPart('month'), day: getPart('day') };

  const load = async () => {
    const res = await fetch(`https://pnldev.com/api/calender?year=${year}&month=${month}`);
    const json = await res.json();
    setData(json.result);
  };

  useEffect(() => { load(); }, [year, month]);

  const getMonthName = (m: number) => ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][m-1];
  const getWeekIndex = (d: string) => ['ش','ی','د','س','چ','پ','ج'].indexOf(d);
  const toFa = (n: number) => n.toLocaleString('fa-IR');

  return (
    <div className={`${vazir.className} w-[240px] h-[240px] rounded-[20px] shadow-sm ${
      theme === 'dark' ? 'bg-black text-white border-gray-700' : 'bg-gray-50 text-black border-gray-200'
    } p-2 mx-auto mt-4 border select-none flex flex-col justify-between`}>

      <div className="text-center text-[16px] mb-1 mt-1">
        <div className={`${vazirBold.className}`}>{getMonthName(month)} {toFa(year)}</div>
      </div>

      <div className={`grid grid-cols-7 text-center text-[12px] ${theme === 'dark' ? 'text-white/70' : 'text-black/70'} mb-1`}>
        {['ش','ی','د','س','چ','پ','ج'].map(d=><div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 text-center gap-y-1 text-[14px] grow leading-4">
        {data && (() => {
          const firstDay = getWeekIndex(data[1].solar.dayWeek);
          const blanks = Array(firstDay).fill(<div></div>);
          return [
            ...blanks,
            ...Object.values(data).map(day => {
              const isToday = todayObj.year === day.solar.year && todayObj.month === day.solar.month && todayObj.day === day.solar.day;
              return <div key={day.solar.day}
                className={`flex items-center justify-center rounded-md w-6 h-6 mx-auto ${isToday ? (theme === 'dark' ? 'bg-white text-black' : 'bg-gray-200 text-black') : day.holiday ? 'text-red-400' : ''}`}>
                {toFa(day.solar.day)}
              </div>
            })
          ];
        })()}
      </div>
    </div>
  );
}

