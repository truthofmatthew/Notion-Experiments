import jalaali from 'jalaali-js';
import { PERSIAN_MONTHS, SYSTEM_FONTS, STORAGE_KEYS, DEFAULT_FONT } from "./constant";

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

let currentFont = DEFAULT_FONT;

function convertTimelineHeader(): void {
  const headerSpan = document.querySelector<HTMLElement>('.notion-timeline-view div[style*="padding-top"] span');
  if (!headerSpan) return;
  const text = headerSpan.textContent?.trim();
  if (!text) return;
  const parts = text.split(' ');
  if (parts.length < 2) return;
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  const monthNum = MONTHS[monthName];
  if (!monthNum || isNaN(year)) return;
  const gregDate = new Date(year, monthNum - 1, 1);
  const jDate = jalaali.toJalaali(gregDate);
  const newText = `${PERSIAN_MONTHS[jDate.jm - 1]} ${toPersianDigits(jDate.jy.toString())}`;
  headerSpan.textContent = newText;
  headerSpan.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
  headerSpan.setAttribute('dir', 'rtl');
  (window as any).__timelineBaseDate = gregDate;
}

function convertTimelineDays(): void {
  const baseDate: Date = (window as any).__timelineBaseDate;
  if (!baseDate) return;
  const dayContainer = document.querySelector('.notion-timeline-view .notion-shimmer-timeline-transition');
  if (!dayContainer) return;

  const cells = Array.from(dayContainer.querySelectorAll<HTMLElement>('div[style*="width: 40px"]'));
  cells.forEach((el, index) => {
    const cellDate = new Date(baseDate);
    cellDate.setDate(baseDate.getDate() + index);
    const jDate = jalaali.toJalaali(cellDate);
    const dayText = toPersianDigits(jDate.jd.toString());
    const span = el.querySelector('span');
    if (span) {
      span.textContent = dayText;
      span.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
      span.setAttribute('dir', 'rtl');
    } else {
      el.textContent = dayText;
      el.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
      el.setAttribute('dir', 'rtl');
    }
  });

  const redCircles = dayContainer.querySelectorAll<HTMLElement>('div[style*="background: rgb(211, 79, 67)"]');
  redCircles.forEach(circle => circle.remove());
}

function convertTimelineMonthLabels(): void {
  const container = document.querySelector<HTMLElement>('.notion-timeline-view > div[style*="background: white"][style*="box-shadow: inset"]');
  if (!container) return;
  const baseDate: Date = (window as any).__timelineBaseDate;
  if (!baseDate) return;

  const labels = container.querySelectorAll<HTMLElement>('div');
  labels.forEach(label => {
    const text = label.textContent?.trim();
    if (!text || MONTHS[text] === undefined) return;

    const left = parseFloat(label.style.left || '0');
    const daysFromStart = Math.round(left / 40);
    const cellDate = new Date(baseDate);
    cellDate.setDate(baseDate.getDate() + daysFromStart);
    const jDate = jalaali.toJalaali(cellDate);
    const persianMonth = PERSIAN_MONTHS[jDate.jm - 1];
    label.textContent = persianMonth;
    label.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
    label.setAttribute('dir', 'rtl');
  });
}

export function convertTimeline(): void {
  chrome.storage.sync.get([STORAGE_KEYS.SELECTED_FONT], data => {
    currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
    convertTimelineHeader();
    convertTimelineDays();
    convertTimelineMonthLabels();
  });
}

function setupTimelineObserver(): void {
  const el = document.querySelector('.notion-timeline-view');
  if (!el) return;
  const observer = new MutationObserver(() => convertTimeline());
  observer.observe(el, { childList: true, subtree: true, characterData: true });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[STORAGE_KEYS.SELECTED_FONT]) {
    chrome.storage.sync.get([STORAGE_KEYS.SELECTED_FONT], data => {
      currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
      convertTimeline();
    });
  }
});

function initTimelineConversion(): void {
  chrome.storage.sync.get([STORAGE_KEYS.SELECTED_FONT], data => {
    currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
    if (document.querySelector('.notion-timeline-view')) {
      convertTimeline();
      setupTimelineObserver();
    }
  });
}

setTimeout(initTimelineConversion, 1500);
