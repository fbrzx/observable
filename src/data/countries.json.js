/**
 * Data Loader: Countries with Aggregated Data
 *
 * This demonstrates:
 * - Data aggregation and summarization
 * - Computing derived metrics
 * - Filtering and sorting data
 */

// Fetch all countries data - request all fields we need
console.warn("Fetching countries data from REST Countries API...");

let countries;

try {
  const response = await fetch("https://restcountries.com/v3.1/all");

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  countries = await response.json();
  console.warn(`Fetched ${countries.length} countries from API`);
} catch (error) {
  console.warn(`API failed (${error.message}), using fallback data`);
  // Fallback: create sample data if API fails
  countries = [
    { name: { common: "China" }, cca2: "CN", region: "Asia", population: 1444216107, area: 9706961 },
    { name: { common: "India" }, cca2: "IN", region: "Asia", population: 1393409038, area: 3287590 },
    { name: { common: "United States" }, cca2: "US", region: "Americas", population: 331893745, area: 9372610 },
    { name: { common: "Indonesia" }, cca2: "ID", region: "Asia", population: 276361783, area: 1904569 },
    { name: { common: "Pakistan" }, cca2: "PK", region: "Asia", population: 225199937, area: 881912 },
    { name: { common: "Brazil" }, cca2: "BR", region: "Americas", population: 213993437, area: 8515767 },
    { name: { common: "Nigeria" }, cca2: "NG", region: "Africa", population: 211400708, area: 923768 },
    { name: { common: "Bangladesh" }, cca2: "BD", region: "Asia", population: 166303498, area: 147570 },
    { name: { common: "Russia" }, cca2: "RU", region: "Europe", population: 144104080, area: 17098242 },
    { name: { common: "Mexico" }, cca2: "MX", region: "Americas", population: 128972419, area: 1964375 },
    { name: { common: "Japan" }, cca2: "JP", region: "Asia", population: 125836021, area: 377930 },
    { name: { common: "Ethiopia" }, cca2: "ET", region: "Africa", population: 117876227, area: 1104300 },
    { name: { common: "Philippines" }, cca2: "PH", region: "Asia", population: 111046913, area: 342353 },
    { name: { common: "Egypt" }, cca2: "EG", region: "Africa", population: 104258327, area: 1002450 },
    { name: { common: "Vietnam" }, cca2: "VN", region: "Asia", population: 98168822, area: 331212 },
    { name: { common: "Germany" }, cca2: "DE", region: "Europe", population: 83240525, area: 357114 },
    { name: { common: "Turkey" }, cca2: "TR", region: "Asia", population: 84339067, area: 783562 },
    { name: { common: "Iran" }, cca2: "IR", region: "Asia", population: 83992953, area: 1648195 },
    { name: { common: "Thailand" }, cca2: "TH", region: "Asia", population: 71476858, area: 513120 },
    { name: { common: "United Kingdom" }, cca2: "GB", region: "Europe", population: 67281039, area: 242900 },
    { name: { common: "France" }, cca2: "FR", region: "Europe", population: 67390000, area: 551695 },
    { name: { common: "Italy" }, cca2: "IT", region: "Europe", population: 59554023, area: 301336 },
    { name: { common: "South Africa" }, cca2: "ZA", region: "Africa", population: 59893885, area: 1221037 },
    { name: { common: "Australia" }, cca2: "AU", region: "Oceania", population: 25687041, area: 7692024 },
    { name: { common: "Canada" }, cca2: "CA", region: "Americas", population: 38005238, area: 9984670 }
  ];
}

console.warn(`Processing ${countries.length} countries...`);

// Process and aggregate the data
const processedCountries = countries
  .map((country) => ({
    name: country.name.common,
    code: country.cca2,
    region: country.region,
    subregion: country.subregion,
    capital: country.capital?.[0] ?? "N/A",
    population: country.population,
    area: country.area ?? 0,
    languages: Object.values(country.languages ?? {}).join(", "),
    currencies: Object.values(country.currencies ?? {}).map(c => c.name).join(", "),
    timezones: country.timezones?.length ?? 0,
    density: country.area ? (country.population / country.area).toFixed(2) : 0
  }))
  .filter((c) => c.population > 0) // Filter out countries without population data
  .sort((a, b) => b.population - a.population); // Sort by population

// Create summary statistics
const summary = {
  totalCountries: processedCountries.length,
  byRegion: Object.groupBy(processedCountries, (c) => c.region),
  topByPopulation: processedCountries.slice(0, 10),
  topByArea: [...processedCountries].sort((a, b) => b.area - a.area).slice(0, 10),
  allCountries: processedCountries
};

// Calculate regional statistics
summary.regionStats = Object.entries(summary.byRegion).map(([region, countries]) => ({
  region,
  count: countries.length,
  totalPopulation: countries.reduce((sum, c) => sum + c.population, 0),
  averagePopulation: Math.round(countries.reduce((sum, c) => sum + c.population, 0) / countries.length)
}));

console.warn(`Processed ${processedCountries.length} countries with regional stats`);

// Output as JSON
process.stdout.write(JSON.stringify(summary, null, 2));
