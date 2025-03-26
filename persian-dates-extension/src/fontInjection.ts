// Font injection functionality
let fontStyleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let currentFont: string = "Vazirmatn"; // Default font

// Unicode range constant
const UNICODE_RANGE = 'U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF';

// Font options
export const defaultFonts = [
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
function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

// Function to check if text contains Persian/Arabic characters
function containsPersianArabic(text: string): boolean {
  const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianArabicRegex.test(text);
}

// Process a text node
function processTextNode(node: Text): void {
  const text = node.textContent || '';
  if (!containsPersianArabic(text)) return;
  const container = node.parentElement?.closest('.notranslate[data-content-editable-leaf="true"]') as HTMLElement;
  if (!container || container.closest('[data-content-type="code"]')) return;
  container.style.fontFamily = `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`;
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';
}

// Process all text nodes in a subtree
function processSubtree(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while (node = walker.nextNode() as Text) {
    processTextNode(node);
  }
}

// Update numbered list block: convert number to Persian and set RTL
function updateNumberedListBlock(block: Element): void {
  const pseudo = block.querySelector('.pseudoBefore') as HTMLElement | null;
  if (pseudo) {
    let content = pseudo.style.getPropertyValue('--pseudoBefore--content');
    if (!content) content = pseudo.textContent || "";
    content = content.replace(/["']/g, "").trim();
    const persianContent = toPersianDigits(content);
    pseudo.style.removeProperty("--pseudoBefore--content");
    pseudo.textContent = persianContent;
    pseudo.style.direction = 'rtl';
    pseudo.style.textAlign = 'right';
  }
}

// Apply RTL and number conversion for numbered lists
function applyRTLToNumberedLists(): void {
  document.querySelectorAll(".notion-selectable.notion-numbered_list-block").forEach((block: Element) => {
    if (containsPersianArabic(block.textContent || "")) {
      updateNumberedListBlock(block);
      (block as HTMLElement).style.direction = 'rtl';
      (block as HTMLElement).style.textAlign = 'right';
    }
  });
}

// Apply RTL adjustments for quote blocks
function applyRTLToQuotes(): void {
  document.querySelectorAll(".notion-quote-block").forEach((block: Element) => {
    if (containsPersianArabic(block.textContent || "")) {
      const bq = block.querySelector("blockquote") as HTMLElement | null;
      if (bq) {
        const inner = bq.querySelector("div[style*='border-left']") as HTMLElement | null;
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
function applyRTLToToggleBlocks(): void {
  document.querySelectorAll(".notion-selectable.notion-toggle-block").forEach((block: Element) => {
    if (containsPersianArabic(block.textContent || "")) {
      const toggleBlock = block as HTMLElement;
      // toggleBlock.style.direction = "rtl";
      toggleBlock.style.textAlign = "right";
      // Ensure the container reverses the order with important flag to override inline styles
      const flexContainer = toggleBlock.firstElementChild as HTMLElement | null;
      if (flexContainer) {
        flexContainer.style.setProperty("flex-direction", "row-reverse", "important");
      }
    }
  });
}

// Additional RTL logic for blocks
function applyAdditionalRTLLogic(): void {
  document.querySelectorAll(".notion-selectable.notion-bulleted_list-block").forEach((block: Element) => {
    (block as HTMLElement).setAttribute("dir", "rtl");
  });
  document.querySelectorAll(".notion-table-block").forEach((block: Element) => {
    if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
      (block as HTMLElement).setAttribute("dir", "rtl");
    }
  });
  document.querySelectorAll(".notion-to_do-block").forEach((block: Element) => {
    if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
      (block as HTMLElement).setAttribute("dir", "rtl");
    }
  });
}

// New parts RTL logic for headers, table cells, header cells, etc.
function applyRTLToNewParts(): void {
  const selectors = ".notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6, " +
    ".notion-table-view th, .notion-table-view td, .notion-collection_view-block div[data-content-editable-void='true'] > div:nth-child(2), " +
    ".notion-table-view-header-cell, .notion-table-view-cell";
  document.querySelectorAll(selectors).forEach((el: Element) => {
    if (containsPersianArabic(el.textContent || "")) {
      const element = el as HTMLElement;
      element.style.direction = "rtl";
      element.style.textAlign = "right";
      element.style.fontFamily = `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`;
    }
  });
}

// Global font style for main Notion elements
function applyGlobalFontStyles(): void {
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
  document.querySelectorAll(selectors).forEach((el: Element) => {
    (el as HTMLElement).style.setProperty("font-family", `"${currentFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif`, "important");
  });
}

// Setup the observer
function setupObserver(): void {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) processSubtree(node);
        });
      } else if (mutation.type === 'characterData') {
        processTextNode(mutation.target as Text);
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
function cleanupObserver(): void {
  if (observer) { observer.disconnect(); observer = null; }
}

// Save the selected font to storage
export function saveSelectedFont(fontFamily: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ selectedFont: fontFamily }, () => resolve());
  });
}

// Load the selected font from storage
export function loadSelectedFont(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['selectedFont'], (result) => resolve(result.selectedFont || 'Vazirmatn'));
  });
}

// Set the current font
export function setCurrentFont(fontFamily: string): void {
  currentFont = fontFamily;
  if (fontStyleElement) {
    document.querySelectorAll('.notranslate[data-content-editable-leaf="true"]').forEach((el: Element) => {
      const element = el as HTMLElement;
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
export function injectFonts(enabled: boolean): void {
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
  } else {
    if (fontStyleElement) { fontStyleElement.remove(); fontStyleElement = null; }
    
    // Reset all text content elements
    document.querySelectorAll('.notranslate[data-content-editable-leaf="true"]').forEach((el: Element) => {
      const element = el as HTMLElement;
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
    
    document.querySelectorAll(globalSelectors).forEach((el: Element) => {
      (el as HTMLElement).style.removeProperty("font-family");
    });
    
    // Reset heading and table elements
    const rtlSelectors = ".notion-body h1, .notion-body h2, .notion-body h3, .notion-body h4, .notion-body h5, .notion-body h6, " +
      ".notion-table-view th, .notion-table-view td, .notion-collection_view-block div[data-content-editable-void='true'] > div:nth-child(2), " +
      ".notion-table-view-header-cell, .notion-table-view-cell";
    
    document.querySelectorAll(rtlSelectors).forEach((el: Element) => {
      const element = el as HTMLElement;
      element.style.direction = '';
      element.style.textAlign = '';
      element.style.fontFamily = '';
    });
    
    // Reset numbered lists
    document.querySelectorAll(".notion-selectable.notion-numbered_list-block").forEach((block: Element) => {
      (block as HTMLElement).style.direction = '';
      (block as HTMLElement).style.textAlign = '';
      
      const pseudo = block.querySelector('.pseudoBefore') as HTMLElement | null;
      if (pseudo) {
        pseudo.style.direction = '';
        pseudo.style.textAlign = '';
      }
    });
    
    // Reset quotes
    document.querySelectorAll(".notion-quote-block").forEach((block: Element) => {
      const bq = block.querySelector("blockquote") as HTMLElement | null;
      if (bq) {
        const inner = bq.querySelector("div[style*='border-right']") as HTMLElement | null;
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
    document.querySelectorAll(".notion-selectable.notion-toggle-block").forEach((block: Element) => {
      const toggleBlock = block as HTMLElement;
      toggleBlock.style.textAlign = "";
      
      const flexContainer = toggleBlock.firstElementChild as HTMLElement | null;
      if (flexContainer) {
        flexContainer.style.removeProperty("flex-direction");
      }
    });
    
    // Reset additional RTL elements
    document.querySelectorAll(".notion-selectable.notion-bulleted_list-block, .notion-table-block, .notion-to_do-block").forEach((block: Element) => {
      (block as HTMLElement).removeAttribute("dir");
    });
    
    cleanupObserver();
  }
}
