import jalaali from 'jalaali-js';
import { PERSIAN_MONTHS, SYSTEM_FONTS, STORAGE_KEYS, DEFAULT_FONT } from "./constant";

const MONTHS: { [key: string]: number } = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
};

const persianDayNames: { [key in 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat']: string } = {
  Sun: "یکشنبه", Mon: "دوشنبه", Tue: "سه‌شنبه",
  Wed: "چهارشنبه", Thu: "پنج‌شنبه", Fri: "جمعه", Sat: "شنبه"
};

function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

let currentFont = DEFAULT_FONT;

function getHeaderElement(): HTMLElement | null {
  return document.querySelector('.notion-calendar-view > div:first-child div[style*="font-weight: 600"]') as HTMLElement | null;
}

function convertPageCalendarHeader(): void {
  const headerEl = getHeaderElement();
  if (!headerEl) return;
  // Save original header if not saved
  if (!headerEl.getAttribute('data-original-header')) {
    headerEl.setAttribute('data-original-header', headerEl.textContent || "");
  }
  const orig = headerEl.getAttribute('data-original-header') || "";
  const parts = orig.split(/\s+/);
  if (parts.length < 2) return;
  const monthName = parts[0],
        year = parseInt(parts[1]),
        monthNum = MONTHS[monthName];
  if (!monthNum || isNaN(year)) return;
  const gregDate = new Date(year, monthNum - 1, 1),
        jDate = jalaali.toJalaali(gregDate),
        persianMonth = PERSIAN_MONTHS[jDate.jm - 1],
        persianYear = toPersianDigits(jDate.jy.toString());
  headerEl.textContent = `${persianMonth} ${persianYear}`;
  headerEl.setAttribute('dir', 'rtl');
  headerEl.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
}

function convertPageCalendarDayNames(): void {
  const dayNameEls = document.querySelectorAll('.notion-calendar-header-days > div');
  dayNameEls.forEach(el => {
    const htmlEl = el as HTMLElement;
    const original = htmlEl.textContent?.trim();
    if (original && original in persianDayNames) {
      htmlEl.textContent = persianDayNames[original as keyof typeof persianDayNames];
      htmlEl.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
      htmlEl.style.direction = 'rtl';
    }
  });
}

function convertPageCalendarDays(): void {
  const dayEls = document.querySelectorAll('.notion-calendar-view-day') as NodeListOf<HTMLElement>;
  const headerEl = getHeaderElement();
  if (!headerEl) return;
  const orig = headerEl.getAttribute('data-original-header') || "";
  const parts = orig.split(/\s+/);
  if (parts.length < 2) return;
  const headerMonthName = parts[0],
        headerYear = parseInt(parts[1]),
        headerMonthNum = MONTHS[headerMonthName];
  if (!headerMonthNum || isNaN(headerYear)) return;
  let currentDate = new Date(headerYear, headerMonthNum - 1, 1);
  dayEls.forEach(htmlEl => {
    let text = htmlEl.textContent?.trim() || "";
    const monthMatch = text.match(/^(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
    if (monthMatch) {
      const monthAbbr = monthMatch[0],
            dayMatch = text.match(/\d+/);
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[0]),
              newMonth = MONTHS[monthAbbr];
        let newYear = currentDate.getFullYear();
        if (newMonth < (currentDate.getMonth() + 1)) newYear++;
        currentDate = new Date(newYear, newMonth - 1, dayNum);
      }
    }
    const jDate = jalaali.toJalaali(currentDate);
    htmlEl.textContent = toPersianDigits(jDate.jd.toString());
    htmlEl.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
    htmlEl.style.direction = 'rtl';
    currentDate.setDate(currentDate.getDate() + 1);
  });
}

export function convertPageCalendar(): void {
  convertPageCalendarHeader();
  convertPageCalendarDayNames();
  convertPageCalendarDays();
}

function setupObserver(selector: string, callback: () => void): void {
  const container = document.querySelector(selector);
  if (!container) return;
  const observer = new MutationObserver(callback);
  observer.observe(container, { childList: true, subtree: true, characterData: true });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes[STORAGE_KEYS.PERSIAN_INPUT] || changes[STORAGE_KEYS.SELECTED_FONT])) {
    chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
      currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
      if (data[STORAGE_KEYS.PERSIAN_INPUT]) convertPageCalendar();
    });
  }
});

chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
  currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
  if (data[STORAGE_KEYS.PERSIAN_INPUT]) {
    convertPageCalendar();
    setupObserver('.notion-calendar-view', convertPageCalendar);
    setupObserver('.notion-calendar-header-days', convertPageCalendarDayNames);
    let timer: number | null = null;
    window.addEventListener('scroll', () => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => convertPageCalendar(), 300);
    });
  }
});
