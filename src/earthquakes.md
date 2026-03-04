# Earthquake Visualization

This page demonstrates loading CSV data that was processed at build time.

## Data Flow

```
earthquakes.csv.js (build time) → earthquakes.csv (static file) → This page (runtime)
```

## Load Data

```js
// Load the pre-processed CSV data
// await ensures data is loaded before we use it
const earthquakesData = await FileAttachment("data/earthquakes.csv").csv({typed: true});
```

```js
// Create a reactive input for filtering
const minMagnitude = view(Inputs.select([1, 2, 3, 4, 5], {label: "Minimum Magnitude", value: 2}));
```

```js
// Filter earthquakes based on the selected magnitude
// This automatically re-runs when minMagnitude changes
const filteredEarthquakes = earthquakesData.filter(q => q.magnitude >= minMagnitude);
```

## Interactive Map

```js
// Render the map using D3 and TopoJSON
{
  const data = filteredEarthquakes;

  // World topology
  const world = await fetch(import.meta.resolve("npm:visionscarto-world-atlas/world/110m.json")).then(r => r.json());
  const geometry = world.objects.countries ?? world.objects.land;
  const countries = topojson.feature(world, geometry);
  const countryFeatures = countries.type === "FeatureCollection" ? countries.features : [countries];

  // Create scales
  const magnitudeScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.magnitude) ?? 8])
    .range([0, 8]);

  const colorScale = d3.scaleThreshold()
    .domain([3, 5, 7])
    .range(["#fbb4ae", "#f768a1", "#882371", "#4a148c"]);

  // Create the map
  const width = 960;
  const height = 500;

  const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("cursor", "grab");

  const resetButton = html`<button style="margin-bottom: 8px; padding: 6px 10px; border: 1px solid #111827; border-radius: 4px; background: #111827; color: #ffffff; font-weight: 600; cursor: pointer;">Reset zoom</button>`;

  const mapLayer = svg.append("g");

  const projectedData = data
    .map(d => ({...d, coords: projection([d.longitude, d.latitude])}))
    .filter(d => d.coords);

  // Draw countries
  mapLayer.append("g")
    .selectAll("path")
    .data(countryFeatures)
    .join("path")
    .attr("fill", "#e5e5e5")
    .attr("stroke", "#ffffff")
    .attr("d", path);

  // Draw earthquake points
  mapLayer.append("g")
    .selectAll("circle")
    .data(projectedData)
    .join("circle")
    .attr("cx", d => d.coords[0])
    .attr("cy", d => d.coords[1])
    .attr("r", d => magnitudeScale(d.magnitude))
    .attr("fill", d => colorScale(d.magnitude))
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(d => `${d.place}\nMagnitude: ${d.magnitude}`);

  // Zoom / pan interaction
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("start", () => svg.style("cursor", "grabbing"))
    .on("end", () => svg.style("cursor", "grab"))
    .on("zoom", (event) => {
      mapLayer.attr("transform", event.transform);
    });

  svg.call(zoom);

  resetButton.addEventListener("click", () => {
    svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  });

  // Add legend
  const legend = svg.append("g")
    .attr("transform", "translate(20, 20)");

  const legendColors = [2.5, 4, 6, 8];
  legend.selectAll("circle")
    .data(legendColors)
    .join("circle")
    .attr("cy", (d, i) => i * 25)
    .attr("r", d => magnitudeScale(d))
    .attr("fill", d => colorScale(d))
    .attr("stroke", "#000");

  legend.selectAll("text")
    .data(legendColors)
    .join("text")
    .attr("x", 15)
    .attr("y", (d, i) => i * 25 + 4)
    .text(d => `M${d}+`)
    .style("font-size", "12px")
    .style("fill", "#666");

  svg.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Magnitude")
    .style("font-size", "14px")
    .style("fill", "#666");

  svg.append("text")
    .attr("x", 20)
    .attr("y", height - 12)
    .text(`Showing ${projectedData.length} earthquakes (M ≥ ${minMagnitude})`)
    .style("font-size", "12px")
    .style("fill", "#666");

  const container = html`<div>${resetButton}</div>`;
  container.append(svg.node());
  display(container);
}
```

## Data Statistics

```js
// Compute statistics from the loaded data
const stats = {
  total: earthquakesData.length,
  maxMagnitude: d3.max(earthquakesData, d => d.magnitude),
  avgMagnitude: d3.mean(earthquakesData, d => d.magnitude),
  maxDepth: d3.max(earthquakesData, d => d.depth)
};
```

| Statistic | Value |
|-----------|-------|
| Total Earthquakes | ${stats.total} |
| Maximum Magnitude | ${stats.maxMagnitude?.toFixed(1) ?? 'N/A'} |
| Average Magnitude | ${stats.avgMagnitude?.toFixed(2) ?? 'N/A'} |
| Maximum Depth (km) | ${stats.maxDepth?.toFixed(1) ?? 'N/A'} |

## Magnitude Distribution

```js
// Create a histogram of earthquake magnitudes
{
  const data = earthquakesData;

  const bins = d3.bin()
    .value(d => d.magnitude)
    .thresholds(d3.range(0, 10, 0.5))
    (data);

  const width = 600;
  const height = 300;
  const margin = {top: 20, right: 20, bottom: 40, left: 40};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, 10])
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length) ?? 0])
    .range([innerHeight, 0]);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", d => x(d.x0))
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr("height", d => innerHeight - y(d.length))
    .attr("fill", "#f768a1");

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 35)
    .text("Magnitude")
    .attr("text-anchor", "middle");

  // Y axis
  g.append("g")
    .call(d3.axisLeft(y));

  // Y axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -30)
    .text("Count")
    .attr("text-anchor", "middle");

  svg.node();
}
```

## How This Works

1. **Build Time**: `earthquakes.csv.js` fetches data from USGS API and outputs CSV
2. **Static File**: The CSV is saved as `data/earthquakes.csv`
3. **Runtime**: This page loads the CSV using `await FileAttachment("data/earthquakes.csv").csv()`
4. **Reactivity**: When `minMagnitude` changes, `filteredEarthquakes` automatically recomputes

The key pattern:
- Use `await` to load data from FileAttachment
- Reference loaded data directly in subsequent blocks
- Use Observable's reactive runtime for automatic updates
