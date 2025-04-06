import jalaali from 'jalaali-js';
import { PERSIAN_MONTHS, SYSTEM_FONTS, STORAGE_KEYS, DEFAULT_FONT } from "./constant";

const MONTHS: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

// Keep the original mapping for lookup
const persianDayNamesLookup: Record<string, string> = {
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
            // Prepend strong to keep month before day number visually
            btn.insertBefore(strong, btn.firstChild);
          }
          // Add spaces for visual separation if needed
          strong.textContent = ` ${persianMonth} `;
          (strong as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
          (strong as HTMLElement).style.direction = 'rtl'; // Keep month name RTL
        } else {
          // Remove month element if exists from previous renders
          const strong = btn.querySelector('strong');
          if (strong) {
            strong.textContent = ''; // Clear content instead of removing element
          }
        }

        // Set day number
        const span = btn.querySelector('span');
        if (span) {
          // Ensure the span only contains the day number
          // Remove any child nodes (like old strong tags if they somehow got nested)
          while(span.firstChild) {
              span.removeChild(span.firstChild);
          }
          span.textContent = dayText; // Set the day number
          (span as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
          (span as HTMLElement).style.direction = 'rtl'; // Keep day number RTL
        }
         // Ensure the button itself flows RTL if needed, though individual elements handle it
        (btn as HTMLElement).style.direction = 'rtl';
      });
    });
}


function convertBigCalendar(): void {
  convertCalendarHeader();
  convertCalendarDays();
  // NOTE: Day name reversal happens in reverseAndConvertDayNames, called by convertCalendar
}

// Small Calendar
function convertSmallCalendarHeader(): void {
  // Reuse the big calendar header logic if the selectors are the same or similar
  // If the small calendar header needs specific logic, implement it here.
  // Assuming it uses '.sc-1htxemp-6.jsehgZ' like the original code:
  const headerEl = document.querySelector('.sc-1htxemp-6.jsehgZ');
  if (!headerEl) return;

  // Get Gregorian month/year text (e.g., "April 2025")
  // This might need adjustment if the text format changes
  const text = headerEl.textContent?.trim();
  if (!text) return;

  const parts = text.split(/\s+/);
  if (parts.length < 2) return; // Expecting "Month Year"

  const monthName = parts[0];
  const yearStr = parts.slice(1).join(' '); // Handle potential spaces in month names if any
  const year = parseInt(yearStr);

  const monthNum = MONTHS[monthName];

  if (!monthNum || isNaN(year)) {
      console.warn("Could not parse small calendar header:", text);
      return; // Exit if month or year is invalid
  }

  // Use the first day of the Gregorian month to find the corresponding Jalaali month/year
  const gregDate = new Date(year, monthNum - 1, 1);
  const jDate = jalaali.toJalaali(gregDate);

  const persianMonth = PERSIAN_MONTHS[jDate.jm - 1];
  const persianYear = toPersianDigits(jDate.jy.toString());

  headerEl.textContent = `${persianMonth} ${persianYear}`;
  headerEl.setAttribute('dir', 'rtl');
  (headerEl as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
}


function convertSmallCalendarDays(): void {
  // Assuming small calendar uses '.rdp-month_grid td' and '.sc-1htxemp-12.gMCvNC'
  const dayEls = document.querySelectorAll('.rdp-month_grid td');
  dayEls.forEach(td => {
    const dayStr = td.getAttribute('data-day'); // Expecting ISO date string like "2025-04-01T00:00:00.000Z"
    if (!dayStr) return;

    try {
        const dateObj = new Date(dayStr);
        if (isNaN(dateObj.getTime())) {
            console.warn("Invalid date string for small calendar day:", dayStr);
            return;
        }
        const jDate = jalaali.toJalaali(dateObj);

        const btn = td.querySelector('button'); // Or the direct element holding the day number
        if (!btn) return;

        // Find the specific div/span holding the day number
        const dayDiv = btn.querySelector('.sc-1htxemp-12.gMCvNC'); // Adjust selector if needed
        if (!dayDiv) return;

        dayDiv.textContent = toPersianDigits(jDate.jd.toString());
        (dayDiv as HTMLElement).style.direction = 'rtl'; // Or set on parent if better
        (dayDiv as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;

    } catch (e) {
        console.error("Error processing small calendar day:", dayStr, e);
    }
  });
}


function convertSmallCalendar(): void {
  convertSmallCalendarHeader();
  convertSmallCalendarDays();
   // NOTE: Day name reversal (if applicable to small calendar) happens in reverseAndConvertDayNames
}

// *** NEW FUNCTION ***
function reverseAndConvertDayNames(): void {
  // Select the container holding the day names for the BIG calendar
  const container = document.querySelector('.sc-lmxfee-3.iRQjYM');
  if (!container) {
      console.log("Day name container not found.");
      return;
  }

  // Select only the actual day name elements (excluding the 'W' placeholder)
  const dayNameEls = container.querySelectorAll('.sc-1rt47i1-0.sc-lmxfee-0.habFrR');
  if (dayNameEls.length === 0) {
      console.log("Day name elements not found.");
      return;
  }

  // Convert NodeList to Array and reverse it
  const reversedDayNameEls = Array.from(dayNameEls).reverse();

  // Process and re-append elements in reversed order
  reversedDayNameEls.forEach(el => {
    const original = el.textContent?.trim();
    if (original && persianDayNamesLookup[original]) {
      el.textContent = persianDayNamesLookup[original]; // Translate
      (el as HTMLElement).setAttribute('dir', 'rtl');
      (el as HTMLElement).style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
    } else {
        console.warn("Could not translate day name:", original);
    }
    // Append the element back to the container. This moves it to the end.
    // Since we iterate through the *reversed* list, they end up in the desired reversed order.
    container.appendChild(el);
  });

   // --- Optional: Handle Small Calendar Day Names ---
   // If the small calendar has *different* day name elements that also need reversing,
   // add similar logic here targeting its specific container and day elements.
   // Example (replace selectors):
   /*
   const smallCalContainer = document.querySelector('.small-calendar-day-names-container');
   if (smallCalContainer) {
       const smallCalDayEls = smallCalContainer.querySelectorAll('.small-cal-day-name');
       if (smallCalDayEls.length > 0) {
           const reversedSmallCalDayEls = Array.from(smallCalDayEls).reverse();
           reversedSmallCalDayEls.forEach(el => {
               // ... translate and style ...
               smallCalContainer.appendChild(el);
           });
       }
   }
   */
}


export function convertCalendar(): void {
  // Run conversions
  convertBigCalendar(); // Handles big calendar header and day numbers
  convertSmallCalendar(); // Handles small calendar header and day numbers
  reverseAndConvertDayNames(); // Reverses and converts day names (primarily for big calendar)
}

function setupObserver(selector: string, callback: () => void): void {
  const container = document.querySelector(selector);
  if (!container) {
    console.warn("Observer target not found:", selector);
    return;
  }
  const observer = new MutationObserver((mutationsList) => {
      // Optional: debounce or check mutations if performance is an issue
      callback();
  });
  observer.observe(container, { childList: true, subtree: true, characterData: true }); // Observe changes
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes[STORAGE_KEYS.PERSIAN_INPUT] || changes[STORAGE_KEYS.SELECTED_FONT])) {
    chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
      const persianInput = data[STORAGE_KEYS.PERSIAN_INPUT];
      currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;
      if (persianInput) {
          console.log("Storage change detected, running convertCalendar.");
          convertCalendar(); // Rerun all conversions
      }
      // Optional: Add logic here to *revert* changes if persianInput becomes false
    });
  }
});

// Init based on popup settings
chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.SELECTED_FONT], data => {
  const persianInput = data[STORAGE_KEYS.PERSIAN_INPUT];
  currentFont = data[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT;

  if (persianInput) {
    console.log("Initial load with Persian enabled, running convertCalendar.");
    // Initial conversion
    convertCalendar();

    // --- Setup Observers ---
    // Observer for the main calendar container (for month changes, etc.)
    // The specific class '.sc-1kdlpav-16.hUCMDN' seems to wrap the grid
    setupObserver('.sc-1kdlpav-16.hUCMDN', () => {
        console.log("Big calendar container mutation detected.");
        convertCalendar(); // Rerun all conversions
    });

    // Observer for the small calendar container (if its updates are separate)
    // The class '.sc-1htxemp-14.hBaYBJ' might be the parent of the small calendar month view
    setupObserver('.sc-1htxemp-14.hBaYBJ', () => {
        console.log("Small calendar container mutation detected.");
        convertCalendar(); // Rerun all conversions
    });

    // Debounced scroll listener (might still be needed if content loads lazily on scroll)
    let timer: number | null = null;
    window.addEventListener('scroll', () => {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
          // Check if conversion is still enabled before running
          chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT], currentData => {
             if (currentData[STORAGE_KEYS.PERSIAN_INPUT]) {
                 console.log("Scroll timeout, running convertCalendar.");
                 convertCalendar();
             }
          });
      }, 300); // 300ms debounce
    }, { passive: true }); // Use passive listener for better scroll performance

  } else {
      console.log("Initial load with Persian disabled.");
      // Optional: Add logic here to ensure the calendar is in its default state
  }
});

// --- Ensure constants are defined ---
// These should be in your './constant' file or defined here if not importing
/*
export const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export const SYSTEM_FONTS = "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"; // Example
export const STORAGE_KEYS = {
    PERSIAN_INPUT: 'persianInputEnabled', // Example key name
    SELECTED_FONT: 'selectedPersianFont' // Example key name
};
export const DEFAULT_FONT = "Tahoma"; // Example default
*/