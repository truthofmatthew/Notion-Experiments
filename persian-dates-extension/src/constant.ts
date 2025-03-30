// Logging
export const LOG_PREFIX = "mtlog:";

// Date Utilities
export const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
};

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const STANDARD_DATE_FORMAT = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

// Table Date Converter
export const TIME_THRESHOLD_MS = 500;
export const SELECTOR_TABLE_DATES = "[data-testid='property-value'] div, div.notion-date";

// Convert Notifications
export const PANEL_ID = 'persian-dates-panel';
export const CONTENT_ID = 'persian-dates-content';
export const MINIMIZE_BTN_ID = 'persian-dates-minimize';
export const HIDE_BTN_ID = 'persian-dates-hide';
export const SHOW_BTN_ID = 'persian-dates-show-button';
export const TOAST_ID = 'persian-dates-toast';
export const PANEL_TITLE = 'Persian Dates';
export const NO_DATES_MESSAGE = 'No date mentions found.';
export const CLICK_INSTRUCTION = 'Click a date to copy Persian format or scroll to its location';
export const SELECTOR_MENTIONS = '.notion-text-mention-token .notion-reminder';
export const PANEL_STATE_KEY = 'persian-dates-panel-state';

// Font Injection
export const UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF';
export const DEFAULT_FONTS = [
  { en_name: "Vazirmatn", fa_name: "وزیر متن", creator: "صابر راستی کردار" },
  { en_name: "Sahel", fa_name: "ساحل", creator: "صابر راستی کردار" },
  { en_name: "Parastoo", fa_name: "پرستو", creator: "صابر راستی کردار" }
];
export const ALL_FONTS_CSS = `
/* ========== Vazirmatn ========== */
@font-face {
  font-family: "Vazirmatn";
  src:
    url("${chrome.runtime.getURL('assets/fonts/vazir/Vazirmatn[wght].woff2')}")
      format("woff2 supports variations"),
    url("${chrome.runtime.getURL('assets/fonts/vazir/Vazirmatn[wght].woff2')}")
      format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: ${UNICODE_RANGE};
}

/* ========== Sahel ========== */
@font-face {
  font-family: "Sahel";
  src:
    url("${chrome.runtime.getURL('assets/fonts/sahel/Sahel-VF.woff2')}")
      format("woff2 supports variations"),
    url("${chrome.runtime.getURL('assets/fonts/sahel/Sahel-VF.woff2')}")
      format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: ${UNICODE_RANGE};
}

/* ========== Parastoo ========== */
@font-face {
  font-family: "Parastoo";
  src: url("${chrome.runtime.getURL('assets/fonts/parastoo/Parastoo.woff2')}") format("woff2");
  font-weight: normal;
  font-style: normal;
  unicode-range: ${UNICODE_RANGE};
}
@font-face {
  font-family: "Parastoo";
  src: url("${chrome.runtime.getURL('assets/fonts/parastoo/Parastoo-Bold.woff2')}")
    format("woff2");
  font-weight: bold;
  font-style: normal;
  unicode-range: ${UNICODE_RANGE};
}

/* Keep code blocks in LTR */
.notion-text-content[data-content-type="code"] {
  direction: ltr !important;
  text-align: left !important;
  font-family: "SF Mono", "Consolas", "Monaco", "Andale Mono", monospace !important;
}
`;
export const SELECTOR_EDITABLE_TEXT = '.notranslate[data-content-editable-leaf="true"]';
export const SELECTOR_CODE_BLOCK = '[data-content-type="code"]';
export const SELECTOR_NUMBERED_LIST = '.notion-selectable.notion-numbered_list-block';
export const SELECTOR_QUOTE_BLOCK = '.notion-quote-block';
export const SELECTOR_TOGGLE_BLOCK = '.notion-selectable.notion-toggle-block';
export const SELECTOR_BULLETED_LIST = '.notion-selectable.notion-bulleted_list-block';
export const SELECTOR_TABLE_BLOCK = '.notion-table-block';
export const SELECTOR_TODO_BLOCK = '.notion-to_do-block';
export const SELECTOR_RTL_ELEMENTS = '.notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6, ' +
  '.notion-table-view th, .notion-table-view td, .notion-collection_view-block div[data-content-editable-void="true"] > div:nth-child(2), ' +
  '.notion-table-view-header-cell, .notion-table-view-cell';
export const SELECTOR_GLOBAL_FONTS = [
  '.notion-page-content',
  '.notion-table-view',
  '.notion-board-view',
  '.notion-gallery-view',
  '.notion-page-block',
  '.notion-topbar',
  '.notion-body',
  '.notion-selectable',
  '.notion-collection_view-block',
  '.notion-frame',
  '.notion-collection-item'
].join(', ');
export const DEFAULT_FONT = 'Vazirmatn';
export const SYSTEM_FONTS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif';

// Convert Text
export const DATASET_KEYS = {
  ORIGINAL_DATE: 'originalDate',
  CONVERTED: 'converted'
};
export const SELECTOR_REMINDERS = '.notion-reminder';

// Storage Keys
export const STORAGE_KEYS = {
  PERSIAN_INPUT: 'persianInput',
  FONT_INJECTION_ENABLED: 'fontInjectionEnabled',
  SELECTED_FONT: 'selectedFont',
  PERSIAN_NUMBERS: 'persianNumbers' 
};

// UI Elements
export const UI_ELEMENTS = {
  PERSIAN_TOGGLE: 'persian-toggle',
  FONT_TOGGLE: 'font-toggle',
  RESET_BUTTON: 'reset-button',
  ERROR_MESSAGE: 'error-message',
  FONT_SELECTOR_CONTAINER: 'font-selector-container',
  FONT_SELECTOR: 'font-selector',
  FONT_AUTHOR: 'font-author',
  STATUS: 'status',
  CALL_MESSAGE: 'call-message'
};

// Message Types
export const MESSAGE_TYPES = {
  APPLY_SETTINGS: 'applySettings',
  RESET_COMPLETE: 'resetComplete',
  ERROR_COUNT_CHANGED: 'errorCountChanged',
  CHECK_ERRORS: 'checkErrors',
  REFRESH_CONVERSION: 'refreshConversion'
};

// Content Script
export const DEBOUNCE_DELAY = 300;
export const NOTION_URL_PATTERN = '*://*.notion.so/*';
export const SELECTOR_DATE_BUTTONS = 'button[name="day"]';
export const SELECTOR_PREV_MONTH = 'button[name="previous-month"]';
export const SELECTOR_NEXT_MONTH = 'button[name="next-month"]';
export const SELECTOR_DATE_FORMAT_CLEAR = '[role="button"]';
export const SELECTOR_DATE_MENTION = '.notion-selectable';
export const SELECTOR_PROPERTY_VALUE = '[data-testid="property-value"]';
export const SELECTOR_DATE_PICKER_INPUT = '.rdp';

// Popup HTML
export const HTML_CONSTANTS = {
  TITLE: 'نوشن فارسی',
  HEADER_TEXT: 'نوشن فارسی',
  CALENDAR_LABEL: 'تاریخ شمسی',
  FONT_LABEL: 'فونت فارسی',
  CALL_MESSAGE: 'اگه چیزی خراب بود، یه خبر بهم بده  🐞',
  FOOTER_NAME: 'Matthew Truth'
};