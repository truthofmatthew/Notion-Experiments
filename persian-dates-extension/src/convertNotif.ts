const jalaali = require('jalaali-js');
import { parseGregorian, isPersianDate } from "./dateUtils";
import { LOG_PREFIX, PANEL_ID, CONTENT_ID, MINIMIZE_BTN_ID, HIDE_BTN_ID, SHOW_BTN_ID, TOAST_ID, PANEL_TITLE, NO_DATES_MESSAGE, CLICK_INSTRUCTION, SELECTOR_MENTIONS, PANEL_STATE_KEY, PERSIAN_MONTHS } from "./constant";

let floatingPanel: HTMLElement | null = null;
let showButton: HTMLElement | null = null;
const convertedDates = new Map<string, { persianDate: string, element: HTMLElement }>();
let isPanelHidden = false;
let panelPosition = { top: '', left: '', right: '20px', bottom: '20px' };

export function handleDateMentions(persianInput: boolean): number {
  console.log(`${LOG_PREFIX} Handling date mentions, persianInput =`, persianInput);
  let convertedMentionCount = 0;

  try {
    if (persianInput) {
      loadPanelState();
      createFloatingPanel();

      const mentions = document.querySelectorAll<HTMLElement>(SELECTOR_MENTIONS);
      convertedDates.clear();

      mentions.forEach(reminder => {
        const currentText = reminder.textContent || "";
        const trimmedText = currentText.trim();
        if (!trimmedText || isPersianDate(trimmedText)) return;

        const dateInfo = extractDateFromMention(trimmedText);
        if (dateInfo) {
          const { date, display } = dateInfo;
          const jalali = jalaali.toJalaali(date);
          const persianDate = `${PERSIAN_MONTHS[jalali.jm - 1]} ${jalali.jd}، ${jalali.jy}`;

          convertedDates.set(display, { persianDate, element: reminder });
          convertedMentionCount++;
          console.log(`${LOG_PREFIX} Converted mention`, display, "to", persianDate);
        }
      });

      updatePanelContent();
      if (isPanelHidden) hidePanel(); else showPanel();
    } else {
      removeFloatingPanel();
      convertedDates.clear();
    }

    return convertedMentionCount;
  } catch (error) {
    console.error("Error handling date mentions:", error);
    return convertedMentionCount;
  }
}

function createFloatingPanel() {
  if (floatingPanel && document.body.contains(floatingPanel)) return;

  floatingPanel = document.createElement('div');
  floatingPanel.id = PANEL_ID;
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
    <div style="font-weight: 600; font-size: 14px;">${PANEL_TITLE}</div>
    <div style="display: flex; gap: 8px;">
      <button id="${MINIMIZE_BTN_ID}" style="
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
      <button id="${HIDE_BTN_ID}" style="
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

  const content = document.createElement('div');
  content.id = CONTENT_ID;
  content.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    max-height: 340px;
    display: block;
  `;
  floatingPanel.appendChild(content);

  document.body.appendChild(floatingPanel);
  makeDraggable(floatingPanel, header);

  const MinimizeBtn = floatingPanel.querySelector(`#${MINIMIZE_BTN_ID}`);
  if (MinimizeBtn) {
    MinimizeBtn.addEventListener('click', () => {
      const contentArea = floatingPanel?.querySelector(`#${CONTENT_ID}`) as HTMLElement;
      if (contentArea.style.display === 'none') {
        contentArea.style.display = 'block';
        (MinimizeBtn as HTMLElement).textContent = '−';
      } else {
        contentArea.style.display = 'none';
        (MinimizeBtn as HTMLElement).textContent = '+';
      }
    });
  }

  const hideBtn = floatingPanel.querySelector(`#${HIDE_BTN_ID}`);
  if (hideBtn) hideBtn.addEventListener('click', () => { hidePanel(); savePanelState(); });

  createShowButton();
}

function createShowButton() {
  if (showButton && document.body.contains(showButton)) document.body.removeChild(showButton);

  showButton = document.createElement('div');
  showButton.id = SHOW_BTN_ID;
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
  showButton.title = PANEL_TITLE;
  showButton.addEventListener('click', () => { showPanel(); savePanelState(); });
  document.body.appendChild(showButton);
}

function hidePanel() {
  if (!floatingPanel || !showButton) return;

  if (floatingPanel.style.top) panelPosition.top = floatingPanel.style.top;
  if (floatingPanel.style.left) panelPosition.left = floatingPanel.style.left;
  if (floatingPanel.style.right) panelPosition.right = floatingPanel.style.right;
  if (floatingPanel.style.bottom) panelPosition.bottom = floatingPanel.style.bottom;

  floatingPanel.style.display = 'none';
  showButton.style.display = 'flex';
  isPanelHidden = true;
}

function showPanel() {
  if (!floatingPanel || !showButton) return;

  floatingPanel.style.display = 'flex';
  showButton.style.display = 'none';
  isPanelHidden = false;
}

function savePanelState() {
  try {
    const state = { hidden: isPanelHidden, position: panelPosition };
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving panel state:", error);
  }
}

function loadPanelState() {
  try {
    const savedState = localStorage.getItem(PANEL_STATE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      isPanelHidden = state.hidden;
      if (state.position) panelPosition = state.position;
    }
  } catch (error) {
    console.error("Error loading panel state:", error);
  }
}

function updatePanelContent() {
  if (!floatingPanel) return;

  const content = floatingPanel.querySelector(`#${CONTENT_ID}`);
  if (!content) return;

  if (convertedDates.size === 0) {
    content.innerHTML = `
      <div style="text-align: center; color: #888; padding: 8px 0;">
        ${NO_DATES_MESSAGE}
      </div>
    `;
    return;
  }

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

  html += `
    <div style="font-size: 12px; color: #888; margin-top: 8px; text-align: center;">
      ${CLICK_INSTRUCTION}
    </div>
  `;
  content.innerHTML = html;

  const dateElements = content.querySelectorAll('span[data-date]');
  dateElements.forEach(element => {
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const gregorianDate = target.getAttribute('data-date');
      if (!gregorianDate) return;

      const conversion = convertedDates.get(gregorianDate);
      if (!conversion) return;

      conversion.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const originalElement = conversion.element;
      originalElement.style.backgroundColor = '#fff3cd';
      setTimeout(() => { originalElement.style.backgroundColor = ''; }, 2000);
    });
  });
}

function showCopyToast(message: string) {
  const existingToast = document.getElementById(TOAST_ID);
  if (existingToast) document.body.removeChild(existingToast);

  const toast = document.createElement('div');
  toast.id = TOAST_ID;
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
  setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 2000);
}

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

function makeDraggable(element: HTMLElement, handle: HTMLElement) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    panelPosition = { top: element.style.top, left: element.style.left, right: '', bottom: '' };
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    savePanelState();
  }
}

function extractDateFromMention(text: string): { date: Date, display: string } | null {
  try {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    const date = parseGregorian(cleaned);
    if (date) return { date, display: cleaned };
    return null;
  } catch (error) {
    console.error("Error extracting date from mention:", error);
    return null;
  }
}

export function clearDateMentionConversions(): number {
  console.log(`${LOG_PREFIX} Clearing date mention conversions`);
  const count = convertedDates.size;
  convertedDates.clear();
  removeFloatingPanel();
  return count;
}