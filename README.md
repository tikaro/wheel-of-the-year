# Wheel of the Year

A React application built with [Vite](https://vite.dev/).

## Deployment
This application is deployed using [Netlify](https://app.netlify.com/projects/wheel-of-the-year/overview) to [wheel-of-the-year.tikaro.dev](https://wheel-of-the-year.tikaro.dev/).

## Development Environment

### Using Dev Containers / Codespaces

This repository includes a dev container configuration that provides a complete development environment with Node.js 20 and all necessary tools. You can use it with:

- **GitHub Codespaces**: Click the "Code" button on GitHub and select "Create codespace"
- **VS Code Dev Containers**: Install the Dev Containers extension and use "Reopen in Container"

See [.devcontainer/README.md](.devcontainer/README.md) for more details.

### Local Development

To develop locally without a container, ensure you have Node.js 20+ installed, then run:

```bash
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.

### `npm test`

Runs the test suite once using [Vitest](https://vitest.dev/).

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Sandex Counts

Each day-of-year slice in the wheel is colored by its **Sandex count** — the number
of years (out of 2020–2025) in which that calendar day had at least one hour with
"San Diego-like" weather at West Chester, PA (lat 39.985963, lon −75.622057).

### What is Sandex?

Sandex (from [tikaro/sandex](https://github.com/tikaro/sandex)) measures how many
hours a day felt like San Diego, CA — comfortably warm with low-to-moderate humidity:

- **Relative humidity**: 30 % – 60 %
- **Temperature**: between the lower and upper bounds defined by:
  - Lower: `−3.333 × RH% + 70 °F`
  - Upper: `−13.333 × RH% + 86 °F`

RH is derived from temperature and dew-point using the Magnus formula.

### Refreshing Sandex Data

The counts stored in `src/calendarDates.js` can be recomputed at any time from
[Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api)
hourly data using the scripts in `scripts/`.

#### Prerequisites

- Node.js 18 or higher (built-in `fetch` required)
- Internet access to reach `archive-api.open-meteo.com`

#### Steps

```bash
# 1. Fetch all hourly data (2020-2025, chunked by month, cached locally)
npm run sandex:fetch

# 2. Compute Sandex day-of-year counts from the cached data
npm run sandex:compute

# 3. Rewrite sandex values in src/calendarDates.js
npm run sandex:update

# Or run all three steps in sequence:
npm run sandex:refresh
```

#### Script descriptions

| Script | File | Description |
|---|---|---|
| `sandex:fetch` | `scripts/fetchOpenMeteo.js` | Downloads hourly `temperature_2m` and `dew_point_2m` from Open-Meteo for West Chester, PA for 2020–2025. Data is cached month-by-month in `scripts/cache/` (git-ignored). Already-cached months are skipped. Includes exponential-backoff retry on API errors. |
| `sandex:compute` | `scripts/computeSandexCounts.js` | Reads the cache, groups hourly observations by local date (America/New_York), applies Sandex thresholds, and counts the number of years each day-of-year was a Sandex day. Writes `scripts/output/sandex-counts-2020-2025.json`. |
| `sandex:update` | `scripts/updateCalendarDates.js` | Reads `sandex-counts-2020-2025.json` and rewrites the `sandex` field for every entry in `src/calendarDates.js`, preserving all other fields and formatting. |

#### Cached data

API responses are stored in `scripts/cache/openmeteo-YYYY-MM.json` (git-ignored).
Delete this directory to force a full re-fetch on the next `sandex:fetch` run.

#### Output artifact

`scripts/output/sandex-counts-2020-2025.json` is committed to the repository for
debugging and inspection. It contains the per-day-of-year counts and metadata
(location, period, generation timestamp).

---

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

To learn Vite, check out the [Vite documentation](https://vite.dev/).
