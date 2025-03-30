import jalaali from 'jalaali-js';
import { PERSIAN_MONTHS, SYSTEM_FONTS, STORAGE_KEYS, DEFAULT_FONT } from "./constant";

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

const persianDayNames: Record<string, string> = {
  Sat: "شنبه",
  Sun: "یکشنبه",
  Mon: "دوشنبه",
  Tue: "سه‌شنبه",
  Wed: "چهارشنبه",
  Thu: "پنج‌شنبه",
  Fri: "جمعه"
};

function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

let currentFont = DEFAULT_FONT;

// Big Calendar
function convertCalendarHeader(): void {
  const smallHeaderEl = document.querySelector('.sc-1htxemp-6.jsehgZ');
  const bigHeaderEl = document.querySelector('.sc-vb7gpf-1.jIHpro');
  if (!smallHeaderEl || !bigHeaderEl) return;
  const text = smallHeaderEl.textContent?.trim();
  if (!text) return;
  bigHeaderEl.textContent = text;
  bigHeaderEl.setAttribute('dir', 'rtl');
  (bigHeaderEl as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
}

function convertCalendarDays(): void {
    const containers = document.querySelectorAll('[data-grid-date]');
    containers.forEach(container => {
      const tsStr = container.getAttribute('data-grid-date');
      if (!tsStr) return;
      const baseDate = new Date(parseInt(tsStr));
      const dayButtons = container.querySelectorAll('.sc-12m9yy-5');
      dayButtons.forEach((btn, index) => {
        const cellDate = new Date(baseDate);
        cellDate.setDate(cellDate.getDate() + index);
        const jDate = jalaali.toJalaali(cellDate);
        const dayText = toPersianDigits(jDate.jd.toString());
  
        // If it's the 1st day of the month, show month and year
        if (jDate.jd === 1) {
          const persianMonth = PERSIAN_MONTHS[jDate.jm - 1];
          const persianYear = toPersianDigits(jDate.jy.toString());
          let strong = btn.querySelector('strong');
          if (!strong) {
            strong = document.createElement('strong');
            btn.insertBefore(strong, btn.firstChild);
          }
          strong.textContent = ` ${persianMonth} `;
          (strong as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
          (strong as HTMLElement).style.direction = 'rtl';
        } else {
          // Remove month element if exists
          const strong = btn.querySelector('strong');
          if (strong) {
            strong.textContent = '';
          }
        }
  
        // Set day number
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = dayText;
          (span as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
          (span as HTMLElement).style.direction = 'rtl';
        }
      });
    });
  }
  
  

function convertBigCalendar(): void {
  convertCalendarHeader();
  convertCalendarDays();
}

// Small Calendar
function convertSmallCalendarHeader(): void {
  convertCalendarHeader();
  const headerEl = document.querySelector('.sc-1htxemp-6.jsehgZ');
  if (!headerEl) return;
  const text = headerEl.textContent?.trim();
  if (!text) return;
  const parts = text.split(/\s+/);
  if (parts.length < 2) return;
  const monthName = parts[0];
  const year = parseInt(parts[1]);
  const monthNum = MONTHS[monthName];
  if (!monthNum || isNaN(year)) return;
  const gregDate = new Date(year, monthNum - 1, 1);
  const jDate = jalaali.toJalaali(gregDate);
  const persianMonth = PERSIAN_MONTHS[jDate.jm - 1];
  const persianYear = toPersianDigits(jDate.jy.toString());
  headerEl.textContent = `${persianMonth} ${persianYear}`;
  headerEl.setAttribute('dir', 'rtl');
  (headerEl as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
}

function convertSmallCalendarDays(): void {
  const dayEls = document.querySelectorAll('.rdp-month_grid td');
  dayEls.forEach(td => {
    const dayStr = td.getAttribute('data-day');
    if (!dayStr) return;
    const dateObj = new Date(dayStr);
    const jDate = jalaali.toJalaali(dateObj);
    const btn = td.querySelector('button');
    if (!btn) return;
    const dayDiv = btn.querySelector('.sc-1htxemp-12.gMCvNC');
    if (!dayDiv) return;
    dayDiv.textContent = toPersianDigits(jDate.jd.toString());
    (dayDiv as HTMLElement).style.direction = 'rtl';
    (dayDiv as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
  });
}

function convertSmallCalendar(): void {
  convertSmallCalendarHeader();
  convertSmallCalendarDays();
}

function convertDayNames(): void {
  const dayNameEls = document.querySelectorAll('.sc-1rt47i1-0.sc-lmxfee-0.habFrR');
  dayNameEls.forEach(el => {
    const original = el.textContent?.trim();
    if (original && persianDayNames[original]) {
      el.textContent = persianDayNames[original];
      (el as HTMLElement).setAttribute('dir', 'rtl');
      (el as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
    }
  });
}

export function convertCalendar(): void {
  convertBigCalendar();
  convertSmallCalendar();
  convertDayNames();
}

function setupObserver(selector: string, callback: () => void): void {
  const container = document.querySelector(selector);
  if (!container) return;
  const observer = new MutationObserver(() => callback());
  observer.observe(container, { childList: true, subtree: true, characterData: true });
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes[STORAGE_KEYS.PERSIAN_INPUT] || changes[STORAGE_KEYS.SELECTED_FONT])) {
    chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
      const persianInput = data[STORAGE_KEYS.PERSIAN_INPUT];
      currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
      if (persianInput) convertCalendar();
    });
  }
});

// Init based on popup settings
chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
  const persianInput = data[STORAGE_KEYS.PERSIAN_INPUT];
  currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
  if (persianInput) {
    convertCalendar();
    setupObserver('.sc-vb7gpf-1.jIHpro', convertBigCalendar);
    setupObserver('.sc-1htxemp-14.hBaYBJ', () => { convertSmallCalendar(); convertDayNames(); });
    let timer: number | null = null;
    window.addEventListener('scroll', () => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => convertCalendar(), 300);
    });
  }
});
