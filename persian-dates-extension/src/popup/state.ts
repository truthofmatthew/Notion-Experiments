import { persianToggle, fontToggle, fontSelectorContainer, fontSelector, updateFontAuthor } from "./ui";
import { checkForErrors } from "./events";
import { STORAGE_KEYS } from "../constant";

export function loadState() {
  chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.FONT_INJECTION_ENABLED, STORAGE_KEYS.SELECTED_FONT], data => {
    persianToggle.checked = !!data[STORAGE_KEYS.PERSIAN_INPUT];
    fontToggle.checked = !!data[STORAGE_KEYS.FONT_INJECTION_ENABLED];
    if (data[STORAGE_KEYS.FONT_INJECTION_ENABLED]) {
      fontSelectorContainer.classList.add('visible');
    } else {
      fontSelectorContainer.classList.remove('visible');
    }
    if (data[STORAGE_KEYS.SELECTED_FONT]) {
      fontSelector.value = data[STORAGE_KEYS.SELECTED_FONT];
    }
    if (data[STORAGE_KEYS.PERSIAN_INPUT]) {
      checkForErrors();
    }
  });
}