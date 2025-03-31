// today.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import localFont from 'next/font/local';

const vazir = localFont({ src: '../../fonts/Vazirmatn-Regular.woff2' });
const vazirBold = localFont({ src: '../../fonts/Vazirmatn-Bold.woff2' });

type CalendarDay = {
  solar: { day: number; month: number; year: number; dayWeek: string };
  holiday: boolean;
};

export default function TodayWidget() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get('dark') !== null ? 'dark' : 'grey';

  const todayParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian').formatToParts(new Date());
  const getPart = (type: string) => +(todayParts.find(p => p.type === type)?.value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) || 0);
  const todayObj = { year: getPart('year'), month: getPart('month'), day: getPart('day') };

  const [data, setData] = useState<CalendarDay | null>(null);

  const load = async () => {
    const res = await fetch(`https://pnldev.com/api/calender?year=${todayObj.year}&month=${todayObj.month}&day=${todayObj.day}`);
    const json = await res.json();
    setData(json.result);
  };

  useEffect(() => { load(); }, []);

  const weekDayName = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
  const getMonthName = (m: number) => ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][m-1];
  const getWeekIndex = (d: string) => ['ش','ی','د','س','چ','پ','ج'].indexOf(d);
  const toFa = (n: number) => n.toLocaleString('fa-IR');

  return (
    <div className={`${vazir.className} relative w-[140px] h-[140px] rounded-[20px] shadow-sm ${
      theme === 'dark' ? 'bg-black border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-black'
    } p-2 mx-auto mt-4 border flex flex-col items-center justify-center`}>
      
      {data?.holiday && 
        <div className="absolute top-0 right-0 overflow-hidden w-full h-full rounded-[20px] pointer-events-none">
          <div className="absolute right-[-28px] top-[8px] w-[100px] rotate-45 bg-red-500 text-[10px] text-center py-[2px] shadow-sm rounded-sm text-white">
            تعطیل
          </div>
        </div>
      }

      <div className="text-[13px] mb-1">{data ? weekDayName[getWeekIndex(data.solar.dayWeek || '')] : ''}</div>

      <div className={`${vazirBold.className} text-[34px] leading-8`}>
        {data && toFa(data.solar.day)}
      </div>

      <div className="text-[13px] mt-1">{data && `${getMonthName(data.solar.month)} ${toFa(data.solar.year)}`}</div>
    </div>
  );
}
