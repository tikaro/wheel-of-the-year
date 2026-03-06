/**
 * updateCalendarDates.js
 *
 * Reads the computed Sandex counts from scripts/output/sandex-counts-2020-2025.json
 * and rewrites the `sandex` field for every entry in src/calendarDates.js,
 * preserving all other fields and formatting.
 *
 * Usage:  node scripts/updateCalendarDates.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const COUNTS_FILE = path.join(__dirname, 'output', 'sandex-counts-2020-2025.json');
const CALENDAR_DATES_FILE = path.join(__dirname, '..', 'src', 'calendarDates.js');

function main() {
  if (!fs.existsSync(COUNTS_FILE)) {
    console.error(`Counts file not found: ${COUNTS_FILE}`);
    console.error('Run "npm run sandex:compute" first.');
    process.exit(1);
  }

  const { counts } = JSON.parse(fs.readFileSync(COUNTS_FILE, 'utf8'));
  let src = fs.readFileSync(CALENDAR_DATES_FILE, 'utf8');

  let updatedCount = 0;

  // For each entry in calendarDates, find the x label and replace the
  // immediately following "sandex": <number> with the new computed value.
  // The regex matches "x": "MonthName D" ... "sandex": N within one object,
  // being careful not to cross object boundaries.
  src = src.replace(
    /"x":\s*"([^"]+)"([\s\S]*?)"sandex":\s*(\d+)/g,
    (match, label, middle, oldValue) => {
      const newValue = counts[label];
      if (newValue === undefined) {
        console.warn(`  No count found for label "${label}", keeping existing value ${oldValue}`);
        return match;
      }
      updatedCount++;
      return `"x": "${label}"${middle}"sandex": ${newValue}`;
    },
  );

  fs.writeFileSync(CALENDAR_DATES_FILE, src, 'utf8');
  console.log(`Updated ${updatedCount} sandex values in ${CALENDAR_DATES_FILE}`);
}

main();
