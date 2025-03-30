import { parseGregorian, formatJalali, isPersianDate, persianToGregorian } from "./dateUtils";
import { LOG_PREFIX, TIME_THRESHOLD_MS, SELECTOR_TABLE_DATES, DATASET_KEYS, PERSIAN_MONTHS, STORAGE_KEYS } from "./constant";

const jalaali = require('jalaali-js');

let dateConversionErrorCount = 0;
let isProcessingDateChanges = false;
let lastDateConversionTime = 0;

function formatJalaliVerbose(date: Date): string {
    const j = jalaali.toJalaali(date);
    return `${PERSIAN_MONTHS[j.jm - 1]} ${j.jd}، ${j.jy}`;
}

function toPersianDigits(input: string): string {
    return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

async function applyPersianNumbersIfEnabled(text: string): Promise<string> {
    return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_NUMBERS], (data) => {
            resolve(data[STORAGE_KEYS.PERSIAN_NUMBERS] ? toPersianDigits(text) : text);
        });
    });
}

export async function convertTableDates(persianInput: boolean): Promise<number> {
    const startTime = Date.now();
    console.log(`${LOG_PREFIX} Starting table date conversion, persianInput =`, persianInput);
    isProcessingDateChanges = true;
    let convertedDateCount = 0;

    try {
        const elements = document.querySelectorAll<HTMLElement>(SELECTOR_TABLE_DATES);
        for (const el of elements) {
            if (!isElementVisible(el)) continue;

            const currentText = el.innerText.trim();
            if (!currentText) continue;

            const [startDateText, endDateText] = currentText.split('→').map(s => s.trim());

            if (persianInput) {
                if (isPersianDate(startDateText)) continue;

                const startDate = parseGregorian(startDateText);
                const endDate = endDateText ? parseGregorian(endDateText) : null;

                if (startDate) {
                    const jalaliStart = /[a-zA-Z]/.test(startDateText) ? formatJalaliVerbose(startDate) : formatJalali(startDate);
                    const jalaliEnd = endDate ? (/[a-zA-Z]/.test(endDateText) ? formatJalaliVerbose(endDate) : formatJalali(endDate)) : null;
                    if (jalaliStart === "Invalid Date" || (endDate && jalaliEnd === "Invalid Date")) continue;

                    const jalaliRange = jalaliEnd ? `${jalaliStart} → ${jalaliEnd}` : jalaliStart;
                    const finalText = await applyPersianNumbersIfEnabled(jalaliRange);

                    if (el.innerText !== finalText) {
                        if (!el.hasAttribute(DATASET_KEYS.ORIGINAL_DATE)) {
                            el.setAttribute(DATASET_KEYS.ORIGINAL_DATE, currentText);
                        }
                        el.innerText = finalText;
                        convertedDateCount++;
                        console.log(`${LOG_PREFIX} Converted`, currentText, "to", finalText);
                    }
                }
            } else {
                if (isPersianDate(startDateText) || el.hasAttribute(DATASET_KEYS.ORIGINAL_DATE)) {
                    const originalDate = el.getAttribute(DATASET_KEYS.ORIGINAL_DATE);
                    if (originalDate) {
                        el.innerText = originalDate;
                        el.removeAttribute(DATASET_KEYS.ORIGINAL_DATE);
                        convertedDateCount++;
                        console.log(`${LOG_PREFIX} Restored original date:`, originalDate);
                    } else {
                        const gregorianStart = persianToGregorian(startDateText);
                        const gregorianEnd = endDateText ? persianToGregorian(endDateText) : null;
                        if (gregorianStart) {
                            const gregorianRange = gregorianEnd ? `${gregorianStart} ← ${gregorianEnd}` : gregorianStart;
                            const finalText = await applyPersianNumbersIfEnabled(gregorianRange);
                            el.innerText = finalText;
                            convertedDateCount++;
                            console.log(`${LOG_PREFIX} Converted Persian to Gregorian:`, currentText, "->", finalText);
                        }
                    }
                }
            }
        }

        lastDateConversionTime = startTime;
        console.log(`${LOG_PREFIX} Processed ${convertedDateCount} dates`);
    } catch (error) {
        console.error("Error during conversion:", error);
        dateConversionErrorCount++;
    } finally {
        isProcessingDateChanges = false;
    }

    return convertedDateCount;
}


function isElementVisible(element: HTMLElement): boolean {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

export async function resetAllConversions(): Promise<number> {
    console.log(`${LOG_PREFIX} Resetting all conversions`);
    isProcessingDateChanges = true;
    let resetDateCount = 0;

    try {
        dateConversionErrorCount = 0;

        document.querySelectorAll<HTMLElement>(`[${DATASET_KEYS.ORIGINAL_DATE}]`).forEach(el => {
            const originalDate = el.getAttribute(DATASET_KEYS.ORIGINAL_DATE);
            if (originalDate) {
                el.innerText = originalDate;
                el.removeAttribute(DATASET_KEYS.ORIGINAL_DATE);
                resetDateCount++;
                console.log(`${LOG_PREFIX} Reset to original date:`, originalDate);
            }
        });

        const elements = document.querySelectorAll<HTMLElement>(SELECTOR_TABLE_DATES);
        for (const el of elements) {
            if (!isElementVisible(el)) continue;

            const currentText = el.innerText.trim();
            if (!currentText || !isPersianDate(currentText) || el.hasAttribute(DATASET_KEYS.ORIGINAL_DATE)) continue;

            const [startDateText, endDateText] = currentText.split('→').map(s => s.trim());
            const gregorianStart = persianToGregorian(startDateText);
            const gregorianEnd = endDateText ? persianToGregorian(endDateText) : null;

            if (gregorianStart) {
                const gregorianRange = gregorianEnd ? `${gregorianStart} → ${gregorianEnd}` : gregorianStart;
                const finalText = await applyPersianNumbersIfEnabled(gregorianRange);
                el.innerText = finalText;
                resetDateCount++;
                console.log(`${LOG_PREFIX} Converted Persian to Gregorian:`, currentText, "->", finalText);
            }
        }

        console.log(`${LOG_PREFIX} Reset ${resetDateCount} date cells`);
    } finally {
        isProcessingDateChanges = false;
    }

    return resetDateCount;
}

export function wasDateConversionRecent(timeThresholdMs = TIME_THRESHOLD_MS): boolean {
    return (Date.now() - lastDateConversionTime) < timeThresholdMs;
}

export function isDateConversionInProgress(): boolean {
    return isProcessingDateChanges;
}

export function getErrorCount(): number {
    return dateConversionErrorCount;
}
