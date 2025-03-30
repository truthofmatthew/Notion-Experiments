import { format } from "date-fns-jalali";
import { MONTHS, PERSIAN_MONTHS, STANDARD_DATE_FORMAT } from "./constant";

const jalaali = require('jalaali-js');

export function isPersianDate(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  text = text.trim();
  const standardFormat = text.match(STANDARD_DATE_FORMAT);
  if (standardFormat) {
    const year = parseInt(standardFormat[1], 10);
    const month = parseInt(standardFormat[2], 10);
    const day = parseInt(standardFormat[3], 10);
    if (year >= 1300 && year < 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return jalaali.isValidJalaaliDate(year, month, day);
    }
  }

  return PERSIAN_MONTHS.some(month => text.includes(month));
}

export function parseGregorian(text: string): Date | null {
  if (!text || typeof text !== 'string' || isPersianDate(text)) return null;

  text = text.trim();

  try {
    let m = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
    if (m) {
      const mon = MONTHS[m[1].toLowerCase()];
      if (!mon) return null;
      return new Date(+m[3], mon - 1, +m[2]);
    }

    m = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);

      if (year >= 1300 && year < 1500 && !Object.keys(MONTHS).some(month => text.toLowerCase().includes(month.toLowerCase()))) {
        return null;
      }

      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    }

    m = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (m) {
      const month = parseInt(m[1], 10);
      const day = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);

      if (year >= 1300 && year < 1500) return null;
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    }

    m = text.match(/\b(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})\b/);
    if (m) {
      const mon = MONTHS[m[2].toLowerCase()];
      if (!mon) return null;
      return new Date(+m[1], mon - 1, +m[3]);
    }

    if (/today/i.test(text)) return new Date();
    if (/yesterday/i.test(text)) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    if (/tomorrow/i.test(text)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  } catch (error) {
    console.error("Error parsing date:", text, error);
  }

  return null;
}

export function formatJalali(d: Date): string {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
    console.error("Invalid date passed to formatJalali", d);
    return "Invalid Date";
  }

  try {
    const jalali = jalaali.toJalaali(d);
    return `${jalali.jy}/${jalali.jm.toString().padStart(2, '0')}/${jalali.jd.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error in formatJalali:", error);
    return "Invalid Date";
  }
}

export function persianToGregorian(persianDateStr: string): string | null {
  try {
    const match = persianDateStr.match(STANDARD_DATE_FORMAT);
    if (!match) return null;

    const jy = parseInt(match[1], 10);
    const jm = parseInt(match[2], 10);
    const jd = parseInt(match[3], 10);

    if (!jalaali.isValidJalaaliDate(jy, jm, jd)) return null;

    const gregorian = jalaali.toGregorian(jy, jm, jd);
    return `${gregorian.gy}/${gregorian.gm.toString().padStart(2, '0')}/${gregorian.gd.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error converting Persian to Gregorian:", error);
    return null;
  }
}