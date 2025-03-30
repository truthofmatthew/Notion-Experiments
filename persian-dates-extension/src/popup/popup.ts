import { initFontSelector } from "./ui";
import { initListeners } from "./events";
import { loadState } from "./state";
import { MESSAGE_TYPES, STORAGE_KEYS } from "../constant";

initFontSelector();
loadState();
initListeners();

const settingsGear = document.getElementById("settings-gear") as HTMLElement;
const mainPage = document.getElementById("main-page") as HTMLElement;
const settingsPage = document.getElementById("settings-page") as HTMLElement;
const backBtn = document.getElementById("settings-back") as HTMLElement;
const persianNumbersToggle = document.getElementById("persian-numbers-toggle") as HTMLInputElement;

// load toggle state
chrome.storage.sync.get([STORAGE_KEYS.PERSIAN_NUMBERS], (data) => {
    persianNumbersToggle.checked = !!data[STORAGE_KEYS.PERSIAN_NUMBERS];
});

// save toggle state
persianNumbersToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.PERSIAN_NUMBERS]: persianNumbersToggle.checked }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: MESSAGE_TYPES.REFRESH_CONVERSION });
            }
        });
    });
});


// show settings
settingsGear.addEventListener("click", () => {
    mainPage.style.display = "none";
    settingsPage.style.display = "block";
});

// back to main
backBtn.addEventListener("click", () => {
    settingsPage.style.display = "none";
    mainPage.style.display = "block";
});
