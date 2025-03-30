import { STORAGE_KEYS, MESSAGE_TYPES, NOTION_URL_PATTERN } from "../constant";

function applySettingsToTab(tabId: number) {
  chrome.storage.sync.get(
    [STORAGE_KEYS.PERSIAN_INPUT, STORAGE_KEYS.FONT_INJECTION_ENABLED, STORAGE_KEYS.SELECTED_FONT],
    (data) => {
      chrome.tabs.sendMessage(tabId, { type: MESSAGE_TYPES.APPLY_SETTINGS, data });
    }
  );
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("notion.so") && changeInfo.status === 'complete') {
    applySettingsToTab(tabId);
  } else {
    chrome.action.disable(tabId);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && tab.url.includes("notion.so") && tab.id !== undefined) {
      applySettingsToTab(tab.id);
    }
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes[STORAGE_KEYS.PERSIAN_INPUT] || changes[STORAGE_KEYS.FONT_INJECTION_ENABLED] || changes[STORAGE_KEYS.SELECTED_FONT])) {
    chrome.tabs.query({ url: NOTION_URL_PATTERN }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) applySettingsToTab(tab.id);
      });
    });
  }
});