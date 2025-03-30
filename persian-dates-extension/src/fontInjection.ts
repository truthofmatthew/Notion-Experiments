import { UNICODE_RANGE, DEFAULT_FONTS, ALL_FONTS_CSS, SELECTOR_EDITABLE_TEXT, SELECTOR_CODE_BLOCK, SELECTOR_NUMBERED_LIST, SELECTOR_QUOTE_BLOCK, SELECTOR_TOGGLE_BLOCK, SELECTOR_BULLETED_LIST, SELECTOR_TABLE_BLOCK, SELECTOR_TODO_BLOCK, SELECTOR_RTL_ELEMENTS, SELECTOR_GLOBAL_FONTS, DEFAULT_FONT, SYSTEM_FONTS, STORAGE_KEYS } from "./constant";

let fontStyleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let currentFont: string = DEFAULT_FONT;

function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function containsPersianArabic(text: string): boolean {
  const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianArabicRegex.test(text);
}

function processTextNode(node: Text): void {
  const text = node.textContent || '';
  if (!containsPersianArabic(text)) return;
  const container = node.parentElement?.closest(SELECTOR_EDITABLE_TEXT) as HTMLElement;
  if (!container || container.closest(SELECTOR_CODE_BLOCK)) return;
  container.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';
}

function processSubtree(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text)) processTextNode(node);
}

function updateNumberedListBlock(block: Element): void {
  const pseudo = block.querySelector('.pseudoBefore') as HTMLElement | null;
  if (pseudo) {
    let content = pseudo.style.getPropertyValue('--pseudoBefore--content') || pseudo.textContent || "";
    content = content.replace(/["']/g, "").trim();
    const persianContent = toPersianDigits(content);
    pseudo.style.removeProperty("--pseudoBefore--content");
    pseudo.textContent = persianContent;
    pseudo.style.direction = 'rtl';
    pseudo.style.textAlign = 'right';
  }
}

function applyRTLToNumberedLists(): void {
  document.querySelectorAll(SELECTOR_NUMBERED_LIST).forEach((block: Element) => {
    if (containsPersianArabic(block.textContent || "")) {
      updateNumberedListBlock(block);
      (block as HTMLElement).style.direction = 'rtl';
      (block as HTMLElement).style.textAlign = 'right';
    }
  });
}

function applyRTLToQuotes(): void {
  document.querySelectorAll(SELECTOR_QUOTE_BLOCK).forEach((block: Element) => {
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

function applyRTLToToggleBlocks(): void {
  document.querySelectorAll(SELECTOR_TOGGLE_BLOCK).forEach((block: Element) => {
    if (containsPersianArabic(block.textContent || "")) {
      const toggleBlock = block as HTMLElement;
      toggleBlock.style.textAlign = "right";
      const flexContainer = toggleBlock.firstElementChild as HTMLElement | null;
      if (flexContainer) flexContainer.style.setProperty("flex-direction", "row-reverse", "important");
    }
  });
}

function applyAdditionalRTLLogic(): void {
  document.querySelectorAll(SELECTOR_BULLETED_LIST).forEach((block: Element) => {
    (block as HTMLElement).setAttribute("dir", "rtl");
  });
  document.querySelectorAll(SELECTOR_TABLE_BLOCK).forEach((block: Element) => {
    if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
      (block as HTMLElement).setAttribute("dir", "rtl");
    }
  });
  document.querySelectorAll(SELECTOR_TODO_BLOCK).forEach((block: Element) => {
    if (Array.from(block.querySelectorAll("*")).some(el => containsPersianArabic(el.textContent || ""))) {
      (block as HTMLElement).setAttribute("dir", "rtl");
    }
  });
}

function applyRTLToNewParts(): void {
  document.querySelectorAll(SELECTOR_RTL_ELEMENTS).forEach((el: Element) => {
    if (containsPersianArabic(el.textContent || "")) {
      const element = el as HTMLElement;
      element.style.direction = "rtl";
      element.style.textAlign = "right";
      element.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
    }
  });
}

function applyGlobalFontStyles(): void {
  document.querySelectorAll(SELECTOR_GLOBAL_FONTS).forEach((el: Element) => {
    (el as HTMLElement).style.setProperty("font-family", `${currentFont}, ${SYSTEM_FONTS}`, "important");
  });
}

function setupObserver(): void {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) processSubtree(node); });
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

function cleanupObserver(): void {
  if (observer) { observer.disconnect(); observer = null; }
}

export function saveSelectedFont(fontFamily: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.SELECTED_FONT]: fontFamily }, () => resolve());
  });
}

export function loadSelectedFont(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.SELECTED_FONT], (result) => resolve(result[STORAGE_KEYS.SELECTED_FONT] || DEFAULT_FONT));
  });
}

export function setCurrentFont(fontFamily: string): void {
  currentFont = fontFamily;
  if (fontStyleElement) {
    document.querySelectorAll(SELECTOR_EDITABLE_TEXT).forEach((el: Element) => {
      const element = el as HTMLElement;
      if (containsPersianArabic(element.textContent || '')) {
        element.style.fontFamily = `${currentFont}, ${SYSTEM_FONTS}`;
      }
    });
  }
  applyGlobalFontStyles();
  applyRTLToNewParts();
  applyRTLToNumberedLists();
  applyRTLToQuotes();
  applyRTLToToggleBlocks();
}

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

    document.querySelectorAll(SELECTOR_EDITABLE_TEXT).forEach((el: Element) => {
      const element = el as HTMLElement;
      element.style.fontFamily = '';
      element.style.direction = '';
      element.style.textAlign = '';
    });

    document.querySelectorAll(SELECTOR_GLOBAL_FONTS).forEach((el: Element) => {
      (el as HTMLElement).style.removeProperty("font-family");
    });

    document.querySelectorAll(SELECTOR_RTL_ELEMENTS).forEach((el: Element) => {
      const element = el as HTMLElement;
      element.style.direction = '';
      element.style.textAlign = '';
      element.style.fontFamily = '';
    });

    document.querySelectorAll(SELECTOR_NUMBERED_LIST).forEach((block: Element) => {
      (block as HTMLElement).style.direction = '';
      (block as HTMLElement).style.textAlign = '';
      const pseudo = block.querySelector('.pseudoBefore') as HTMLElement | null;
      if (pseudo) {
        pseudo.style.direction = '';
        pseudo.style.textAlign = '';
      }
    });

    document.querySelectorAll(SELECTOR_QUOTE_BLOCK).forEach((block: Element) => {
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

    document.querySelectorAll(SELECTOR_TOGGLE_BLOCK).forEach((block: Element) => {
      const toggleBlock = block as HTMLElement;
      toggleBlock.style.textAlign = "";
      const flexContainer = toggleBlock.firstElementChild as HTMLElement | null;
      if (flexContainer) flexContainer.style.removeProperty("flex-direction");
    });

    document.querySelectorAll(`${SELECTOR_BULLETED_LIST}, ${SELECTOR_TABLE_BLOCK}, ${SELECTOR_TODO_BLOCK}`).forEach((block: Element) => {
      (block as HTMLElement).removeAttribute("dir");
    });

    cleanupObserver();
  }
}