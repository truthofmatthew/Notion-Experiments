import { persianToggle, fontToggle, resetButton, errorMessageEl, fontSelector, fontSelectorContainer, updateFontAuthor, showErrorMessage } from "./ui";
import { saveSelectedFont } from "../fontInjection";

let altKeyPressed = false;

export function initListeners() {
  persianToggle.addEventListener("change", () => {
    const enabled = persianToggle.checked;
    chrome.storage.sync.set({ persianInput: enabled });
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { persianInput: enabled });
      }
    });
    if (!enabled) {
      errorMessageEl.style.display = 'none';
    } else {
      setTimeout(checkForErrors, 1000);
    }
  });

  fontToggle.addEventListener('change', () => {
    const enabled = fontToggle.checked;
    chrome.storage.sync.set({ fontInjectionEnabled: enabled });
    if (enabled) {
      fontSelectorContainer.classList.add('visible');
    } else {
      fontSelectorContainer.classList.remove('visible');
    }
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { fontInjectionEnabled: enabled });
      }
    });
  });

  fontSelector.addEventListener('change', () => {
    const selectedFont = fontSelector.value;
    // updateFontAuthor();
    saveSelectedFont(selectedFont).then(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { selectedFont });
        }
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Alt') {
      altKeyPressed = true;
      resetButton.textContent = "Force Reload Page";
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      altKeyPressed = false;
      resetButton.textContent = "Reset All Dates";
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
        resetButton.disabled = false;
        setTimeout(checkForErrors, 500);
      }
    }
    if (message.errorCountChanged !== undefined) {
      if (message.errorCount > 0) {
        showErrorMessage(message.errorCount);
      } else {
        errorMessageEl.style.display = 'none';
      }
    }
  });
}

export function checkForErrors() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { checkErrors: true }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response && response.errorCount > 0) {
          showErrorMessage(response.errorCount);
        } else {
          errorMessageEl.style.display = 'none';
        }
      });
    }
  });
}
