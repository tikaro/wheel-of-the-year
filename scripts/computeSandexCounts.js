/**
 * computeSandexCounts.js
 *
 * Reads cached Open-Meteo hourly data from scripts/cache/ and computes
 * the Sandex count for each day-of-year (matching the x-field labels in
 * src/calendarDates.js).
 *
 * Sandex definition (from tikaro/sandex):
 *   A day is a "Sandex day" for a given year if at least one hourly
 *   observation satisfies all of the following:
 *     - 30% <= relative humidity <= 60%
 *     - temperature > temperatureLowerBound(rh%)  (-3.3333333 * rh% + 70 °F)
 *     - temperature < temperatureUpperBound(rh%)  (-13.3333333 * rh% + 86 °F)
 *
 *   RH is derived from temperature and dew-point (both in °C from Open-Meteo)
 *   using the Magnus formula, then clamped to [0, 100].
 *   Temperature is converted from °C to °F for the threshold comparisons.
 *
 * The sandex count for each day-of-year label is the number of years
 * (out of 2020-2025) in which that day was a Sandex day.
 *
 * Output: scripts/output/sandex-counts-2020-2025.json
 *
 * Usage:  node scripts/computeSandexCounts.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, 'cache');
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sandex-counts-2020-2025.json');

const START_YEAR = 2020;
const END_YEAR = 2025;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---------------------------------------------------------------------------
// Sandex threshold functions (mirrored from tikaro/sandex)
// ---------------------------------------------------------------------------

/**
 * Computes relative humidity (%) from temperature and dew-point in °C
 * using the Magnus formula. Result is clamped to [0, 100].
 *
 * Source: https://bmcnoldy.rsmas.miami.edu/Humidity.html
 */
function computeRH(tempC, dewpointC) {
  const rh =
    100 *
    (Math.exp((17.625 * dewpointC) / (243.04 + dewpointC)) /
      Math.exp((17.625 * tempC) / (243.04 + tempC)));
  return Math.min(100, Math.max(0, rh));
}

/** Converts °C to °F */
function cToF(c) {
  return c * 9 / 5 + 32;
}

/** Lower temperature bound (°F) for a given humidity fraction (0-1). */
function temperatureLowerBound(pct) {
  return -3.3333333 * pct + 70;
}

/** Upper temperature bound (°F) for a given humidity fraction (0-1). */
function temperatureUpperBound(pct) {
  return -13.3333333 * pct + 86;
}

/**
 * Returns true if an hour with the given temperature (°F) and relative
 * humidity (%) satisfies the Sandex thresholds.
 */
function hourIsSandex(tempF, rh) {
  const pct = rh / 100;
  if (pct < 0.3 || pct > 0.6) return false;
  if (tempF <= temperatureLowerBound(pct)) return false;
  if (tempF >= temperatureUpperBound(pct)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Day-label helpers
// ---------------------------------------------------------------------------

/**
 * Converts a date string "YYYY-MM-DD" to a label like "June 21".
 */
function dateToLabel(dateStr) {
  const parts = dateStr.split('T')[0].split('-');
  const month = MONTHS[parseInt(parts[1], 10) - 1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

/**
 * Returns true if dateStr is February 29 (skip leap-day).
 */
function isFeb29(dateStr) {
  const d = dateStr.split('T')[0];
  return d.endsWith('-02-29');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function pad2(n) {
  return String(n).padStart(2, '0');
}

function main() {
  // counts[label][year] = true if that year/day was a Sandex day
  const sandexYears = {}; // label -> Set of years

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = pad2(month);
      const cacheFile = path.join(CACHE_DIR, `openmeteo-${year}-${monthStr}.json`);

      if (!fs.existsSync(cacheFile)) {
        console.error(`Missing cache file: ${cacheFile}`);
        console.error('Run "npm run sandex:fetch" first.');
        process.exit(1);
      }

      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const times = data.hourly.time;
      const temps = data.hourly.temperature_2m;
      const dewpoints = data.hourly.dew_point_2m;

      for (let i = 0; i < times.length; i++) {
        const timeStr = times[i]; // e.g. "2020-06-21T14:00"
        if (isFeb29(timeStr)) continue;

        const label = dateToLabel(timeStr);
        const tempC = temps[i];
        const dewpointC = dewpoints[i];

        // Skip missing observations
        if (tempC === null || dewpointC === null) continue;

        const rh = computeRH(tempC, dewpointC);
        const tempF = cToF(tempC);

        if (hourIsSandex(tempF, rh)) {
          if (!sandexYears[label]) sandexYears[label] = new Set();
          sandexYears[label].add(year);
        }
      }
    }
  }

  // Convert to counts (number of years where the day was a Sandex day)
  const counts = {};
  for (const [label, yearSet] of Object.entries(sandexYears)) {
    counts[label] = yearSet.size;
  }

  // Ensure all 365 day labels have an entry (0 if never sandex)
  // We derive the full label list from the calendarDates file so the keys
  // match exactly what the app uses.
  const calendarDatesPath = path.join(__dirname, '..', 'src', 'calendarDates.js');
  const calendarSrc = fs.readFileSync(calendarDatesPath, 'utf8');
  const xLabels = [...calendarSrc.matchAll(/"x":\s*"([^"]+)"/g)].map((m) => m[1]);

  for (const label of xLabels) {
    if (counts[label] === undefined) {
      counts[label] = 0;
    }
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    period: `${START_YEAR}-${END_YEAR}`,
    location: {
      name: 'West Chester, PA',
      latitude: 39.985963,
      longitude: -75.622057,
      timezone: 'America/New_York',
    },
    counts,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Sandex counts written to ${OUTPUT_FILE}`);

  // Print a quick summary
  const total = xLabels.length;
  const sandexDays = xLabels.filter((l) => counts[l] > 0).length;
  console.log(`${sandexDays} of ${total} day-of-year labels have sandex > 0`);
}

main();
