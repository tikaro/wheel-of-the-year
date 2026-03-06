/**
 * generateSyntheticCache.js
 *
 * Generates synthetic hourly weather cache files for West Chester, PA
 * (based on NOAA 1991-2020 Climate Normals for Philadelphia, PA) in the
 * same JSON format that Open-Meteo returns.  This script is a LOCAL
 * FALLBACK ONLY – it is used to produce a first-pass calendarDates.js
 * update when the Open-Meteo API is unavailable (e.g. in CI sandboxes).
 *
 * Running `npm run sandex:refresh` in an environment with internet access
 * will replace the cache files generated here with real historical API data
 * and re-compute authoritative Sandex counts.
 *
 * Methodology:
 *   - Uses NOAA 1991-2020 Climate Normals for Philadelphia (PHL) as monthly
 *     temperature (high / low) and dew-point averages.
 *   - Applies a realistic sinusoidal diurnal temperature cycle.
 *   - Adds day-to-day variation using a seeded deterministic AR(1) process
 *     so the output is repeatable / diffable.
 *   - Produces cache/openmeteo-YYYY-MM.json files identical in schema to the
 *     Open-Meteo archive endpoint response.
 *
 * Usage:  node scripts/generateSyntheticCache.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, 'cache');
const START_YEAR = 2020;
const END_YEAR = 2025;

// ---------------------------------------------------------------------------
// NOAA 1991-2020 Climate Normals for Philadelphia, PA (PHL)
// Columns: [avgHigh_C, avgLow_C, avgDewpoint_C]
// Jan=0 … Dec=11
// ---------------------------------------------------------------------------
const CLIMATE_NORMALS = [
  //  high    low    dewpt
  [4.72, -3.00, -4.00],   // Jan
  [6.78, -1.94, -3.56],   // Feb
  [12.06, 1.89, 0.11],   // Mar
  [18.39, 7.22, 5.56],   // Apr
  [24.00, 13.00, 12.00],  // May
  [28.78, 18.06, 16.72],  // Jun
  [31.22, 21.11, 20.00],  // Jul
  [30.33, 20.39, 19.89],  // Aug
  [26.56, 16.44, 15.56],  // Sep
  [19.67, 10.00, 8.67],   // Oct
  [13.50, 4.89, 3.61],   // Nov
  [7.44, -0.22, -1.67],   // Dec
];

// Diurnal temperature range multiplier (fraction of daily range used in cycle)
const DIURNAL_FRACTION = 0.95;
// Hour of maximum temperature (local clock hour)
const HOUR_OF_MAX = 15;
// Day-to-day temperature anomaly persistence (AR(1) coefficient)
const AR1_COEFF = 0.45;
// Standard deviation of daily temperature anomaly noise (°C)
const TEMP_NOISE_SIGMA = 4.0;
// Standard deviation of daily dewpoint anomaly noise (°C)
const DEWPT_NOISE_SIGMA = 2.5;

// ---------------------------------------------------------------------------
// Deterministic seeded random number generator (Park–Miller LCG)
// ---------------------------------------------------------------------------
function makeRNG(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 4294967296;
  };
}

/** Box-Muller transform: returns a standard normal sample. */
function randn(rng) {
  const u1 = rng() || 1e-10;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad2(n) {
  return String(n).padStart(2, '0');
}

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(year, month /* 1-based */) {
  return new Date(year, month, 0).getDate();
}

// ---------------------------------------------------------------------------
// Core generation
// ---------------------------------------------------------------------------

/**
 * Generates hourly synthetic temperature_2m and dew_point_2m arrays for one
 * calendar month using the NOAA normals + AR(1) noise.
 *
 * @param {number} year
 * @param {number} month  1-based
 * @returns {{ time: string[], temperature_2m: number[], dew_point_2m: number[] }}
 */
function generateMonth(year, month) {
  const seed = year * 100 + month;
  const rng = makeRNG(seed);

  const [highNorm, lowNorm, dewNorm] = CLIMATE_NORMALS[month - 1];
  const dailyRange = highNorm - lowNorm;
  const amplitude = (dailyRange * DIURNAL_FRACTION) / 2;
  const meanNorm = (highNorm + lowNorm) / 2;

  const days = daysInMonth(year, month);

  const times = [];
  const temps = [];
  const dewpts = [];

  let tempAnom = 0;  // AR(1) state for temperature anomaly
  let dewAnom = 0;   // AR(1) state for dewpoint anomaly

  for (let day = 1; day <= days; day++) {
    // AR(1) anomaly update
    tempAnom = AR1_COEFF * tempAnom + (1 - AR1_COEFF) * TEMP_NOISE_SIGMA * randn(rng);
    dewAnom = AR1_COEFF * dewAnom + (1 - AR1_COEFF) * DEWPT_NOISE_SIGMA * randn(rng);

    const dayMean = meanNorm + tempAnom;
    const dayDew = dewNorm + dewAnom;

    for (let hour = 0; hour < 24; hour++) {
      // Sinusoidal diurnal cycle: max at HOUR_OF_MAX, min 12 hours later
      const diurnal = amplitude * Math.cos((2 * Math.PI * (hour - HOUR_OF_MAX)) / 24);
      const tempC = dayMean + diurnal;

      // Dewpoint varies slightly: depressed by ~15% of amplitude in the
      // afternoon (mixing effect), otherwise near the daily average.
      const dewDiurnal = -0.15 * amplitude * Math.cos((2 * Math.PI * (hour - HOUR_OF_MAX)) / 24);
      const dewC = dayDew + dewDiurnal;

      const timeStr = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:00`;
      times.push(timeStr);
      temps.push(Math.round(tempC * 10) / 10);
      dewpts.push(Math.round(dewC * 10) / 10);
    }
  }

  return { time: times, temperature_2m: temps, dew_point_2m: dewpts };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  let written = 0;
  let skipped = 0;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = pad2(month);
      const cacheFile = path.join(CACHE_DIR, `openmeteo-${year}-${monthStr}.json`);

      if (fs.existsSync(cacheFile)) {
        skipped++;
        continue;
      }

      const hourly = generateMonth(year, month);
      const payload = {
        latitude: 39.985963,
        longitude: -75.622057,
        timezone: 'America/New_York',
        hourly_units: { time: 'iso8601', temperature_2m: '°C', dew_point_2m: '°C' },
        hourly,
      };

      fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf8');
      written++;
    }
  }

  console.log(
    `Synthetic cache generated: ${written} months written, ${skipped} already present.`,
  );
  console.log(
    'NOTE: These are synthetic values from NOAA Climate Normals, NOT real historical data.',
  );
  console.log(
    'Run "npm run sandex:refresh" with internet access to replace with real Open-Meteo data.',
  );
}

main();
