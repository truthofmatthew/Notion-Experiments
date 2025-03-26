import { parseGregorian, formatJalali } from "./dateUtils";

export function convertText(persianInput: boolean) {
  document.querySelectorAll<HTMLElement>(".notion-reminder").forEach(el => {
    const current = el.innerText.trim();
    // Split the text into date and time parts.
    const match = current.match(/^(.+?)(\s+\d{1,2}:\d{2}\s*(AM|PM))?$/i);
    if (!match) return;
    const datePart = match[1];
    const timePart = match[2] || "";
    let original = el.dataset.originalDate;
    if (!original) {
      original = current;
      el.dataset.originalDate = original;
    }
    if (persianInput) {
      const d = parseGregorian(datePart);
      if (d && !isNaN(d.getTime())) {
        const jalaliDate = formatJalali(d);
        const newText = jalaliDate + timePart;
        if (newText !== current) {
          console.log("mtlog: Converting text block date", original, "to", newText);
          el.innerText = newText;
          el.title = original;
          el.dataset.converted = "true";
        }
      }
    } else {
      if (el.dataset.converted === "true") {
        console.log("mtlog: Reverting text block date", original);
        el.innerText = original;
        el.title = "";
        delete el.dataset.converted;
      }
    }
  });
}
