import { convertTableDates, resetAllConversions, isDateConversionInProgress, wasDateConversionRecent, getErrorCount } from "../tableDateConverter";
import { handleDateMentions, clearDateMentionConversions } from "../convertNotif";
import { injectFonts, setCurrentFont } from "../fontInjection";
import { LOG_PREFIX, MESSAGE_TYPES, DEBOUNCE_DELAY, STORAGE_KEYS, SELECTOR_DATE_BUTTONS, SELECTOR_PREV_MONTH, SELECTOR_NEXT_MONTH, SELECTOR_DATE_FORMAT_CLEAR, SELECTOR_DATE_MENTION, SELECTOR_PROPERTY_VALUE, SELECTOR_DATE_PICKER_INPUT, TIME_THRESHOLD_MS } from "../constant";
import "../convertCalendar";
import "../convertPageCalendar";
import "../convertTimeline";

let persianInput = false;
let fontInjectionEnabled = false;
let isProcessingDateConversion = false;
let debounceTimer: number | null = null;

chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.FONT_INJECTION_ENABLED], d => {
    console.log(`${LOG_PREFIX} Initial state loaded`, d);
    persianInput = !!d[STORAGE_KEYS.PERSIAN_INPUT];
    fontInjectionEnabled = !!d[STORAGE_KEYS.FONT_INJECTION_ENABLED];

    if (persianInput) setTimeout(() => processDates(), 500);
    injectFonts(fontInjectionEnabled);
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === MESSAGE_TYPES.APPLY_SETTINGS && msg.data) {
        persianInput = !!msg.data[STORAGE_KEYS.PERSIAN_INPUT];
        fontInjectionEnabled = !!msg.data[STORAGE_KEYS.FONT_INJECTION_ENABLED];
        if (msg.data[STORAGE_KEYS.SELECTED_FONT]) setCurrentFont(msg.data[STORAGE_KEYS.SELECTED_FONT]);
        injectFonts(fontInjectionEnabled);
        if (persianInput) await processDates();
        return;
    }

    console.log(`${LOG_PREFIX} Received message`, msg);

    if (msg.persianInput !== undefined) {
        persianInput = msg.persianInput;
        console.log(`${LOG_PREFIX} Persian input set to`, persianInput);
        await processDates();
    }

    if (msg.fontInjectionEnabled !== undefined) {
        fontInjectionEnabled = msg.fontInjectionEnabled;
        console.log(`${LOG_PREFIX} Font injection set to`, fontInjectionEnabled);
        injectFonts(fontInjectionEnabled);
    }

    if (msg.selectedFont) {
        console.log(`${LOG_PREFIX} Font selection changed to`, msg.selectedFont);
        setCurrentFont(msg.selectedFont);
    }

    if (msg[MESSAGE_TYPES.CHECK_ERRORS]) {
        const errorCount = getErrorCount();
        console.log(`${LOG_PREFIX} Returning error count`, errorCount);
        sendResponse({ errorCount });
        return true;
    }

    if (msg[MESSAGE_TYPES.REFRESH_CONVERSION]) {
        console.log(`${LOG_PREFIX} Reset requested`);
        const resetCount = await resetAllConversions();
        const resetMentionCount = clearDateMentionConversions();
        const totalResetCount = resetCount + resetMentionCount;

        if (msg.forceReload) {
            chrome.runtime.sendMessage({ [MESSAGE_TYPES.RESET_COMPLETE]: true, count: totalResetCount, reloading: true });
            window.location.reload();
            return true;
        }

        setTimeout(async () => {
            if (persianInput) await processDates();
            chrome.runtime.sendMessage({ [MESSAGE_TYPES.RESET_COMPLETE]: true, count: totalResetCount });
        }, 500);
        return true;
    }

    return false;
});

async function processDates() {
    if (isProcessingDateConversion) {
        console.log(`${LOG_PREFIX} Already processing, skipping`);
        return;
    }

    isProcessingDateConversion = true;

    try {
        console.log(`${LOG_PREFIX} Processing dates, mode:`, persianInput ? "Persian" : "Gregorian");
        const tableCount = await convertTableDates(persianInput);
        const mentionCount = handleDateMentions(persianInput);
        const totalCount = tableCount + mentionCount;

        const errorCount = getErrorCount();
        if (errorCount > 0) {
            chrome.runtime.sendMessage({ [MESSAGE_TYPES.ERROR_COUNT_CHANGED]: true, errorCount });
        }

        console.log(`${LOG_PREFIX} Processed ${totalCount} dates (${tableCount} table dates, ${mentionCount} mentions)`);
    } finally {
        isProcessingDateConversion = false;
    }
}

function setupEventListeners() {
    document.addEventListener("click", (e) => {
        if (!persianInput) return;
        const target = e.target as HTMLElement;
        if (
            target.matches(SELECTOR_DATE_BUTTONS) ||
            target.closest(SELECTOR_PREV_MONTH) ||
            target.closest(SELECTOR_NEXT_MONTH) ||
            (target.closest(SELECTOR_DATE_FORMAT_CLEAR) && (target.textContent?.includes("Date format") || target.textContent?.includes("Clear")))
        ) {
            console.log(`${LOG_PREFIX} Date picker interaction detected`);
            setTimeout(() => processDates(), DEBOUNCE_DELAY);
        }

        if (target.closest(SELECTOR_DATE_MENTION) && (target.textContent?.includes('@Date') || target.textContent?.includes('@Reminder'))) {
            console.log(`${LOG_PREFIX} Date mention interaction detected`);
            setTimeout(() => processDates(), 800);
        }
    });

    document.addEventListener("input", (e) => {
        if (!persianInput) return;
        const target = e.target as HTMLElement;
        if (target.closest(SELECTOR_PROPERTY_VALUE) || (target.tagName === "INPUT" && target.closest(SELECTOR_DATE_PICKER_INPUT))) {
            console.log(`${LOG_PREFIX} Date field input detected`);
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => processDates(), DEBOUNCE_DELAY);
        }
    });
}

function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        if (!persianInput || isDateConversionInProgress() || wasDateConversionRecent(TIME_THRESHOLD_MS)) return;

        const hasDateChanges = mutations.some(mutation => {
            if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE && mutation.target.textContent) return true;
            if (mutation.type === 'childList' && mutation.target instanceof HTMLElement &&
                (mutation.target.closest(SELECTOR_PROPERTY_VALUE) || mutation.target.closest(".notion-date") ||
                    mutation.target.closest(".notion-reminder") || mutation.target.closest(SELECTOR_DATE_PICKER_INPUT))) return true;
            return false;
        });

        if (hasDateChanges) {
            console.log(`${LOG_PREFIX} Date changes detected by observer`);
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => processDates(), DEBOUNCE_DELAY);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function setupErrorReporting() {
    setInterval(() => {
        if (!persianInput) return;
        const errorCount = getErrorCount();
        if (errorCount > 0) {
            chrome.runtime.sendMessage({ [MESSAGE_TYPES.ERROR_COUNT_CHANGED]: true, errorCount }, () => { });
        }
    }, 5000);
}

setupEventListeners();
setupMutationObserver();
setupErrorReporting();
