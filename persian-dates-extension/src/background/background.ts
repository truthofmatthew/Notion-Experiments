/* background.ts */
function applySettingsToTab(tabId: number) {
  chrome.storage.sync.get(
    ["persianInput", "fontInjectionEnabled", "selectedFont"],
    (data) => {
      chrome.tabs.sendMessage(tabId, { type: "applySettings", data });
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

// Listen for settings changes and update all active Notion tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && 
      (changes.persianInput || changes.fontInjectionEnabled || changes.selectedFont)) {
    // Get all Notion tabs and update them
    chrome.tabs.query({ url: "*://*.notion.so/*" }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          applySettingsToTab(tab.id);
        }
      });
    });
  }
});
