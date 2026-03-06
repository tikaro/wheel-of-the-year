/**
 * fetchOpenMeteo.js
 *
 * Fetches and caches Open-Meteo Historical Weather API hourly data
 * (temperature_2m and dew_point_2m) for West Chester, PA over 2020-2025.
 *
 * Data is chunked by month to keep requests manageable and cached as JSON
 * files in scripts/cache/ to avoid re-fetching.
 *
 * Usage:  node scripts/fetchOpenMeteo.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LAT = 39.985963;
const LON = -75.622057;
const TIMEZONE = 'America/New_York';
const START_YEAR = 2020;
const END_YEAR = 2025;

const CACHE_DIR = path.join(__dirname, 'cache');
const API_BASE = 'https://archive-api.open-meteo.com/v1/archive';

// Retry/backoff settings
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Returns the last day-of-month for a given year and month (1-based).
 */
function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Zero-pads a number to 2 digits.
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Sleeps for the given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a URL with exponential backoff retry on failure.
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body}`);
      }
      return await response.json();
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`  Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Fetches and caches one month of hourly data from Open-Meteo.
 * Returns the cached data (reading from disk if already cached).
 */
async function fetchMonth(year, month) {
  const monthStr = pad2(month);
  const cacheFile = path.join(CACHE_DIR, `openmeteo-${year}-${monthStr}.json`);

  if (fs.existsSync(cacheFile)) {
    console.log(`  [cache] ${year}-${monthStr}`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  const startDate = `${year}-${monthStr}-01`;
  const endDay = lastDayOfMonth(year, month);
  const endDate = `${year}-${monthStr}-${pad2(endDay)}`;

  const url =
    `${API_BASE}` +
    `?latitude=${LAT}` +
    `&longitude=${LON}` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}` +
    `&hourly=temperature_2m,dew_point_2m` +
    `&timezone=${encodeURIComponent(TIMEZONE)}`;

  console.log(`  [fetch] ${year}-${monthStr} (${startDate} to ${endDate})`);
  const data = await fetchWithRetry(url);

  // Small courtesy delay between API requests (0.5 s)
  await sleep(500);

  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

async function main() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  console.log(`Fetching Open-Meteo data for ${START_YEAR}-${END_YEAR}...`);
  let fetched = 0;
  let cached = 0;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = pad2(month);
      const cacheFile = path.join(CACHE_DIR, `openmeteo-${year}-${monthStr}.json`);
      if (fs.existsSync(cacheFile)) {
        cached++;
      } else {
        fetched++;
      }
      await fetchMonth(year, month);
    }
  }

  console.log(`Done. ${fetched} months fetched, ${cached} months from cache.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
