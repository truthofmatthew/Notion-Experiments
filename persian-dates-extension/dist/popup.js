/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 452:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadState = loadState;
const ui_1 = __webpack_require__(499);
const events_1 = __webpack_require__(968);
function loadState() {
    chrome.storage.sync.get(["persianInput", "fontInjectionEnabled", "selectedFont"], data => {
        ui_1.persianToggle.checked = !!data.persianInput;
        ui_1.fontToggle.checked = !!data.fontInjectionEnabled;
        if (data.fontInjectionEnabled) {
            ui_1.fontSelectorContainer.classList.add('visible');
        }
        else {
            ui_1.fontSelectorContainer.classList.remove('visible');
        }
        if (data.selectedFont) {
            ui_1.fontSelector.value = data.selectedFont;
            //   updateFontAuthor();
        }
        if (data.persianInput) {
            (0, events_1.checkForErrors)();
        }
    });
}


/***/ }),

/***/ 499:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.statusEl = exports.fontAuthor = exports.fontSelector = exports.fontSelectorContainer = exports.errorMessageEl = exports.resetButton = exports.fontToggle = exports.persianToggle = void 0;
exports.initFontSelector = initFontSelector;
exports.updateFontAuthor = updateFontAuthor;
exports.updateStatus = updateStatus;
exports.showErrorMessage = showErrorMessage;
const fontInjection_1 = __webpack_require__(670);
exports.persianToggle = document.getElementById('persian-toggle');
exports.fontToggle = document.getElementById('font-toggle');
exports.resetButton = document.getElementById('reset-button');
exports.errorMessageEl = document.getElementById('error-message');
exports.fontSelectorContainer = document.getElementById('font-selector-container');
exports.fontSelector = document.getElementById('font-selector');
exports.fontAuthor = document.getElementById('font-author');
exports.statusEl = document.getElementById('status'); // if used
function initFontSelector() {
    exports.fontSelector.innerHTML = '';
    fontInjection_1.defaultFonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.en_name;
        option.textContent = font.fa_name;
        option.dataset.author = font.creator;
        exports.fontSelector.appendChild(option);
    });
    //   updateFontAuthor();
}
function updateFontAuthor() {
    const selectedOption = exports.fontSelector.options[exports.fontSelector.selectedIndex];
    exports.fontAuthor.textContent = (selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.dataset.author) ? `By: ${selectedOption.dataset.author}` : '';
}
function updateStatus(message) {
    if (exports.statusEl)
        exports.statusEl.textContent = message;
}
function showErrorMessage(count) {
    exports.errorMessageEl.style.display = 'block';
    exports.errorMessageEl.innerHTML = `
    <p>⚠️ ${count} conversion errors detected!</p>
    <p>Some dates might be displaying incorrectly. Try the "Reset All Dates" button to fix.</p>
  `;
}


/***/ }),

/***/ 670:
/***/ ((__unused_webpack_module, exports) => {


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


/***/ }),

/***/ 968:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initListeners = initListeners;
exports.checkForErrors = checkForErrors;
const ui_1 = __webpack_require__(499);
const fontInjection_1 = __webpack_require__(670);
let altKeyPressed = false;
function initListeners() {
    ui_1.persianToggle.addEventListener("change", () => {
        const enabled = ui_1.persianToggle.checked;
        chrome.storage.sync.set({ persianInput: enabled });
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            var _a;
            if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
                chrome.tabs.sendMessage(tabs[0].id, { persianInput: enabled });
            }
        });
        if (!enabled) {
            ui_1.errorMessageEl.style.display = 'none';
        }
        else {
            setTimeout(checkForErrors, 1000);
        }
    });
    ui_1.fontToggle.addEventListener('change', () => {
        const enabled = ui_1.fontToggle.checked;
        chrome.storage.sync.set({ fontInjectionEnabled: enabled });
        if (enabled) {
            ui_1.fontSelectorContainer.classList.add('visible');
        }
        else {
            ui_1.fontSelectorContainer.classList.remove('visible');
        }
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            var _a;
            if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
                chrome.tabs.sendMessage(tabs[0].id, { fontInjectionEnabled: enabled });
            }
        });
    });
    ui_1.fontSelector.addEventListener('change', () => {
        const selectedFont = ui_1.fontSelector.value;
        // updateFontAuthor();
        (0, fontInjection_1.saveSelectedFont)(selectedFont).then(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                var _a;
                if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { selectedFont });
                }
            });
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
            altKeyPressed = true;
            ui_1.resetButton.textContent = "Force Reload Page";
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Alt') {
            altKeyPressed = false;
            ui_1.resetButton.textContent = "Reset All Dates";
        }
    });
    //   resetButton.addEventListener("click", () => {
    //     const forceReload = altKeyPressed;
    //     resetButton.disabled = true;
    //     errorMessageEl.style.display = 'none';
    //     chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    //       if (tabs[0]?.id) {
    //         chrome.tabs.sendMessage(tabs[0].id, { 
    //           refreshConversion: true,
    //           forceReload
    //         }, () => {
    //           if (chrome.runtime.lastError) {
    //             resetButton.disabled = false;
    //           }
    //           if (forceReload) {
    //             window.close();
    //           }
    //         });
    //       } else {
    //         resetButton.disabled = false;
    //       }
    //     });
    //   });
    chrome.runtime.onMessage.addListener((message) => {
        if (message.resetComplete) {
            if (!message.reloading) {
                ui_1.resetButton.disabled = false;
                setTimeout(checkForErrors, 500);
            }
        }
        if (message.errorCountChanged !== undefined) {
            if (message.errorCount > 0) {
                (0, ui_1.showErrorMessage)(message.errorCount);
            }
            else {
                ui_1.errorMessageEl.style.display = 'none';
            }
        }
    });
}
function checkForErrors() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var _a;
        if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
            chrome.tabs.sendMessage(tabs[0].id, { checkErrors: true }, (response) => {
                if (chrome.runtime.lastError)
                    return;
                if (response && response.errorCount > 0) {
                    (0, ui_1.showErrorMessage)(response.errorCount);
                }
                else {
                    ui_1.errorMessageEl.style.display = 'none';
                }
            });
        }
    });
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
// This entry needs to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const ui_1 = __webpack_require__(499);
const events_1 = __webpack_require__(968);
const state_1 = __webpack_require__(452);
(0, ui_1.initFontSelector)();
(0, state_1.loadState)();
(0, events_1.initListeners)();

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map