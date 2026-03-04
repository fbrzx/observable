/**
 * Data Loader: Earthquakes CSV
 *
 * This demonstrates how Observable Framework processes data at BUILD TIME.
 * This script runs on the server during build, fetches live data,
 * transforms it, and outputs a static CSV snapshot.
 *
 * Key concepts:
 * - Runs during build, not in the browser
 * - Outputs to stdout (which becomes the static file)
 * - Uses console.warn for debugging (doesn't contaminate output)
 */

import { csvFormat } from "d3-dsv";

// Fetch GeoJSON earthquake data from USGS
const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");

if (!response.ok) {
  throw new Error(`Fetch failed: ${response.status}`);
}

const collection = await response.json();

console.warn(`Fetched ${collection.features.length} earthquakes`);

// Transform GeoJSON into a flat array of objects
const earthquakes = collection.features.map((feature) => ({
  magnitude: feature.properties.mag,
  longitude: feature.geometry.coordinates[0],
  latitude: feature.geometry.coordinates[1],
  depth: feature.geometry.coordinates[2],
  place: feature.properties.place,
  time: feature.properties.time,
  url: feature.properties.url
}));

// Output as CSV - this becomes the static file
process.stdout.write(csvFormat(earthquakes));
