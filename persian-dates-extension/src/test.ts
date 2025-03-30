const jalaali = require('jalaali-js');

console.log("TESTING JALAALI CONVERSIONS");
console.log("==========================");

const gregorianDate = new Date(2023, 2, 21);
const jalaliDate = jalaali.toJalaali(gregorianDate);
console.log("Test 1: Gregorian to Jalaali");
console.log("Gregorian:", gregorianDate.toDateString());
console.log("Jalaali:", `${jalaliDate.jy}/${jalaliDate.jm}/${jalaliDate.jd}`);
console.log();

const jy = 1402;
const jm = 1;
const jd = 1;
const gregorian = jalaali.toGregorian(jy, jm, jd);
console.log("Test 2: Jalaali to Gregorian");
console.log("Jalaali:", `${jy}/${jm}/${jd}`);
console.log("Gregorian:", `${gregorian.gy}/${gregorian.gm}/${gregorian.gd}`);
console.log();

const futureDate = new Date(2025, 0, 1);
const futurePersian = jalaali.toJalaali(futureDate);
console.log("Test 3: Future date conversion");
console.log("Gregorian:", futureDate.toDateString());
console.log("Jalaali:", `${futurePersian.jy}/${futurePersian.jm}/${futurePersian.jd}`);
console.log();

const isLeap1403 = jalaali.isLeapJalaaliYear(1403);
const isLeap1404 = jalaali.isLeapJalaaliYear(1404);
console.log("Test 4: Leap year detection");
console.log("Is 1403 a leap year?", isLeap1403);
console.log("Is 1404 a leap year?", isLeap1404);
console.log();

console.log("Test 5: Month lengths");
console.log("Length of month 12 in year 1403:", jalaali.jalaaliMonthLength(1403, 12));
console.log("Length of month 12 in year 1404:", jalaali.jalaaliMonthLength(1404, 12));