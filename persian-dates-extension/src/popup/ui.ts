import { DEFAULT_FONTS, UI_ELEMENTS } from "../constant";

export const persianToggle = document.getElementById(UI_ELEMENTS.PERSIAN_TOGGLE) as HTMLInputElement;
export const fontToggle = document.getElementById(UI_ELEMENTS.FONT_TOGGLE) as HTMLInputElement;
export const resetButton = document.getElementById(UI_ELEMENTS.RESET_BUTTON) as HTMLButtonElement;
export const errorMessageEl = document.getElementById(UI_ELEMENTS.ERROR_MESSAGE) as HTMLDivElement;
export const fontSelectorContainer = document.getElementById(UI_ELEMENTS.FONT_SELECTOR_CONTAINER) as HTMLDivElement;
export const fontSelector = document.getElementById(UI_ELEMENTS.FONT_SELECTOR) as HTMLSelectElement;
export const fontAuthor = document.getElementById(UI_ELEMENTS.FONT_AUTHOR) as HTMLDivElement;
export const statusEl = document.getElementById(UI_ELEMENTS.STATUS) as HTMLDivElement;

export function initFontSelector() {
  fontSelector.innerHTML = '';
  DEFAULT_FONTS.forEach(font => {
    const option = document.createElement('option');
    option.value = font.en_name;
    option.textContent = font.fa_name;
    option.dataset.author = font.creator;
    fontSelector.appendChild(option);
  });
}

export function updateFontAuthor() {
  const selectedOption = fontSelector.options[fontSelector.selectedIndex];
  fontAuthor.textContent = selectedOption?.dataset.author ? `By: ${selectedOption.dataset.author}` : '';
}

export function updateStatus(message: string) {
  if (statusEl) statusEl.textContent = message;
}

export function showErrorMessage(count: number) {
  errorMessageEl.style.display = 'block';
  errorMessageEl.innerHTML = `
    <p>⚠️ ${count} conversion errors detected!</p>
    <p>Some dates might be displaying incorrectly. Try the "Reset All Dates" button to fix.</p>
  `;
}