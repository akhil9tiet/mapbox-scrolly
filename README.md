# Scrolly Map

An interactive example of a **scrollytelling map**: as you read the story, the map follows a road trip from Twin Peaks to the Golden Gate Bridge in San Francisco.

[Open the live scrolly map](https://akhil9tiet.github.io/mapbox-scrolly).

Scroll through the six story chapters to reveal the route, follow the moving camera, and watch the current street and journey progress update. You can also select a chapter to jump to that moment or replay the journey from the beginning.

> **Try it:** run the app locally with the instructions below, then scroll the story beside the map. On smaller screens, the map stays at the top while you read.

## Contents

- [Explore the story](#explore-the-story)
- [Run it locally](#run-it-locally)
- [How it works](#how-it-works)
- [Data and map credits](#data-and-map-credits)

## Explore the story

| Chapter | What changes |
| --- | --- |
| 01 · Get oriented | Start with the complete journey in view. |
| 02 · Follow the road | The route begins to draw and the camera follows along it. |
| 03 · Keep your place | Track the current position and street as the story advances. |
| 04 · Change the scale | The camera shifts between street-level detail and a wider view. |
| 05 · Arrive | Follow the final stretch toward the Golden Gate Bridge. |
| 06 · Your pace | Choose a chapter or replay the route. |

## Run it locally

You'll need Node.js and npm installed.

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to explore the story. Scroll, select a chapter card, or use **Replay the route** to start again.

To create a production build:

```bash
npm run build
```

## Deploy to GitHub Pages

The included GitHub Actions workflow builds and deploys the site whenever changes are pushed to `main`. The production build is configured for the project URL, `https://akhil9tiet.github.io/mapbox-scrolly`.

For the first deployment, open the repository's **Settings → Pages** and set the build and deployment source to **GitHub Actions**. Then push to `main`, or run **Deploy to GitHub Pages** from the repository's **Actions** tab. The published site is available at the link above after the workflow completes.

To authenticate CARTO dark tiles, create a key at [CARTO's basemaps API key page](https://carto.com/basemaps/apikey/).

- **Local development:** create `.env.local` in the project root and add `REACT_APP_CARTO_API_KEY=your_key`. Restart `npm start` after changing it. Keep this file private; environment files are ignored by Git.
- **GitHub Pages:** in the repository, open **Settings → Secrets and variables → Actions → Secrets**, select **New repository secret**, and enter `REACT_APP_CARTO_API_KEY` as the name and your CARTO key as the secret value. Do not add it under **Variables** or **Environment variables**. After saving it, rerun **Deploy to GitHub Pages** from the **Actions** tab so the key is included in the next build.

Browser map keys are included in requests from the published site. Restrict the key to `akhil9tiet.github.io` in CARTO if domain restrictions are available. Without a key, the app still tries CARTO's dark tiles and falls back to OpenStreetMap if the style fails.

## Google Analytics

The app supports Google Analytics 4 (GA4). Create a GA4 property and web data stream in [Google Analytics](https://analytics.google.com/), then copy its Measurement ID (it starts with `G-`).

- **Local development:** add `REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to `.env.local` in the project root, then restart `npm start`.
- **GitHub Pages:** in **Settings → Secrets and variables → Actions → Variables**, create a **repository variable** named `REACT_APP_GA_MEASUREMENT_ID` and set its value to the Measurement ID. It is an identifier, not a secret. Push to `main` or rerun **Deploy to GitHub Pages** to rebuild the site.

Analytics is disabled when the ID is unset. When enabled, the app sends the standard page view and a `chapter_view` event as readers enter each chapter. The Measurement ID is embedded in the browser build, so it is visible to site visitors. Make sure your use of Google Analytics follows the privacy and consent requirements that apply to your audience.

## How it works

- **React** renders the story, chapter cards, and map interface.
- **Lenis** smooths page scrolling. Scroll position drives the active chapter, route progress, and map camera.
- **MapLibre GL JS**, through `react-map-gl`, renders the map and smoothly eases camera changes.
- **deck.gl** draws the complete route and the portion revealed so far.
- The driving route and street names are requested from the public **OSRM demo routing service** when the app loads. An internet connection is required; if the route service is unavailable, the app offers a retry.
- The map uses CARTO's dark raster tiles by default, with OpenStreetMap raster tiles as a fallback if CARTO is unavailable.

The main story and route interaction live in [`src/App.tsx`](./src/App.tsx). The map camera and rendering are in [`src/components/map/MapCanvas.tsx`](./src/components/map/MapCanvas.tsx).

## Data and map credits

- Route geometry and road-step names: [OSRM](https://project-osrm.org/) using OpenStreetMap data.
- Map tiles: [CARTO](https://carto.com/) dark tiles by default, with [OpenStreetMap](https://www.openstreetmap.org/copyright) as the fallback.
