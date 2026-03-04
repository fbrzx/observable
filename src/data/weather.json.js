/**
 * Data Loader: Weather Forecast JSON
 *
 * This demonstrates:
 * - Chaining multiple API requests
 * - Outputting JSON format
 * - Using async/await for data processing
 */

const longitude = -122.47; // San Francisco
const latitude = 37.80;

// Helper function for fetching JSON
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  return await response.json();
}

// Step 1: Get grid point for the location
console.warn(`Fetching weather data for lat: ${latitude}, lon: ${longitude}`);

const gridPoint = await fetchJSON(
  `https://api.weather.gov/points/${latitude},${longitude}`
);

// Step 2: Get the forecast using the URL from step 1
const forecast = await fetchJSON(gridPoint.properties.forecastHourly);

// Step 3: Process and simplify the data
const processedForecast = {
  generatedAt: forecast.generatedAt,
  units: forecast.properties.units,
  periods: forecast.properties.periods.slice(0, 24).map((period) => ({
    startTime: period.startTime,
    endTime: period.endTime,
    temperature: period.temperature,
    temperatureUnit: period.temperatureUnit,
    windSpeed: period.windSpeed,
    windDirection: period.windDirection,
    shortForecast: period.shortForecast
  }))
};

console.warn(`Processed ${processedForecast.periods.length} forecast periods`);

// Output as JSON
process.stdout.write(JSON.stringify(processedForecast, null, 2));
