import { parseGregorian, formatJalali, isPersianDate, persianToGregorian } from "./dateUtils";

// Only track errors - no state storage
let conversionErrorCount = 0;

// Flag to prevent observer loops
let isMakingChanges = false;

// Keep track of the last time we processed dates
let lastProcessedTime = 0;

// Main conversion function - completely stateless
export function convertTable(persianInput: boolean): number {
  const startTime = Date.now();
  console.log("mtlog: Starting table conversion, persianInput =", persianInput);
  
  // Set the flag that we're making changes
  isMakingChanges = true;
  let conversionCount = 0;
  
  try {
    // Process each date cell in Notion's table
    document.querySelectorAll<HTMLElement>("[data-testid='property-value'] div, div.notion-date").forEach(el => {
      // Skip elements that are not visible
      if (!isElementVisible(el)) return;
      
      const current = el.innerText.trim();
      
      // Skip empty cells
      if (!current) return;
      
      if (persianInput) {
        // If we want Persian dates
        
        // Skip if already in Persian format
        if (isPersianDate(current)) {
          return;
        }
        
        // Try to parse as Gregorian date
        const parsedDate = parseGregorian(current);
        
        if (parsedDate) {
          // This is a valid Gregorian date - convert it using jalaali-js
          const jalaliDate = formatJalali(parsedDate);
          
          // Skip invalid conversions
          if (jalaliDate === "Invalid Date") {
            console.warn("Skipping invalid date conversion:", current);
            return;
          }
          
          // Update visible text to Persian if it's different
          if (el.innerText !== jalaliDate) {
            // Store original content in a data attribute for restoration
            if (!el.hasAttribute('data-original-date')) {
              el.setAttribute('data-original-date', current);
            }
            
            el.innerText = jalaliDate;
            conversionCount++;
            console.log("mtlog: Converted", current, "to", jalaliDate);
          }
        }
      } else {
        // If we want Gregorian dates
        
        // Check if this is a Persian date that needs restoration
        if (isPersianDate(current)) {
          // Try to get the original date if stored
          const originalDate = el.getAttribute('data-original-date');
          
          if (originalDate) {
            // We have the original, use it
            el.innerText = originalDate;
            el.removeAttribute('data-original-date');
            conversionCount++;
            console.log("mtlog: Restored original date:", originalDate);
          } else {
            // No original stored, convert from Persian using jalaali-js
            const gregorianDate = persianToGregorian(current);
            if (gregorianDate) {
              el.innerText = gregorianDate;
              conversionCount++;
              console.log("mtlog: Converted Persian to Gregorian:", current, "->", gregorianDate);
            }
          }
        }
      }
    });
    
    // Update the last processed timestamp
    lastProcessedTime = startTime;
    
    console.log(`mtlog: Processed ${conversionCount} dates`);
  } catch (error) {
    console.error("Error during conversion:", error);
    conversionErrorCount++;
  } finally {
    // Always reset the flag
    isMakingChanges = false;
  }
  
  return conversionCount;
}

// Helper function to check if an element is visible
function isElementVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// Function to reset all dates to their original values
export function resetAllConversions(): number {
  console.log("mtlog: Resetting all conversions");
  isMakingChanges = true;
  let count = 0;
  
  try {
    // Reset error count
    conversionErrorCount = 0;
    
    // Strategy 1: First try to restore from original data attribute
    document.querySelectorAll<HTMLElement>('[data-original-date]').forEach(el => {
      const originalDate = el.getAttribute('data-original-date');
      if (originalDate) {
        el.innerText = originalDate;
        el.removeAttribute('data-original-date');
        count++;
        console.log("mtlog: Reset to original date:", originalDate);
      }
    });
    
    // Strategy 2: For any remaining Persian dates, convert them to Gregorian
    document.querySelectorAll<HTMLElement>("[data-testid='property-value'] div, div.notion-date").forEach(el => {
      if (!isElementVisible(el)) return;
      
      const current = el.innerText.trim();
      if (!current) return;
      
      // Check if it's a Persian date without original data
      if (isPersianDate(current) && !el.hasAttribute('data-original-date')) {
        const gregorianDate = persianToGregorian(current);
        if (gregorianDate) {
          el.innerText = gregorianDate;
          count++;
          console.log("mtlog: Converted Persian to Gregorian:", current, "->", gregorianDate);
        }
      }
    });
    
    console.log(`mtlog: Reset ${count} date cells`);
  } finally {
    isMakingChanges = false;
  }
  
  return count;
}

// Check if a conversion was done recently
export function wasRecentlyProcessed(timeThresholdMs = 500): boolean {
  return (Date.now() - lastProcessedTime) < timeThresholdMs;
}

// Check if we're currently making changes
export function isCurrentlyMakingChanges(): boolean {
  return isMakingChanges;
}

// Get the current error count
export function getErrorCount(): number {
  return conversionErrorCount;
}

