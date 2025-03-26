import { convertTable, resetAllConversions, isCurrentlyMakingChanges, wasRecentlyProcessed, getErrorCount } from "../convertTable";
import { convertDateMentions, resetDateMentions } from "../convertNotif";
import { injectFonts, setCurrentFont } from "../fontInjection";

// Track if Persian mode is enabled
let persianInput = false;

// Track if font injection is enabled
let fontInjectionEnabled = false;

// Flag to prevent multiple simultaneous conversions
let isProcessingDate = false;

// Debounce timer for mutation events
let debounceTimer: number | null = null;

// Initialize from storage
chrome.storage.sync.get(["persianInput", "fontInjectionEnabled"], d => {
  console.log("mtlog: Initial state loaded", d);
  persianInput = !!d.persianInput;
  fontInjectionEnabled = !!d.fontInjectionEnabled;
  
  // Initial conversion if enabled
  if (persianInput) {
    setTimeout(() => {
      convertDates();
    }, 500); // Short delay to let Notion render fully
  }
  
  // Apply font injection if enabled
  injectFonts(fontInjectionEnabled);
});



// Message handler for popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "applySettings" && msg.data) {
    persianInput = !!msg.data.persianInput;
    fontInjectionEnabled = !!msg.data.fontInjectionEnabled;
    if (msg.data.selectedFont) setCurrentFont(msg.data.selectedFont);
    
    // Apply font injection based on current setting
    injectFonts(fontInjectionEnabled);
    
    // Process dates if Persian input is enabled
    if (persianInput) convertDates();
    
    return;
  }

  console.log("mtlog: Received message", msg);
  
  // Handle enable/disable toggle
  if (msg.persianInput !== undefined) {
    persianInput = msg.persianInput;
    console.log("mtlog: Persian input set to", persianInput);
    
    // Process immediately
    convertDates();
  }
  
  // Handle font injection toggle
  if (msg.fontInjectionEnabled !== undefined) {
    fontInjectionEnabled = msg.fontInjectionEnabled;
    console.log("mtlog: Font injection set to", fontInjectionEnabled);
    
    // Apply font injection
    injectFonts(fontInjectionEnabled);
  }
  
  // Handle font selection change
  if (msg.selectedFont) {
    console.log("mtlog: Font selection changed to", msg.selectedFont);
    
    // Update the current font
    setCurrentFont(msg.selectedFont);
  }
  
  // Handle error check request
  if (msg.checkErrors) {
    const errorCount = getErrorCount();
    console.log("mtlog: Returning error count", errorCount);
    sendResponse({ errorCount });
    return true; // Keep channel open
  }
  
  // Handle reset request
  if (msg.refreshConversion) {
    console.log("mtlog: Reset requested");
    
    // Reset all dates
    const resetCount = resetAllConversions();
    
    // Reset all date mentions
    const resetMentionCount = resetDateMentions();
    
    const totalResetCount = resetCount + resetMentionCount;
    
    // Handle page reload if requested
    if (msg.forceReload) {
      chrome.runtime.sendMessage({ 
        resetComplete: true, 
        count: totalResetCount,
        reloading: true
      });
      
      // Reload the page
      window.location.reload();
      return true;
    }
    
    // Wait a moment and report completion
    setTimeout(() => {
      if (persianInput) {
        convertDates();
      }
      
      chrome.runtime.sendMessage({ 
        resetComplete: true, 
        count: totalResetCount
      });
    }, 500);
    
    return true; // Keep channel open
  }
  
  return false;
});

// Main conversion function
function convertDates() {
  if (isProcessingDate) {
    console.log("mtlog: Already processing, skipping");
    return;
  }
  
  isProcessingDate = true;
  
  try {
    console.log("mtlog: Converting dates, mode:", persianInput ? "Persian" : "Gregorian");
    
    // Step 1: Convert table property dates
    const tableCount = convertTable(persianInput);
    
    // Step 2: Convert date mentions/reminders
    const mentionCount = convertDateMentions(persianInput);
    
    const totalCount = tableCount + mentionCount;
    
    // Report errors if any
    const errorCount = getErrorCount();
    if (errorCount > 0) {
      chrome.runtime.sendMessage({ 
        errorCountChanged: true,
        errorCount
      });
    }
    
    console.log(`mtlog: Processed ${totalCount} dates (${tableCount} table dates, ${mentionCount} mentions)`);
  } finally {
    isProcessingDate = false;
  }
}

// Listen for user interactions that might change dates
function setupEventListeners() {
  // Date picker interactions
  document.addEventListener("click", (e) => {
    if (!persianInput) return;
    
    const target = e.target as HTMLElement;
    
    // Handle clicks on date picker elements
    if (
      target.matches("button[name='day']") ||
      target.closest("button[name='previous-month']") || 
      target.closest("button[name='next-month']") ||
      (target.closest("[role='button']") && 
       (target.textContent?.includes("Date format") || target.textContent?.includes("Clear")))
    ) {
      console.log("mtlog: Date picker interaction detected");
      
      // Delay to let Notion update the date
      setTimeout(convertDates, 300);
    }
    
    // Handle date mention creation (when clicking @ and selecting 'Date')
    if (target.closest('.notion-selectable') && 
        (target.textContent?.includes('@Date') || 
         target.textContent?.includes('@Reminder'))) {
      console.log("mtlog: Date mention interaction detected");
      
      // Wait a bit longer for Notion to create the date mention
      setTimeout(convertDates, 800);
    }
  });
  
  // Date field input events
  document.addEventListener("input", (e) => {
    if (!persianInput) return;
    
    const target = e.target as HTMLElement;
    if (target.closest("[data-testid='property-value']") || 
        target.tagName === "INPUT" && target.closest(".rdp")) {
      console.log("mtlog: Date field input detected");
      
      // Debounce multiple rapid inputs
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(convertDates, 300);
    }
  });
}

// Setup MutationObserver to detect date changes in the DOM
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    // Skip if disabled, already making changes, or just processed
    if (!persianInput || isCurrentlyMakingChanges() || wasRecentlyProcessed(500)) {
      return;
    }
    
    // Check if any mutations are related to dates
    const hasDateChanges = mutations.some(mutation => {
      // Text changes
      if (mutation.type === 'characterData' && 
          mutation.target.nodeType === Node.TEXT_NODE && 
          mutation.target.textContent) {
        return true;
      }
      
      // Element changes in date fields
      if (mutation.type === 'childList' && 
          mutation.target instanceof HTMLElement && 
          (mutation.target.closest("[data-testid='property-value']") || 
           mutation.target.closest(".notion-date") ||
           mutation.target.closest(".notion-reminder") ||
           mutation.target.closest(".rdp"))) {
        return true;
      }
      
      return false;
    });
    
    if (hasDateChanges) {
      console.log("mtlog: Date changes detected by observer");
      
      // Debounce to avoid repeated conversions
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(convertDates, 300);
    }
  });
  
  // Start observing document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Setup error reporting to popup
function setupErrorReporting() {
  setInterval(() => {
    if (!persianInput) return;
    
    const errorCount = getErrorCount();
    if (errorCount > 0) {
      chrome.runtime.sendMessage({ 
        errorCountChanged: true,
        errorCount
      }, () => {
        // Ignore errors - popup might not be open
      });
    }
  }, 5000);
}

// Initialize all event listeners and observers
setupEventListeners();
setupMutationObserver();
setupErrorReporting();

