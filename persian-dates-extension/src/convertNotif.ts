// Import the jalaali-js library for accurate date conversions
const jalaali = require('jalaali-js');
import { parseGregorian, isPersianDate } from "./dateUtils";

// Store the floating panel element
let floatingPanel: HTMLElement | null = null;
// Store the show button element
let showButton: HTMLElement | null = null;
// Track which dates we've converted
const convertedDates = new Map<string, { persianDate: string, element: HTMLElement }>();
// Track panel state
let isPanelHidden = false;
// Track panel position
let panelPosition = { top: '', left: '', right: '20px', bottom: '20px' };

/**
 * Convert date mentions/reminders in Notion
 * These appear as @Date elements like "@April 26, 2025"
 */
export function convertDateMentions(persianInput: boolean): number {
  console.log("mtlog: Converting date mentions, persianInput =", persianInput);
  let conversionCount = 0;
  
  try {
    // Handle based on Persian mode
    if (persianInput) {
      // Load panel state from storage
      loadPanelState();
      
      // Create the floating panel if needed
      createFloatingPanel();
      
      // Find all date mention tokens in Notion
      const mentions = document.querySelectorAll<HTMLElement>('.notion-text-mention-token .notion-reminder');
      
      // Clear current conversions
      convertedDates.clear();
      
      // Process each date mention
      mentions.forEach(reminder => {
        const current = reminder.textContent || "";
        const currentTrimmed = current.trim();
        if (!currentTrimmed) return;
        
        // Skip if already in Persian format
        if (isPersianDate(currentTrimmed)) return;
        
        // Try to extract the date info to convert it
        const dateInfo = extractDateFromMention(currentTrimmed);
        if (dateInfo) {
          const { date, display } = dateInfo;
          
          // Convert to Persian date
          const jalali = jalaali.toJalaali(date);
          
          // Create Persian date format
          const persianMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
          ];
          
          const persianDate = `${persianMonths[jalali.jm - 1]} ${jalali.jd}، ${jalali.jy}`;
          
          // Store the conversion with element reference
          convertedDates.set(display, { persianDate, element: reminder });
          conversionCount++;
          console.log("mtlog: Converted mention", display, "to", persianDate);
        }
      });
      
      // Update the panel with conversions
      updatePanelContent();
      
      // Apply panel visibility based on saved state
      if (isPanelHidden) {
        hidePanel();
      } else {
        showPanel();
      }
      
    } else {
      // Remove panel in Gregorian mode
      removeFloatingPanel();
      convertedDates.clear();
    }
    
    return conversionCount;
  } catch (error) {
    console.error("Error converting date mentions:", error);
    return conversionCount;
  }
}

/**
 * Create floating panel with Persian date conversions
 */
function createFloatingPanel() {
  // Only create if it doesn't exist
  if (floatingPanel && document.body.contains(floatingPanel)) return;

  // Create panel container
  floatingPanel = document.createElement('div');
  floatingPanel.id = 'persian-dates-panel';
  floatingPanel.style.cssText = `
    position: fixed;
    ${panelPosition.bottom ? 'bottom: ' + panelPosition.bottom + ';' : ''}
    ${panelPosition.right ? 'right: ' + panelPosition.right + ';' : ''}
    ${panelPosition.top ? 'top: ' + panelPosition.top + ';' : ''}
    ${panelPosition.left ? 'left: ' + panelPosition.left + ';' : ''}
    width: 280px;
    max-height: 400px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
    z-index: 9999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    background: #f7f6f3;
  `;
  header.innerHTML = `
    <div style="font-weight: 600; font-size: 14px;">Persian Dates</div>
    <div style="display: flex; gap: 8px;">
      <button id="persian-dates-minimize" style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">−</button>
      <button id="persian-dates-hide" style="
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
  floatingPanel.appendChild(header);

  // Create content area
  const content = document.createElement('div');
  content.id = 'persian-dates-content';
  content.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    max-height: 340px;
    display: block;
  `;
  floatingPanel.appendChild(content);

  // Add to document
  document.body.appendChild(floatingPanel);

  // Make panel draggable
  makeDraggable(floatingPanel, header);

  // Handle minimize button
  const minimizeBtn = floatingPanel.querySelector('#persian-dates-minimize');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      const content = floatingPanel?.querySelector('#persian-dates-content');
      if (content) {
        if ((content as HTMLElement).style.display === 'none') {
          // Expand
          (content as HTMLElement).style.display = 'block';
          (minimizeBtn as HTMLElement).textContent = '−';
        } else {
          // Collapse
          (content as HTMLElement).style.display = 'none';
          (minimizeBtn as HTMLElement).textContent = '+';
        }
      }
    });
  }
  
  // Handle hide button
  const hideBtn = floatingPanel.querySelector('#persian-dates-hide');
  if (hideBtn) {
    hideBtn.addEventListener('click', () => {
      hidePanel();
      savePanelState();
    });
  }
  
  // Create show button (initially hidden)
  createShowButton();
}

/**
 * Create a small button to show the panel when it's hidden
 */
function createShowButton() {
  // Remove existing button if any
  if (showButton && document.body.contains(showButton)) {
    document.body.removeChild(showButton);
  }
  
  // Create new button
  showButton = document.createElement('div');
  showButton.id = 'persian-dates-show-button';
  showButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    font-size: 18px;
    color: #333;
  `;
  showButton.innerHTML = `<span style="font-weight: bold;">🗓️</span>`;
  showButton.title = "Show Persian Dates";
  
  // Add click event
  showButton.addEventListener('click', () => {
    showPanel();
    savePanelState();
  });
  
  // Add to document
  document.body.appendChild(showButton);
}

/**
 * Hide the panel and show the small button
 */
function hidePanel() {
  if (!floatingPanel || !showButton) return;
  
  // Save position before hiding
  if (floatingPanel.style.top) panelPosition.top = floatingPanel.style.top;
  if (floatingPanel.style.left) panelPosition.left = floatingPanel.style.left;
  if (floatingPanel.style.right) panelPosition.right = floatingPanel.style.right;
  if (floatingPanel.style.bottom) panelPosition.bottom = floatingPanel.style.bottom;
  
  // Hide panel
  floatingPanel.style.display = 'none';
  
  // Show button
  showButton.style.display = 'flex';
  
  // Update state
  isPanelHidden = true;
}

/**
 * Show the panel and hide the small button
 */
function showPanel() {
  if (!floatingPanel || !showButton) return;
  
  // Show panel
  floatingPanel.style.display = 'flex';
  
  // Hide button
  showButton.style.display = 'none';
  
  // Update state
  isPanelHidden = false;
}

/**
 * Save panel state to storage
 */
function savePanelState() {
  try {
    const state = {
      hidden: isPanelHidden,
      position: panelPosition
    };
    
    localStorage.setItem('persian-dates-panel-state', JSON.stringify(state));
  } catch (error) {
    console.error("Error saving panel state:", error);
  }
}

/**
 * Load panel state from storage
 */
function loadPanelState() {
  try {
    const savedState = localStorage.getItem('persian-dates-panel-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      isPanelHidden = state.hidden;
      if (state.position) {
        panelPosition = state.position;
      }
    }
  } catch (error) {
    console.error("Error loading panel state:", error);
  }
}

/**
 * Update panel content with current conversions
 */
function updatePanelContent() {
  if (!floatingPanel) return;

  const content = floatingPanel.querySelector('#persian-dates-content');
  if (!content) return;

  if (convertedDates.size === 0) {
    content.innerHTML = `
      <div style="text-align: center; color: #888; padding: 8px 0;">
        No date mentions found.
      </div>
    `;
    return;
  }

  // Generate conversion list
  let html = '';
  
  convertedDates.forEach(({ persianDate, element }, gregorianDate) => {
    html += `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
        <div style="margin-bottom: 4px; direction: rtl; text-align: right;">
          <span style="font-weight: 600; cursor: pointer;" data-date="${gregorianDate}">${persianDate}</span>
        </div>
        <div style="font-size: 12px; color: #888;">
          ${gregorianDate}
        </div>
      </div>
    `;
  });

  // Add copy instructions
  html += `
    <div style="font-size: 12px; color: #888; margin-top: 8px; text-align: center;">
      Click a date to copy Persian format or scroll to its location
    </div>
  `;

  content.innerHTML = html;

  // Add click handlers for copying and scrolling
  const dateElements = content.querySelectorAll('span[data-date]');
  dateElements.forEach(element => {
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const gregorianDate = target.getAttribute('data-date');
      if (!gregorianDate) return;
      
      const conversion = convertedDates.get(gregorianDate);
      if (!conversion) return;
      
      // Scroll the original element into view
      conversion.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Show a highlight effect
      const originalElement = conversion.element;
      originalElement.style.backgroundColor = '#fff3cd';
      setTimeout(() => {
        originalElement.style.backgroundColor = '';
      }, 2000);
    });
  });
}

/**
 * Show a toast message when text is copied
 */
function showCopyToast(message: string) {
  // Remove existing toast if any
  const existingToast = document.getElementById('persian-dates-toast');
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  // Create toast
  const toast = document.createElement('div');
  toast.id = 'persian-dates-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Remove after 2 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 2000);
}

/**
 * Remove the floating panel
 */
function removeFloatingPanel() {
  if (floatingPanel && document.body.contains(floatingPanel)) {
    document.body.removeChild(floatingPanel);
    floatingPanel = null;
  }
  
  if (showButton && document.body.contains(showButton)) {
    document.body.removeChild(showButton);
    showButton = null;
  }
}

/**
 * Make an element draggable
 */
function makeDraggable(element: HTMLElement, handle: HTMLElement) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  // Set handle for dragging
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    // Clear any right/bottom positioning
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    
    // Save updated position to our tracking object
    panelPosition = {
      top: element.style.top,
      left: element.style.left,
      right: '',
      bottom: ''
    };
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
    
    // Save position after drag ends
    savePanelState();
  }
}

/**
 * Extract date information from a mention string like "April 26, 2025"
 */
function extractDateFromMention(text: string): { date: Date, display: string } | null {
  try {
    // Replace multiple spaces with single space and trim
    const cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Try to parse the date
    const date = parseGregorian(cleaned);
    if (date) {
      return { date, display: cleaned };
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting date from mention:", error);
    return null;
  }
}

/**
 * Reset all date mentions to their original values
 */
export function resetDateMentions(): number {
  console.log("mtlog: Resetting date mentions");
  
  // Just remove panel and clear conversions
  const count = convertedDates.size;
  convertedDates.clear();
  removeFloatingPanel();
  
  return count;
} 