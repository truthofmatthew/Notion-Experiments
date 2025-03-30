

// pages/index.tsx
import { useEffect, useState } from "react";
import localFont from 'next/font/local';

const vazir = localFont({ src: '../public/fonts/Vazirmatn-Regular.woff2' });

type CalendarDay = {
  solar: { day: number; month: number; year: number; dayWeek: string };
  gregorian: { day: number; month: number; year: number; dayWeek: string | null };
  holiday: boolean;
  event: string[];
};

export default function Home() {
  const [data, setData] = useState<Record<string, CalendarDay> | null>(null);
  const [year, setYear] = useState<number>(1404);
  const [month, setMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const todayParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian').formatToParts(new Date());
  const getPart = (type: string) => +(todayParts.find(p => p.type === type)?.value ?? 0);

  const todayObj = {
      year: getPart('year'),
      month: getPart('month'),
      day: getPart('day'),
  };

  

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
    <div className={`${vazir.className} w-[330px] rounded-2xl shadow bg-gray-50 p-3 mx-auto mt-4 border border-gray-200 select-none`}>
      <div className="text-[11px] text-right text-gray-600 mb-2">امروز: {toFa(todayObj.year)} {getMonthName(todayObj.month)} {toFa(todayObj.day)}</div>
      <div className="flex justify-between items-center text-sm font-bold text-gray-700 mb-2">
        <button onClick={()=>setMonth(m=>m===1?(setYear(y=>y-1),12):m-1)} className="px-2 rounded hover:bg-gray-200">&lt;</button>
        <div>{getMonthName(month)} {toFa(year)}</div>
        <button onClick={()=>setMonth(m=>m===12?(setYear(y=>y+1),1):m+1)} className="px-2 rounded hover:bg-gray-200">&gt;</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {['ش','ی','د','س','چ','پ','ج'].map(d=><div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-1 text-[12px] mb-2">
        {data && (() => {
          const firstDay = getWeekIndex(data[1].solar.dayWeek);
          const blanks = Array(firstDay).fill(<div></div>);
          return [
            ...blanks,
            ...Object.values(data).map(day => {
              const isToday = todayObj.year === day.solar.year && todayObj.month === day.solar.month && todayObj.day === day.solar.day;
              const isSelected = selectedDay === day.solar.day;
              return <div key={day.solar.day} onClick={() => setSelectedDay(day.solar.day)} className={`rounded-xl cursor-pointer flex flex-col items-center justify-center py-1 ${isToday?'bg-gray-300 border border-gray-400':''} ${isSelected?'ring-2 ring-gray-400':''}`}>
                <span className={`text-[13px] ${day.holiday?'text-red-500':''}`}>{toFa(day.solar.day)}</span>
                <span className="text-[9px] text-gray-400">{toFa(day.gregorian.day)}</span>
              </div>
            })
          ];
        })()}
      </div>
      <div className="bg-white rounded-xl p-2 text-right space-y-1 max-h-[100px] overflow-y-auto text-[11px]">
        {selectedDay && data && data[selectedDay] && data[selectedDay].event.length ? 
          data[selectedDay].event.map((e, i) => <div key={i} className="flex items-center gap-1"><b className="text-gray-400">|</b><span>{e}</span></div>) 
          : <div className="text-gray-400 text-center">رویدادی نیست</div>}
      </div>
    </div>
  );
}
