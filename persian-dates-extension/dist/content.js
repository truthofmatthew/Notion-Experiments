/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 45:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertDateMentions = convertDateMentions;
exports.resetDateMentions = resetDateMentions;
// Import the jalaali-js library for accurate date conversions
const jalaali = __webpack_require__(635);
const dateUtils_1 = __webpack_require__(629);
// Store the floating panel element
let floatingPanel = null;
// Store the show button element
let showButton = null;
// Track which dates we've converted
const convertedDates = new Map();
// Track panel state
let isPanelHidden = false;
// Track panel position
let panelPosition = { top: '', left: '', right: '20px', bottom: '20px' };
/**
 * Convert date mentions/reminders in Notion
 * These appear as @Date elements like "@April 26, 2025"
 */
function convertDateMentions(persianInput) {
    console.log("mtlog: Converting date mentions, persianInput =", persianInput);
    let conversionCount = 0;
    try {
        // Handle based on Persian mode
        if (persianInput) {
            // Load panel state from storage
            loadPanelState();
            // Create the floating panel if needed
            createFloatingPanel();
            // Find all date mention tokens in Notion
            const mentions = document.querySelectorAll('.notion-text-mention-token .notion-reminder');
            // Clear current conversions
            convertedDates.clear();
            // Process each date mention
            mentions.forEach(reminder => {
                const current = reminder.textContent || "";
                const currentTrimmed = current.trim();
                if (!currentTrimmed)
                    return;
                // Skip if already in Persian format
                if ((0, dateUtils_1.isPersianDate)(currentTrimmed))
                    return;
                // Try to extract the date info to convert it
                const dateInfo = extractDateFromMention(currentTrimmed);
                if (dateInfo) {
                    const { date, display } = dateInfo;
                    // Convert to Persian date
                    const jalali = jalaali.toJalaali(date);
                    // Create Persian date format
                    const persianMonths = [
                        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
                    ];
                    const persianDate = `${persianMonths[jalali.jm - 1]} ${jalali.jd}، ${jalali.jy}`;
                    // Store the conversion with element reference
                    convertedDates.set(display, { persianDate, element: reminder });
                    conversionCount++;
                    console.log("mtlog: Converted mention", display, "to", persianDate);
                }
            });
            // Update the panel with conversions
            updatePanelContent();
            // Apply panel visibility based on saved state
            if (isPanelHidden) {
                hidePanel();
            }
            else {
                showPanel();
            }
        }
        else {
            // Remove panel in Gregorian mode
            removeFloatingPanel();
            convertedDates.clear();
        }
        return conversionCount;
    }
    catch (error) {
        console.error("Error converting date mentions:", error);
        return conversionCount;
    }
}
/**
 * Create floating panel with Persian date conversions
 */
function createFloatingPanel() {
    // Only create if it doesn't exist
    if (floatingPanel && document.body.contains(floatingPanel))
        return;
    // Create panel container
    floatingPanel = document.createElement('div');
    floatingPanel.id = 'persian-dates-panel';
    floatingPanel.style.cssText = `
    position: fixed;
    ${panelPosition.bottom ? 'bottom: ' + panelPosition.bottom + ';' : ''}
    ${panelPosition.right ? 'right: ' + panelPosition.right + ';' : ''}
    ${panelPosition.top ? 'top: ' + panelPosition.top + ';' : ''}
    ${panelPosition.left ? 'left: ' + panelPosition.left + ';' : ''}
    width: 280px;
    max-height: 400px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
    z-index: 9999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    background: #f7f6f3;
  `;
    header.innerHTML = `
    <div style="font-weight: 600; font-size: 14px;">Persian Dates</div>
    <div style="display: flex; gap: 8px;">
      <button id="persian-dates-minimize" style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">−</button>
      <button id="persian-dates-hide" style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
    floatingPanel.appendChild(header);
    // Create content area
    const content = document.createElement('div');
    content.id = 'persian-dates-content';
    content.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    max-height: 340px;
    display: block;
  `;
    floatingPanel.appendChild(content);
    // Add to document
    document.body.appendChild(floatingPanel);
    // Make panel draggable
    makeDraggable(floatingPanel, header);
    // Handle minimize button
    const minimizeBtn = floatingPanel.querySelector('#persian-dates-minimize');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            const content = floatingPanel === null || floatingPanel === void 0 ? void 0 : floatingPanel.querySelector('#persian-dates-content');
            if (content) {
                if (content.style.display === 'none') {
                    // Expand
                    content.style.display = 'block';
                    minimizeBtn.textContent = '−';
                }
                else {
                    // Collapse
                    content.style.display = 'none';
                    minimizeBtn.textContent = '+';
                }
            }
        });
    }
    // Handle hide button
    const hideBtn = floatingPanel.querySelector('#persian-dates-hide');
    if (hideBtn) {
        hideBtn.addEventListener('click', () => {
            hidePanel();
            savePanelState();
        });
    }
    // Create show button (initially hidden)
    createShowButton();
}
/**
 * Create a small button to show the panel when it's hidden
 */
function createShowButton() {
    // Remove existing button if any
    if (showButton && document.body.contains(showButton)) {
        document.body.removeChild(showButton);
    }
    // Create new button
    showButton = document.createElement('div');
    showButton.id = 'persian-dates-show-button';
    showButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    font-size: 18px;
    color: #333;
  `;
    showButton.innerHTML = `<span style="font-weight: bold;">🗓️</span>`;
    showButton.title = "Show Persian Dates";
    // Add click event
    showButton.addEventListener('click', () => {
        showPanel();
        savePanelState();
    });
    // Add to document
    document.body.appendChild(showButton);
}
/**
 * Hide the panel and show the small button
 */
function hidePanel() {
    if (!floatingPanel || !showButton)
        return;
    // Save position before hiding
    if (floatingPanel.style.top)
        panelPosition.top = floatingPanel.style.top;
    if (floatingPanel.style.left)
        panelPosition.left = floatingPanel.style.left;
    if (floatingPanel.style.right)
        panelPosition.right = floatingPanel.style.right;
    if (floatingPanel.style.bottom)
        panelPosition.bottom = floatingPanel.style.bottom;
    // Hide panel
    floatingPanel.style.display = 'none';
    // Show button
    showButton.style.display = 'flex';
    // Update state
    isPanelHidden = true;
}
/**
 * Show the panel and hide the small button
 */
function showPanel() {
    if (!floatingPanel || !showButton)
        return;
    // Show panel
    floatingPanel.style.display = 'flex';
    // Hide button
    showButton.style.display = 'none';
    // Update state
    isPanelHidden = false;
}
/**
 * Save panel state to storage
 */
function savePanelState() {
    try {
        const state = {
            hidden: isPanelHidden,
            position: panelPosition
        };
        localStorage.setItem('persian-dates-panel-state', JSON.stringify(state));
    }
    catch (error) {
        console.error("Error saving panel state:", error);
    }
}
/**
 * Load panel state from storage
 */
function loadPanelState() {
    try {
        const savedState = localStorage.getItem('persian-dates-panel-state');
        if (savedState) {
            const state = JSON.parse(savedState);
            isPanelHidden = state.hidden;
            if (state.position) {
                panelPosition = state.position;
            }
        }
    }
    catch (error) {
        console.error("Error loading panel state:", error);
    }
}
/**
 * Update panel content with current conversions
 */
function updatePanelContent() {
    if (!floatingPanel)
        return;
    const content = floatingPanel.querySelector('#persian-dates-content');
    if (!content)
        return;
    if (convertedDates.size === 0) {
        content.innerHTML = `
      <div style="text-align: center; color: #888; padding: 8px 0;">
        No date mentions found.
      </div>
    `;
        return;
    }
    // Generate conversion list
    let html = '';
    convertedDates.forEach(({ persianDate, element }, gregorianDate) => {
        html += `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
        <div style="margin-bottom: 4px; direction: rtl; text-align: right;">
          <span style="font-weight: 600; cursor: pointer;" data-date="${gregorianDate}">${persianDate}</span>
        </div>
        <div style="font-size: 12px; color: #888;">
          ${gregorianDate}
        </div>
      </div>
    `;
    });
    // Add copy instructions
    html += `
    <div style="font-size: 12px; color: #888; margin-top: 8px; text-align: center;">
      Click a date to copy Persian format or scroll to its location
    </div>
  `;
    content.innerHTML = html;
    // Add click handlers for copying and scrolling
    const dateElements = content.querySelectorAll('span[data-date]');
    dateElements.forEach(element => {
        element.addEventListener('click', (e) => {
            const target = e.target;
            const gregorianDate = target.getAttribute('data-date');
            if (!gregorianDate)
                return;
            const conversion = convertedDates.get(gregorianDate);
            if (!conversion)
                return;
            // Scroll the original element into view
            conversion.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Show a highlight effect
            const originalElement = conversion.element;
            originalElement.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                originalElement.style.backgroundColor = '';
            }, 2000);
        });
    });
}
/**
 * Show a toast message when text is copied
 */
function showCopyToast(message) {
    // Remove existing toast if any
    const existingToast = document.getElementById('persian-dates-toast');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    // Create toast
    const toast = document.createElement('div');
    toast.id = 'persian-dates-toast';
    toast.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
  `;
    toast.textContent = message;
    document.body.appendChild(toast);
    // Remove after 2 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 2000);
}
/**
 * Remove the floating panel
 */
function removeFloatingPanel() {
    if (floatingPanel && document.body.contains(floatingPanel)) {
        document.body.removeChild(floatingPanel);
        floatingPanel = null;
    }
    if (showButton && document.body.contains(showButton)) {
        document.body.removeChild(showButton);
        showButton = null;
    }
}
/**
 * Make an element draggable
 */
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // Set handle for dragging
    handle.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        // Clear any right/bottom positioning
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        // Save updated position to our tracking object
        panelPosition = {
            top: element.style.top,
            left: element.style.left,
            right: '',
            bottom: ''
        };
    }
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
        // Save position after drag ends
        savePanelState();
    }
}
/**
 * Extract date information from a mention string like "April 26, 2025"
 */
function extractDateFromMention(text) {
    try {
        // Replace multiple spaces with single space and trim
        const cleaned = text.replace(/\s+/g, ' ').trim();
        // Try to parse the date
        const date = (0, dateUtils_1.parseGregorian)(cleaned);
        if (date) {
            return { date, display: cleaned };
        }
        return null;
    }
    catch (error) {
        console.error("Error extracting date from mention:", error);
        return null;
    }
}
/**
 * Reset all date mentions to their original values
 */
function resetDateMentions() {
    console.log("mtlog: Resetting date mentions");
    // Just remove panel and clear conversions
    const count = convertedDates.size;
    convertedDates.clear();
    removeFloatingPanel();
    return count;
}


/***/ }),

/***/ 167:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertTable = convertTable;
exports.resetAllConversions = resetAllConversions;
exports.wasRecentlyProcessed = wasRecentlyProcessed;
exports.isCurrentlyMakingChanges = isCurrentlyMakingChanges;
exports.getErrorCount = getErrorCount;
const dateUtils_1 = __webpack_require__(629);
// Only track errors - no state storage
let conversionErrorCount = 0;
// Flag to prevent observer loops
let isMakingChanges = false;
// Keep track of the last time we processed dates
let lastProcessedTime = 0;
// Main conversion function - completely stateless
function convertTable(persianInput) {
    const startTime = Date.now();
    console.log("mtlog: Starting table conversion, persianInput =", persianInput);
    // Set the flag that we're making changes
    isMakingChanges = true;
    let conversionCount = 0;
    try {
        // Process each date cell in Notion's table
        document.querySelectorAll("[data-testid='property-value'] div, div.notion-date").forEach(el => {
            // Skip elements that are not visible
            if (!isElementVisible(el))
                return;
            const current = el.innerText.trim();
            // Skip empty cells
            if (!current)
                return;
            if (persianInput) {
                // If we want Persian dates
                // Skip if already in Persian format
                if ((0, dateUtils_1.isPersianDate)(current)) {
                    return;
                }
                // Try to parse as Gregorian date
                const parsedDate = (0, dateUtils_1.parseGregorian)(current);
                if (parsedDate) {
                    // This is a valid Gregorian date - convert it using jalaali-js
                    const jalaliDate = (0, dateUtils_1.formatJalali)(parsedDate);
                    // Skip invalid conversions
                    if (jalaliDate === "Invalid Date") {
                        console.warn("Skipping invalid date conversion:", current);
                        return;
                    }
                    // Update visible text to Persian if it's different
                    if (el.innerText !== jalaliDate) {
                        // Store original content in a data attribute for restoration
                        if (!el.hasAttribute('data-original-date')) {
                            el.setAttribute('data-original-date', current);
                        }
                        el.innerText = jalaliDate;
                        conversionCount++;
                        console.log("mtlog: Converted", current, "to", jalaliDate);
                    }
                }
            }
            else {
                // If we want Gregorian dates
                // Check if this is a Persian date that needs restoration
                if ((0, dateUtils_1.isPersianDate)(current)) {
                    // Try to get the original date if stored
                    const originalDate = el.getAttribute('data-original-date');
                    if (originalDate) {
                        // We have the original, use it
                        el.innerText = originalDate;
                        el.removeAttribute('data-original-date');
                        conversionCount++;
                        console.log("mtlog: Restored original date:", originalDate);
                    }
                    else {
                        // No original stored, convert from Persian using jalaali-js
                        const gregorianDate = (0, dateUtils_1.persianToGregorian)(current);
                        if (gregorianDate) {
                            el.innerText = gregorianDate;
                            conversionCount++;
                            console.log("mtlog: Converted Persian to Gregorian:", current, "->", gregorianDate);
                        }
                    }
                }
            }
        });
        // Update the last processed timestamp
        lastProcessedTime = startTime;
        console.log(`mtlog: Processed ${conversionCount} dates`);
    }
    catch (error) {
        console.error("Error during conversion:", error);
        conversionErrorCount++;
    }
    finally {
        // Always reset the flag
        isMakingChanges = false;
    }
    return conversionCount;
}
// Helper function to check if an element is visible
function isElementVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
// Function to reset all dates to their original values
function resetAllConversions() {
    console.log("mtlog: Resetting all conversions");
    isMakingChanges = true;
    let count = 0;
    try {
        // Reset error count
        conversionErrorCount = 0;
        // Strategy 1: First try to restore from original data attribute
        document.querySelectorAll('[data-original-date]').forEach(el => {
            const originalDate = el.getAttribute('data-original-date');
            if (originalDate) {
                el.innerText = originalDate;
                el.removeAttribute('data-original-date');
                count++;
                console.log("mtlog: Reset to original date:", originalDate);
            }
        });
        // Strategy 2: For any remaining Persian dates, convert them to Gregorian
        document.querySelectorAll("[data-testid='property-value'] div, div.notion-date").forEach(el => {
            if (!isElementVisible(el))
                return;
            const current = el.innerText.trim();
            if (!current)
                return;
            // Check if it's a Persian date without original data
            if ((0, dateUtils_1.isPersianDate)(current) && !el.hasAttribute('data-original-date')) {
                const gregorianDate = (0, dateUtils_1.persianToGregorian)(current);
                if (gregorianDate) {
                    el.innerText = gregorianDate;
                    count++;
                    console.log("mtlog: Converted Persian to Gregorian:", current, "->", gregorianDate);
                }
            }
        });
        console.log(`mtlog: Reset ${count} date cells`);
    }
    finally {
        isMakingChanges = false;
    }
    return count;
}
// Check if a conversion was done recently
function wasRecentlyProcessed(timeThresholdMs = 500) {
    return (Date.now() - lastProcessedTime) < timeThresholdMs;
}
// Check if we're currently making changes
function isCurrentlyMakingChanges() {
    return isMakingChanges;
}
// Get the current error count
function getErrorCount() {
    return conversionErrorCount;
}


/***/ }),

/***/ 629:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.months = void 0;
exports.isPersianDate = isPersianDate;
exports.parseGregorian = parseGregorian;
exports.formatJalali = formatJalali;
exports.persianToGregorian = persianToGregorian;
// Use require for CommonJS modules
const jalaali = __webpack_require__(635);
// Month name mapping for parsing
exports.months = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
};
/**
 * Improved function to check if a string appears to be a Persian date
 */
function isPersianDate(text) {
    if (!text || typeof text !== 'string')
        return false;
    // Clean the input
    text = text.trim();
    // Pattern 1: yyyy/mm/dd format with years between 1300-1499
    const standardFormat = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (standardFormat) {
        const year = parseInt(standardFormat[1], 10);
        const month = parseInt(standardFormat[2], 10);
        const day = parseInt(standardFormat[3], 10);
        // Basic validation
        if (year >= 1300 && year < 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return jalaali.isValidJalaaliDate(year, month, day);
        }
    }
    // Pattern 2: Persian month names
    const persianMonthNames = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    for (const month of persianMonthNames) {
        if (text.includes(month)) {
            return true;
        }
    }
    return false;
}
/**
 * Parse a Gregorian date string into a Date object
 * Handles various common date formats
 */
function parseGregorian(text) {
    if (!text || typeof text !== 'string')
        return null;
    // Clean the input
    text = text.trim();
    // Quick check: if it looks like a Persian date, don't try to parse as Gregorian
    if (isPersianDate(text)) {
        return null;
    }
    try {
        // Month Day, Year (e.g., "January 15, 2023")
        let m = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
        if (m) {
            const mon = exports.months[m[1].toLowerCase()];
            if (!mon)
                return null;
            return new Date(+m[3], mon - 1, +m[2]);
        }
        // ISO format: Year-Month-Day or Year/Month/Day (e.g., "2023-01-15" or "2023/01/15")
        m = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
        if (m) {
            const year = parseInt(m[1], 10);
            const month = parseInt(m[2], 10);
            const day = parseInt(m[3], 10);
            // Skip if it looks like a Persian date
            if (year >= 1300 && year < 1500) {
                // Only consider it Gregorian if it's a common year like 1400 (which could be both)
                // and has English context clues
                const hasEnglishContext = Object.keys(exports.months).some(month => text.toLowerCase().includes(month.toLowerCase()));
                if (!hasEnglishContext) {
                    return null;
                }
            }
            // Basic validation
            if (month < 1 || month > 12 || day < 1 || day > 31)
                return null;
            return new Date(year, month - 1, day);
        }
        // US format: Month/Day/Year (e.g., "1/15/2023")
        m = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
        if (m) {
            const month = parseInt(m[1], 10);
            const day = parseInt(m[2], 10);
            const year = parseInt(m[3], 10);
            // Skip if it looks like a Persian date
            if (year >= 1300 && year < 1500) {
                return null;
            }
            // Basic validation
            if (month < 1 || month > 12 || day < 1 || day > 31)
                return null;
            return new Date(year, month - 1, day);
        }
        // Year Month Day (e.g., "2023 January 15")
        m = text.match(/\b(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})\b/);
        if (m) {
            const mon = exports.months[m[2].toLowerCase()];
            if (!mon)
                return null;
            return new Date(+m[1], mon - 1, +m[3]);
        }
        // Try for relative dates like "Today", "Yesterday", "Tomorrow"
        if (/today/i.test(text)) {
            return new Date();
        }
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
    }
    catch (error) {
        console.error("Error parsing date:", text, error);
    }
    return null;
}
/**
 * Convert a Date object to Persian (Jalali) date format using jalaali-js
 */
function formatJalali(d) {
    // Validate input
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
        console.error("Invalid date passed to formatJalali", d);
        return "Invalid Date";
    }
    try {
        // Use jalaali-js for accurate conversion
        const jalali = jalaali.toJalaali(d);
        // Format as yyyy/mm/dd
        return `${jalali.jy}/${jalali.jm.toString().padStart(2, '0')}/${jalali.jd.toString().padStart(2, '0')}`;
    }
    catch (error) {
        console.error("Error in formatJalali:", error);
        return "Invalid Date";
    }
}
/**
 * Convert a Persian date string to a Gregorian Date object using jalaali-js
 * @param persianDateStr Persian date string in format yyyy/mm/dd
 */
function persianToGregorian(persianDateStr) {
    try {
        // Parse the Persian date string
        const match = persianDateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
        if (!match)
            return null;
        const jy = parseInt(match[1], 10);
        const jm = parseInt(match[2], 10);
        const jd = parseInt(match[3], 10);
        // Check if it's a valid Persian date
        if (!jalaali.isValidJalaaliDate(jy, jm, jd)) {
            return null;
        }
        // Convert to Gregorian
        const gregorian = jalaali.toGregorian(jy, jm, jd);
        // Format as yyyy/mm/dd
        return `${gregorian.gy}/${gregorian.gm.toString().padStart(2, '0')}/${gregorian.gd.toString().padStart(2, '0')}`;
    }
    catch (error) {
        console.error("Error converting Persian to Gregorian:", error);
        return null;
    }
}


/***/ }),

/***/ 635:
/***/ ((module) => {

/*
  Expose functions.
*/
module.exports =
  { toJalaali: toJalaali
  , toGregorian: toGregorian
  , isValidJalaaliDate: isValidJalaaliDate
  , isLeapJalaaliYear: isLeapJalaaliYear
  , jalaaliMonthLength: jalaaliMonthLength
  , jalCal: jalCal
  , j2d: j2d
  , d2j: d2j
  , g2d: g2d
  , d2g: d2g
  , jalaaliToDateObject: jalaaliToDateObject
  , jalaaliWeek: jalaaliWeek
  }

/*
  Jalaali years starting the 33-year rule.
*/
var breaks =  [ -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
  , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
  ]

/*
  Converts a Gregorian date to Jalaali.
*/
function toJalaali(gy, gm, gd) {
  if (Object.prototype.toString.call(gy) === '[object Date]') {
    gd = gy.getDate()
    gm = gy.getMonth() + 1
    gy = gy.getFullYear()
  }
  return d2j(g2d(gy, gm, gd))
}

/*
  Converts a Jalaali date to Gregorian.
*/
function toGregorian(jy, jm, jd) {
  return d2g(j2d(jy, jm, jd))
}

/*
  Checks whether a Jalaali date is valid or not.
*/
function isValidJalaaliDate(jy, jm, jd) {
  return  jy >= -61 && jy <= 3177 &&
          jm >= 1 && jm <= 12 &&
          jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
}

/*
  Is this a leap year or not?
*/
function isLeapJalaaliYear(jy) {
  return jalCalLeap(jy) === 0
}

/*
  Number of days in a given month in a Jalaali year.
*/
function jalaaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  if (isLeapJalaaliYear(jy)) return 30
  return 29
}

/*
    This function determines if the Jalaali (Persian) year is
    leap (366-day long) or is the common year (365 days)

    @param jy Jalaali calendar year (-61 to 3177)
    @returns number of years since the last leap year (0 to 4)
 */
function jalCalLeap(jy) {
  var bl = breaks.length
    , jp = breaks[0]
    , jm
    , jump
    , leap
    , n
    , i

  if (jy < jp || jy >= breaks[bl - 1])
    throw new Error('Invalid Jalaali year ' + jy)

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i]
    jump = jm - jp
    if (jy < jm)
      break
    jp = jm
  }
  n = jy - jp

  if (jump - n < 6)
    n = n - jump + div(jump + 4, 33) * 33
  leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) {
    leap = 4
  }

  return leap
}

/*
  This function determines if the Jalaali (Persian) year is
  leap (366-day long) or is the common year (365 days), and
  finds the day in March (Gregorian calendar) of the first
  day of the Jalaali year (jy).

  @param jy Jalaali calendar year (-61 to 3177)
  @param withoutLeap when don't need leap (true or false) default is false
  @return
    leap: number of years since the last leap year (0 to 4)
    gy: Gregorian year of the beginning of Jalaali year
    march: the March day of Farvardin the 1st (1st day of jy)
  @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
  @see: http://www.fourmilab.ch/documents/calendar/
*/
function jalCal(jy, withoutLeap) {
  var bl = breaks.length
    , gy = jy + 621
    , leapJ = -14
    , jp = breaks[0]
    , jm
    , jump
    , leap
    , leapG
    , march
    , n
    , i

  if (jy < jp || jy >= breaks[bl - 1])
    throw new Error('Invalid Jalaali year ' + jy)

  // Find the limiting years for the Jalaali year jy.
  for (i = 1; i < bl; i += 1) {
    jm = breaks[i]
    jump = jm - jp
    if (jy < jm)
      break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  n = jy - jp

  // Find the number of leap years from AD 621 to the beginning
  // of the current Jalaali year in the Persian calendar.
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4)
    leapJ += 1

  // And the same in the Gregorian calendar (until the year gy).
  leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

  // Determine the Gregorian date of Farvardin the 1st.
  march = 20 + leapJ - leapG

  // return with gy and march when we don't need leap
  if (withoutLeap) return { gy: gy, march: march };


  // Find how many years have passed since the last leap year.
  if (jump - n < 6)
    n = n - jump + div(jump + 4, 33) * 33
  leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) {
    leap = 4
  }

  return  { leap: leap
          , gy: gy
          , march: march
          }
}

/*
  Converts a date of the Jalaali calendar to the Julian Day number.

  @param jy Jalaali year (1 to 3100)
  @param jm Jalaali month (1 to 12)
  @param jd Jalaali day (1 to 29/31)
  @return Julian Day number
*/
function j2d(jy, jm, jd) {
  var r = jalCal(jy, true)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/*
  Converts the Julian Day number to a date in the Jalaali calendar.

  @param jdn Julian Day number
  @return
    jy: Jalaali year (1 to 3100)
    jm: Jalaali month (1 to 12)
    jd: Jalaali day (1 to 29/31)
*/
function d2j(jdn) {
  var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
    , jy = gy - 621
    , r = jalCal(jy, false)
    , jdn1f = g2d(gy, 3, r.march)
    , jd
    , jm
    , k

  // Find number of days that passed since 1 Farvardin.
  k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      // The first 6 months.
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return  { jy: jy
              , jm: jm
              , jd: jd
              }
    } else {
      // The remaining months.
      k -= 186
    }
  } else {
    // Previous Jalaali year.
    jy -= 1
    k += 179
    if (r.leap === 1)
      k += 1
  }
  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return  { jy: jy
          , jm: jm
          , jd: jd
          }
}

/*
  Calculates the Julian Day number from Gregorian or Julian
  calendar dates. This integer number corresponds to the noon of
  the date (i.e. 12 hours of Universal Time).
  The procedure was tested to be good since 1 March, -100100 (of both
  calendars) up to a few million years into the future.

  @param gy Calendar year (years BC numbered 0, -1, -2, ...)
  @param gm Calendar month (1 to 12)
  @param gd Calendar day of the month (1 to 28/29/30/31)
  @return Julian Day number
*/
function g2d(gy, gm, gd) {
  var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
      + div(153 * mod(gm + 9, 12) + 2, 5)
      + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

/*
  Calculates Gregorian and Julian calendar dates from the Julian Day number
  (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
  calendars) to some millions years ahead of the present.

  @param jdn Julian Day number
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
*/
function d2g(jdn) {
  var j
    , i
    , gd
    , gm
    , gy
  j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  i = div(mod(j, 1461), 4) * 5 + 308
  gd = div(mod(i, 153), 5) + 1
  gm = mod(div(i, 153), 12) + 1
  gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return  { gy: gy
          , gm: gm
          , gd: gd
          }
}

/**
 * Return Saturday and Friday day of current week(week start in Saturday)
 * @param {number} jy jalaali year
 * @param {number} jm jalaali month
 * @param {number} jd jalaali day
 * @returns Saturday and Friday of current week
 */
function jalaaliWeek(jy, jm, jd) {
  var dayOfWeek = jalaaliToDateObject(jy, jm, jd).getDay();

  var startDayDifference = dayOfWeek == 6 ? 0 : -(dayOfWeek+1);
  var endDayDifference = 6+startDayDifference;

  return {
    saturday: d2j(j2d(jy, jm, jd+startDayDifference)),
    friday: d2j(j2d(jy, jm, jd+endDayDifference))
  }
}

/**
 * Convert Jalaali calendar dates to javascript Date object
 * @param {number} jy jalaali year
 * @param {number} jm jalaali month
 * @param {number} jd jalaali day
 * @param {number} [h] hours
 * @param {number} [m] minutes
 * @param {number} [s] seconds
 * @param {number} [ms] milliseconds
 * @returns Date object of the jalaali calendar dates
 */
function jalaaliToDateObject(
  jy,
  jm,
  jd,
  h,
  m,
  s,
  ms
) {
  var gregorianCalenderDate = toGregorian(jy, jm, jd);

  return new Date(
    gregorianCalenderDate.gy,
    gregorianCalenderDate.gm - 1,
    gregorianCalenderDate.gd,
    h || 0,
    m || 0,
    s || 0,
    ms || 0
  );
}

/*
  Utility helper functions.
*/

function div(a, b) {
  return ~~(a / b)
}

function mod(a, b) {
  return a - ~~(a / b) * b
}


/***/ }),

/***/ 670:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultFonts = void 0;
exports.saveSelectedFont = saveSelectedFont;
exports.loadSelectedFont = loadSelectedFont;
exports.setCurrentFont = setCurrentFont;
exports.injectFonts = injectFonts;
// Font injection functionality
let fontStyleElement = null;
let observer = null;
let currentFont = "Vazirmatn"; // Default font
// Unicode range constant
const UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF';
// Font options
exports.defaultFonts = [
    { en_name: "Vazirmatn", fa_name: "وزیر متن", creator: "زنده یاد صابر راستی کردار" },
    { en_name: "Sahel", fa_name: "ساحل", creator: "زنده یاد صابر راستی کردار" },
    { en_name: "Parastoo", fa_name: "پرستو", creator: "زنده یاد صابر راستی کردار" }
];
// All fonts CSS
const ALL_FONTS_CSS = `
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
// Convert English digits to Persian digits
function toPersianDigits(input) {
    return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}
// Function to check if text contains Persian/Arabic characters
function containsPersianArabic(text) {
    const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianArabicRegex.test(text);
}
// Process a text node
function processTextNode(node) {
    var _a;
    const text = node.textContent || '';
    if (!containsPersianArabic(text))
        return;
    const container = (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.closest('.notranslate[data-content-editable-leaf="true"]');
    if (!container || container.closest('[data-content-type="code"]'))
        return;
    container.style.fontFamily = `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`;
    container.style.direction = 'rtl';
    container.style.textAlign = 'right';
}
// Process all text nodes in a subtree
function processSubtree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walker.nextNode()) {
        processTextNode(node);
    }
}
// Update numbered list block: convert number to Persian and set RTL
function updateNumberedListBlock(block) {
    const pseudo = block.querySelector('.pseudoBefore');
    if (pseudo) {
        let content = pseudo.style.getPropertyValue('--pseudoBefore--content');
        if (!content)
            content = pseudo.textContent || "";
        content = content.replace(/["']/g, "").trim();
        const persianContent = toPersianDigits(content);
        pseudo.style.removeProperty("--pseudoBefore--content");
        pseudo.textContent = persianContent;
        pseudo.style.direction = 'rtl';
        pseudo.style.textAlign = 'right';
    }
}
// Apply RTL and number conversion for numbered lists
function applyRTLToNumberedLists() {
    document.querySelectorAll(".notion-selectable.notion-numbered_list-block").forEach((block) => {
        if (containsPersianArabic(block.textContent || "")) {
            updateNumberedListBlock(block);
            block.style.direction = 'rtl';
            block.style.textAlign = 'right';
        }
    });
}
// Apply RTL adjustments for quote blocks
function applyRTLToQuotes() {
    document.querySelectorAll(".notion-quote-block").forEach((block) => {
        if (containsPersianArabic(block.textContent || "")) {
            const bq = block.querySelector("blockquote");
            if (bq) {
                const inner = bq.querySelector("div[style*='border-left']");
                if (inner) {
                    const computed = window.getComputedStyle(inner);
                    const originalPaddingLeft = computed.paddingLeft;
                    const originalPaddingRight = computed.paddingRight;
                    inner.style.borderLeft = "none";
                    inner.style.borderRight = "3px solid currentcolor";
                    inner.style.paddingLeft = originalPaddingRight;
                    inner.style.paddingRight = originalPaddingLeft;
                }
                bq.style.direction = "rtl";
                bq.style.textAlign = "right";
            }
        }
    });
}
// Apply RTL adjustments for toggle blocks, including moving the toggle button to the right
function applyRTLToToggleBlocks() {
    document.querySelectorAll(".notion-selectable.notion-toggle-block").forEach((block) => {
        if (containsPersianArabic(block.textContent || "")) {
            const toggleBlock = block;
            // toggleBlock.style.direction = "rtl";
            toggleBlock.style.textAlign = "right";
            // Ensure the container reverses the order with important flag to override inline styles
            const flexContainer = toggleBlock.firstElementChild;
            if (flexContainer) {
                flexContainer.style.setProperty("flex-direction", "row-reverse", "important");
            }
        }
    });
}
// Additional RTL logic for blocks
function applyAdditionalRTLLogic() {
    document.querySelectorAll(".notion-selectable.notion-bulleted_list-block").forEach((block) => {
        block.setAttribute("dir", "rtl");
    });
    document.querySelectorAll(".notion-table-block").forEach((block) => {
        if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
            block.setAttribute("dir", "rtl");
        }
    });
    document.querySelectorAll(".notion-to_do-block").forEach((block) => {
        if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
            block.setAttribute("dir", "rtl");
        }
    });
}
// New parts RTL logic for headers, table cells, header cells, etc.
function applyRTLToNewParts() {
    const selectors = ".notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6, " +
        ".notion-table-view th, .notion-table-view td, .notion-collection_view-block div[data-content-editable-void='true'] > div:nth-child(2), " +
        ".notion-table-view-header-cell, .notion-table-view-cell";
    document.querySelectorAll(selectors).forEach((el) => {
        if (containsPersianArabic(el.textContent || "")) {
            const element = el;
            element.style.direction = "rtl";
            element.style.textAlign = "right";
            element.style.fontFamily = `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`;
        }
    });
}
// Global font style for main Notion elements
function applyGlobalFontStyles() {
    const selectors = [
        ".notion-page-content",
        ".notion-table-view",
        ".notion-board-view",
        ".notion-gallery-view",
        ".notion-page-block",
        ".notion-topbar",
        ".notion-body",
        ".notion-selectable",
        ".notion-collection_view-block",
        ".notion-frame",
        ".notion-collection-item"
    ].join(", ");
    document.querySelectorAll(selectors).forEach((el) => {
        el.style.setProperty("font-family", `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`, "important");
    });
}
// Setup the observer
function setupObserver() {
    if (observer)
        return;
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE)
                        processSubtree(node);
                });
            }
            else if (mutation.type === 'characterData') {
                processTextNode(mutation.target);
            }
        }
        applyAdditionalRTLLogic();
        applyGlobalFontStyles();
        applyRTLToNewParts();
        applyRTLToNumberedLists();
        applyRTLToQuotes();
        applyRTLToToggleBlocks();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    processSubtree(document.body);
    applyAdditionalRTLLogic();
    applyGlobalFontStyles();
    applyRTLToNewParts();
    applyRTLToNumberedLists();
    applyRTLToQuotes();
    applyRTLToToggleBlocks();
}
// Cleanup the observer
function cleanupObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}
// Save the selected font to storage
function saveSelectedFont(fontFamily) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ selectedFont: fontFamily }, () => resolve());
    });
}
// Load the selected font from storage
function loadSelectedFont() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['selectedFont'], (result) => resolve(result.selectedFont || 'Vazirmatn'));
    });
}
// Set the current font
function setCurrentFont(fontFamily) {
    currentFont = fontFamily;
    if (fontStyleElement) {
        document.querySelectorAll('.notranslate[data-content-editable-leaf="true"]').forEach((el) => {
            const element = el;
            if (containsPersianArabic(element.textContent || '')) {
                element.style.fontFamily = `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`;
            }
        });
    }
    applyGlobalFontStyles();
    applyRTLToNewParts();
    applyRTLToNumberedLists();
    applyRTLToQuotes();
    applyRTLToToggleBlocks();
}
// Inject or remove font styles and observer
function injectFonts(enabled) {
    if (enabled) {
        loadSelectedFont().then((fontFamily) => {
            currentFont = fontFamily;
            if (!fontStyleElement) {
                fontStyleElement = document.createElement('style');
                fontStyleElement.textContent = ALL_FONTS_CSS;
                document.head.appendChild(fontStyleElement);
            }
            setupObserver();
        });
    }
    else {
        if (fontStyleElement) {
            fontStyleElement.remove();
            fontStyleElement = null;
        }
        // Reset all text content elements
        document.querySelectorAll('.notranslate[data-content-editable-leaf="true"]').forEach((el) => {
            const element = el;
            element.style.fontFamily = '';
            element.style.direction = '';
            element.style.textAlign = '';
        });
        // Reset global font styles
        const globalSelectors = [
            ".notion-page-content",
            ".notion-table-view",
            ".notion-board-view",
            ".notion-gallery-view",
            ".notion-page-block",
            ".notion-topbar",
            ".notion-body",
            ".notion-selectable",
            ".notion-collection_view-block",
            ".notion-frame",
            ".notion-collection-item"
        ].join(", ");
        document.querySelectorAll(globalSelectors).forEach((el) => {
            el.style.removeProperty("font-family");
        });
        // Reset heading and table elements
        const rtlSelectors = ".notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6, " +
            ".notion-table-view th, .notion-table-view td, .notion-collection_view-block div[data-content-editable-void='true'] > div:nth-child(2), " +
            ".notion-table-view-header-cell, .notion-table-view-cell";
        document.querySelectorAll(rtlSelectors).forEach((el) => {
            const element = el;
            element.style.direction = '';
            element.style.textAlign = '';
            element.style.fontFamily = '';
        });
        // Reset numbered lists
        document.querySelectorAll(".notion-selectable.notion-numbered_list-block").forEach((block) => {
            block.style.direction = '';
            block.style.textAlign = '';
            const pseudo = block.querySelector('.pseudoBefore');
            if (pseudo) {
                pseudo.style.direction = '';
                pseudo.style.textAlign = '';
            }
        });
        // Reset quotes
        document.querySelectorAll(".notion-quote-block").forEach((block) => {
            const bq = block.querySelector("blockquote");
            if (bq) {
                const inner = bq.querySelector("div[style*='border-right']");
                if (inner) {
                    inner.style.borderRight = "none";
                    inner.style.borderLeft = "3px solid currentcolor";
                    inner.style.paddingLeft = "";
                    inner.style.paddingRight = "";
                }
                bq.style.direction = "";
                bq.style.textAlign = "";
            }
        });
        // Reset toggle blocks
        document.querySelectorAll(".notion-selectable.notion-toggle-block").forEach((block) => {
            const toggleBlock = block;
            toggleBlock.style.textAlign = "";
            const flexContainer = toggleBlock.firstElementChild;
            if (flexContainer) {
                flexContainer.style.removeProperty("flex-direction");
            }
        });
        // Reset additional RTL elements
        document.querySelectorAll(".notion-selectable.notion-bulleted_list-block, .notion-table-block, .notion-to_do-block").forEach((block) => {
            block.removeAttribute("dir");
        });
        cleanupObserver();
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const convertTable_1 = __webpack_require__(167);
const convertNotif_1 = __webpack_require__(45);
const fontInjection_1 = __webpack_require__(670);
// Track if Persian mode is enabled
let persianInput = false;
// Track if font injection is enabled
let fontInjectionEnabled = false;
// Flag to prevent multiple simultaneous conversions
let isProcessingDate = false;
// Debounce timer for mutation events
let debounceTimer = null;
// Initialize from storage
chrome.storage.sync.get(["persianInput", "fontInjectionEnabled"], d => {
    console.log("mtlog: Initial state loaded", d);
    persianInput = !!d.persianInput;
    fontInjectionEnabled = !!d.fontInjectionEnabled;
    // Initial conversion if enabled
    if (persianInput) {
        setTimeout(() => {
            convertDates();
        }, 500); // Short delay to let Notion render fully
    }
    // Apply font injection if enabled
    (0, fontInjection_1.injectFonts)(fontInjectionEnabled);
});
// Message handler for popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "applySettings" && msg.data) {
        persianInput = !!msg.data.persianInput;
        fontInjectionEnabled = !!msg.data.fontInjectionEnabled;
        if (msg.data.selectedFont)
            (0, fontInjection_1.setCurrentFont)(msg.data.selectedFont);
        // Apply font injection based on current setting
        (0, fontInjection_1.injectFonts)(fontInjectionEnabled);
        // Process dates if Persian input is enabled
        if (persianInput)
            convertDates();
        return;
    }
    console.log("mtlog: Received message", msg);
    // Handle enable/disable toggle
    if (msg.persianInput !== undefined) {
        persianInput = msg.persianInput;
        console.log("mtlog: Persian input set to", persianInput);
        // Process immediately
        convertDates();
    }
    // Handle font injection toggle
    if (msg.fontInjectionEnabled !== undefined) {
        fontInjectionEnabled = msg.fontInjectionEnabled;
        console.log("mtlog: Font injection set to", fontInjectionEnabled);
        // Apply font injection
        (0, fontInjection_1.injectFonts)(fontInjectionEnabled);
    }
    // Handle font selection change
    if (msg.selectedFont) {
        console.log("mtlog: Font selection changed to", msg.selectedFont);
        // Update the current font
        (0, fontInjection_1.setCurrentFont)(msg.selectedFont);
    }
    // Handle error check request
    if (msg.checkErrors) {
        const errorCount = (0, convertTable_1.getErrorCount)();
        console.log("mtlog: Returning error count", errorCount);
        sendResponse({ errorCount });
        return true; // Keep channel open
    }
    // Handle reset request
    if (msg.refreshConversion) {
        console.log("mtlog: Reset requested");
        // Reset all dates
        const resetCount = (0, convertTable_1.resetAllConversions)();
        // Reset all date mentions
        const resetMentionCount = (0, convertNotif_1.resetDateMentions)();
        const totalResetCount = resetCount + resetMentionCount;
        // Handle page reload if requested
        if (msg.forceReload) {
            chrome.runtime.sendMessage({
                resetComplete: true,
                count: totalResetCount,
                reloading: true
            });
            // Reload the page
            window.location.reload();
            return true;
        }
        // Wait a moment and report completion
        setTimeout(() => {
            if (persianInput) {
                convertDates();
            }
            chrome.runtime.sendMessage({
                resetComplete: true,
                count: totalResetCount
            });
        }, 500);
        return true; // Keep channel open
    }
    return false;
});
// Main conversion function
function convertDates() {
    if (isProcessingDate) {
        console.log("mtlog: Already processing, skipping");
        return;
    }
    isProcessingDate = true;
    try {
        console.log("mtlog: Converting dates, mode:", persianInput ? "Persian" : "Gregorian");
        // Step 1: Convert table property dates
        const tableCount = (0, convertTable_1.convertTable)(persianInput);
        // Step 2: Convert date mentions/reminders
        const mentionCount = (0, convertNotif_1.convertDateMentions)(persianInput);
        const totalCount = tableCount + mentionCount;
        // Report errors if any
        const errorCount = (0, convertTable_1.getErrorCount)();
        if (errorCount > 0) {
            chrome.runtime.sendMessage({
                errorCountChanged: true,
                errorCount
            });
        }
        console.log(`mtlog: Processed ${totalCount} dates (${tableCount} table dates, ${mentionCount} mentions)`);
    }
    finally {
        isProcessingDate = false;
    }
}
// Listen for user interactions that might change dates
function setupEventListeners() {
    // Date picker interactions
    document.addEventListener("click", (e) => {
        var _a, _b, _c, _d;
        if (!persianInput)
            return;
        const target = e.target;
        // Handle clicks on date picker elements
        if (target.matches("button[name='day']") ||
            target.closest("button[name='previous-month']") ||
            target.closest("button[name='next-month']") ||
            (target.closest("[role='button']") &&
                (((_a = target.textContent) === null || _a === void 0 ? void 0 : _a.includes("Date format")) || ((_b = target.textContent) === null || _b === void 0 ? void 0 : _b.includes("Clear"))))) {
            console.log("mtlog: Date picker interaction detected");
            // Delay to let Notion update the date
            setTimeout(convertDates, 300);
        }
        // Handle date mention creation (when clicking @ and selecting 'Date')
        if (target.closest('.notion-selectable') &&
            (((_c = target.textContent) === null || _c === void 0 ? void 0 : _c.includes('@Date')) ||
                ((_d = target.textContent) === null || _d === void 0 ? void 0 : _d.includes('@Reminder')))) {
            console.log("mtlog: Date mention interaction detected");
            // Wait a bit longer for Notion to create the date mention
            setTimeout(convertDates, 800);
        }
    });
    // Date field input events
    document.addEventListener("input", (e) => {
        if (!persianInput)
            return;
        const target = e.target;
        if (target.closest("[data-testid='property-value']") ||
            target.tagName === "INPUT" && target.closest(".rdp")) {
            console.log("mtlog: Date field input detected");
            // Debounce multiple rapid inputs
            if (debounceTimer)
                clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(convertDates, 300);
        }
    });
}
// Setup MutationObserver to detect date changes in the DOM
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        // Skip if disabled, already making changes, or just processed
        if (!persianInput || (0, convertTable_1.isCurrentlyMakingChanges)() || (0, convertTable_1.wasRecentlyProcessed)(500)) {
            return;
        }
        // Check if any mutations are related to dates
        const hasDateChanges = mutations.some(mutation => {
            // Text changes
            if (mutation.type === 'characterData' &&
                mutation.target.nodeType === Node.TEXT_NODE &&
                mutation.target.textContent) {
                return true;
            }
            // Element changes in date fields
            if (mutation.type === 'childList' &&
                mutation.target instanceof HTMLElement &&
                (mutation.target.closest("[data-testid='property-value']") ||
                    mutation.target.closest(".notion-date") ||
                    mutation.target.closest(".notion-reminder") ||
                    mutation.target.closest(".rdp"))) {
                return true;
            }
            return false;
        });
        if (hasDateChanges) {
            console.log("mtlog: Date changes detected by observer");
            // Debounce to avoid repeated conversions
            if (debounceTimer)
                clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(convertDates, 300);
        }
    });
    // Start observing document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}
// Setup error reporting to popup
function setupErrorReporting() {
    setInterval(() => {
        if (!persianInput)
            return;
        const errorCount = (0, convertTable_1.getErrorCount)();
        if (errorCount > 0) {
            chrome.runtime.sendMessage({
                errorCountChanged: true,
                errorCount
            }, () => {
                // Ignore errors - popup might not be open
            });
        }
    }, 5000);
}
// Initialize all event listeners and observers
setupEventListeners();
setupMutationObserver();
setupErrorReporting();

})();

/******/ })()
;
//# sourceMappingURL=content.js.map