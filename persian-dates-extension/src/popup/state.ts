import { persianToggle, fontToggle, fontSelectorContainer, fontSelector, updateFontAuthor } from "./ui";
import { checkForErrors } from "./events";

export function loadState() {
  chrome.storage.sync.get(["persianInput", "fontInjectionEnabled", "selectedFont"], data => {
    persianToggle.checked = !!data.persianInput;
    fontToggle.checked = !!data.fontInjectionEnabled;
    if (data.fontInjectionEnabled) {
      fontSelectorContainer.classList.add('visible');
    } else {
      fontSelectorContainer.classList.remove('visible');
    }
    if (data.selectedFont) {
      fontSelector.value = data.selectedFont;
    //   updateFontAuthor();
    }
    if (data.persianInput) {
      checkForErrors();
    }
  });
}
