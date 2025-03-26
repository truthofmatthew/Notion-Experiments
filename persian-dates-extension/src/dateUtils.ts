import { format } from "date-fns-jalali";
// Use require for CommonJS modules
const jalaali = require('jalaali-js');

// Month name mapping for parsing
export const months: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
};

/**
 * Improved function to check if a string appears to be a Persian date
 */
export function isPersianDate(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  // Clean the input
  text = text.trim();
  
  // Pattern 1: yyyy/mm/dd format with years between 1300-1499
  const standardFormat = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (standardFormat) {
    const year = parseInt(standardFormat[1], 10);
    const month = parseInt(standardFormat[2], 10);
    const day = parseInt(standardFormat[3], 10);
    
    // Basic validation
    if (year >= 1300 && year < 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return jalaali.isValidJalaaliDate(year, month, day);
    }
  }
  
  // Pattern 2: Persian month names
  const persianMonthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  for (const month of persianMonthNames) {
    if (text.includes(month)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Parse a Gregorian date string into a Date object
 * Handles various common date formats
 */
export function parseGregorian(text: string): Date | null {
  if (!text || typeof text !== 'string') return null;
  
  // Clean the input
  text = text.trim();
  
  // Quick check: if it looks like a Persian date, don't try to parse as Gregorian
  if (isPersianDate(text)) {
    return null;
  }
  
  try {
    // Month Day, Year (e.g., "January 15, 2023")
    let m = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
    if (m) {
      const mon = months[m[1].toLowerCase()];
      if (!mon) return null;
      return new Date(+m[3], mon - 1, +m[2]);
    }
    
    // ISO format: Year-Month-Day or Year/Month/Day (e.g., "2023-01-15" or "2023/01/15")
    m = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      
      // Skip if it looks like a Persian date
      if (year >= 1300 && year < 1500) {
        // Only consider it Gregorian if it's a common year like 1400 (which could be both)
        // and has English context clues
        const hasEnglishContext = Object.keys(months).some(month => 
          text.toLowerCase().includes(month.toLowerCase())
        );
        
        if (!hasEnglishContext) {
          return null;
        }
      }
      
      // Basic validation
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    }
    
    // US format: Month/Day/Year (e.g., "1/15/2023")
    m = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (m) {
      const month = parseInt(m[1], 10);
      const day = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);
      
      // Skip if it looks like a Persian date
      if (year >= 1300 && year < 1500) {
        return null;
      }
      
      // Basic validation
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return new Date(year, month - 1, day);
    }
    
    // Year Month Day (e.g., "2023 January 15")
    m = text.match(/\b(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})\b/);
    if (m) {
      const mon = months[m[2].toLowerCase()];
      if (!mon) return null;
      return new Date(+m[1], mon - 1, +m[3]);
    }
    
    // Try for relative dates like "Today", "Yesterday", "Tomorrow"
    if (/today/i.test(text)) {
      return new Date();
    }
    if (/yesterday/i.test(text)) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    if (/tomorrow/i.test(text)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
  } catch (error) {
    console.error("Error parsing date:", text, error);
  }
  
  return null;
}

/**
 * Convert a Date object to Persian (Jalali) date format using jalaali-js
 */
export function formatJalali(d: Date): string {
  // Validate input
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
    console.error("Invalid date passed to formatJalali", d);
    return "Invalid Date";
  }

  try {
    // Use jalaali-js for accurate conversion
    const jalali = jalaali.toJalaali(d);
    
    // Format as yyyy/mm/dd
    return `${jalali.jy}/${jalali.jm.toString().padStart(2, '0')}/${jalali.jd.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error in formatJalali:", error);
    return "Invalid Date";
  }
}

/**
 * Convert a Persian date string to a Gregorian Date object using jalaali-js
 * @param persianDateStr Persian date string in format yyyy/mm/dd
 */
export function persianToGregorian(persianDateStr: string): string | null {
  try {
    // Parse the Persian date string
    const match = persianDateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) return null;
    
    const jy = parseInt(match[1], 10);
    const jm = parseInt(match[2], 10);
    const jd = parseInt(match[3], 10);
    
    // Check if it's a valid Persian date
    if (!jalaali.isValidJalaaliDate(jy, jm, jd)) {
      return null;
    }
    
    // Convert to Gregorian
    const gregorian = jalaali.toGregorian(jy, jm, jd);
    
    // Format as yyyy/mm/dd
    return `${gregorian.gy}/${gregorian.gm.toString().padStart(2, '0')}/${gregorian.gd.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error converting Persian to Gregorian:", error);
    return null;
  }
}
