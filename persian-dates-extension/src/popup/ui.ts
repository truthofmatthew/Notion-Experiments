import { defaultFonts } from "../fontInjection";

export const persianToggle = document.getElementById('persian-toggle') as HTMLInputElement;
export const fontToggle = document.getElementById('font-toggle') as HTMLInputElement;
export const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
export const errorMessageEl = document.getElementById('error-message') as HTMLDivElement;
export const fontSelectorContainer = document.getElementById('font-selector-container') as HTMLDivElement;
export const fontSelector = document.getElementById('font-selector') as HTMLSelectElement;
export const fontAuthor = document.getElementById('font-author') as HTMLDivElement;
export const statusEl = document.getElementById('status') as HTMLDivElement; // if used

export function initFontSelector() {
  fontSelector.innerHTML = '';
  defaultFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.en_name;
    option.textContent = font.fa_name;
    option.dataset.author = font.creator;
    fontSelector.appendChild(option);
  });
//   updateFontAuthor();
}

export function updateFontAuthor() {
  const selectedOption = fontSelector.options[fontSelector.selectedIndex];
  fontAuthor.textContent = selectedOption?.dataset.author ? `By: ${selectedOption.dataset.author}` : '';
}

export function updateStatus(message: string) {
  if(statusEl) statusEl.textContent = message;
}

export function showErrorMessage(count: number) {
  errorMessageEl.style.display = 'block';
  errorMessageEl.innerHTML = `
    <p>⚠️ ${count} conversion errors detected!</p>
    <p>Some dates might be displaying incorrectly. Try the "Reset All Dates" button to fix.</p>
  `;
}
