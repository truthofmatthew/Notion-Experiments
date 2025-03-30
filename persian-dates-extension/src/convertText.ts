import { parseGregorian, formatJalali } from "./dateUtils";
import { LOG_PREFIX, DATASET_KEYS, SELECTOR_REMINDERS } from "./constant";

export function convertReminderDates(persianInput: boolean) {
  document.querySelectorAll<HTMLElement>(SELECTOR_REMINDERS).forEach(el => {
    const currentText = el.innerText.trim();
    const match = currentText.match(/^(.+?)(\s+\d{1,2}:\d{2}\s*(AM|PM))?$/i);
    if (!match) return;

    const datePart = match[1];
    const timePart = match[2] || "";
    let originalDate = el.dataset[DATASET_KEYS.ORIGINAL_DATE];
    if (!originalDate) {
      originalDate = currentText;
      el.dataset[DATASET_KEYS.ORIGINAL_DATE] = originalDate;
    }

    if (persianInput) {
      const date = parseGregorian(datePart);
      if (date && !isNaN(date.getTime())) {
        const jalaliDate = formatJalali(date);
        const newText = jalaliDate + timePart;
        if (newText !== currentText) {
          console.log(`${LOG_PREFIX} Converting reminder date`, originalDate, "to", newText);
          el.innerText = newText;
          el.title = originalDate;
          el.dataset[DATASET_KEYS.CONVERTED] = "true";
        }
      }
    } else {
      if (el.dataset[DATASET_KEYS.CONVERTED] === "true") {
        console.log(`${LOG_PREFIX} Reverting reminder date`, originalDate);
        el.innerText = originalDate;
        el.title = "";
        delete el.dataset[DATASET_KEYS.CONVERTED];
      }
    }
  });
}