# Weather Forecast Visualization

This page demonstrates loading JSON data that was processed at build time from a chained API request.

## Data Flow

```
weather.json.js (build time)
  → Fetches grid point from weather.gov
  → Fetches forecast using grid point URL
  → Outputs weather.json (static file)
  → This page loads and visualizes (runtime)
```

## Load Data

```js
// Load the pre-processed JSON data
// FileAttachment().json() returns a promise that the runtime automatically awaits
const weatherData = await FileAttachment("data/weather.json").json();
const periods = weatherData.periods;
```

## Temperature Forecast Chart

```js
// Create the temperature line chart
{
  const width = 900;
  const height = 400;
  const margin = {top: 20, right: 30, bottom: 60, left: 50};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Parse dates
  const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
  const dates = periods.map(d => parseDate(d.startTime));

  // Scales
  const x = d3.scaleTime()
    .domain(d3.extent(dates))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(periods, d => d.temperature) - 5,
      d3.max(periods, d => d.temperature) + 5
    ])
    .range([innerHeight, 0]);

  // Line generator
  const line = d3.line()
    .x((d, i) => x(dates[i]))
    .y(d => y(d.temperature))
    .curve(d3.curveMonotoneX);

  // Area generator
  const area = d3.area()
    .x((d, i) => x(dates[i]))
    .y0(innerHeight)
    .y1(d => y(d.temperature))
    .curve(d3.curveMonotoneX);

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Gradient definition
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "tempGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#f768a1")
    .attr("stop-opacity", 0.8);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#f768a1")
    .attr("stop-opacity", 0.1);

  // Area fill
  g.append("path")
    .datum(periods)
    .attr("fill", "url(#tempGradient)")
    .attr("d", area);

  // Line
  g.append("path")
    .datum(periods)
    .attr("fill", "none")
    .attr("stroke", "#f768a1")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Points
  g.selectAll("circle")
    .data(periods)
    .join("circle")
    .attr("cx", (d, i) => x(dates[i]))
    .attr("cy", d => y(d.temperature))
    .attr("r", 4)
    .attr("fill", "#fff")
    .attr("stroke", "#f768a1")
    .attr("stroke-width", 2)
    .append("title")
    .text(d => `${d.shortForecast}\n${d.temperature}°${d.temperatureUnit}\nWind: ${d.windSpeed} ${d.windDirection}`)
    .style("fill", "#fff");

  // X Axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x)
      .ticks(d3.timeHour.every(6))
      .tickFormat(d3.timeFormat("%b %d\n%H:%M")))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y Axis
  g.append("g")
    .call(d3.axisLeft(y)
      .tickFormat(d => `${d}°F`));

  // Y Axis Label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .text("Temperature (°F)")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#fff");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .text(`24-Hour Temperature Forecast - San Francisco`)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#fff");

  display(svg.node());
}
```

## Wind Speed Visualization

```js
// Create a bar chart for wind speed
{
  const displayPeriods = periods.slice(0, 12); // Show first 12 hours

  const width = 700;
  const height = 300;
  const margin = {top: 20, right: 20, bottom: 60, left: 50};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Parse wind speed (handle ranges like "10-15 mph")
  const parseWindSpeed = (str) => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const windSpeeds = displayPeriods.map(d => parseWindSpeed(d.windSpeed));
  const labels = displayPeriods.map(d => {
    const date = new Date(d.startTime);
    return date.getHours() + ":00";
  });

  // Scales
  const x = d3.scaleBand()
    .domain(labels)
    .range([0, innerWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(windSpeeds) + 5])
    .range([innerHeight, 0]);

  // Color scale for wind
  const windColor = d3.scaleThreshold()
    .domain([10, 20, 30])
    .range(["#a8ddb5", "#4eb3d3", "#f768a1", "#882371"]);

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll("rect")
    .data(windSpeeds)
    .join("rect")
    .attr("x", (d, i) => x(labels[i]))
    .attr("y", d => y(d))
    .attr("width", x.bandwidth())
    .attr("height", d => innerHeight - y(d))
    .attr("fill", d => windColor(d))
    .append("title")
    .text((d, i) => `${displayPeriods[i].shortForecast}\nWind: ${displayPeriods[i].windSpeed} ${displayPeriods[i].windDirection}`)
    .style("fill", "#fff");

  // X Axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y Axis
  g.append("g")
    .call(d3.axisLeft(y));

  // Labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .text("Hour")
    .attr("text-anchor", "middle");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .text("Wind Speed (mph)") 
    .style("fill", "#fff")
    .attr("text-anchor", "middle");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .text("Wind Speed Forecast (first 12 hours)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#fff")
    .style("font-weight", "bold");

  display(svg.node());
}
```

## Forecast Data Table

```js
// Display table
{
  const displayPeriods = periods.slice(0, 12);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "13px";

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headRow.style.borderBottom = "2px solid #ddd";

  const headers = ["Time", "Temp (°F)", "Forecast", "Wind"];
  const headerAlign = ["left", "center", "left", "center"];

  headers.forEach((text, i) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.padding = "10px";
    th.style.textAlign = headerAlign[i];
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();

  displayPeriods.forEach(p => {
    const row = tbody.insertRow();
    row.style.borderBottom = "1px solid #eee";

    const timeCell = row.insertCell();
    timeCell.style.padding = "10px";
    timeCell.textContent = new Date(p.startTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric"
    });

    const tempCell = row.insertCell();
    tempCell.style.padding = "10px";
    tempCell.style.textAlign = "center";
    tempCell.style.fontWeight = "bold";
    tempCell.style.color = "#f768a1";
    tempCell.textContent = `${p.temperature}°`;

    const forecastCell = row.insertCell();
    forecastCell.style.padding = "10px";
    forecastCell.textContent = p.shortForecast;

    const windCell = row.insertCell();
    windCell.style.padding = "10px";
    windCell.style.textAlign = "center";
    windCell.textContent = `${p.windSpeed} ${p.windDirection}`;
  });

  display(table);
}
```

## How This Works

1. **Build Time**: `weather.json.js` makes **two chained API requests**:
   - First to get the grid point for coordinates
   - Second to get the forecast using the URL from step 1

2. **Processing**: The data is simplified and limited to 24 periods

3. **Runtime**: The visualization loads instantly from the static JSON file

4. **Key Pattern**: Use `await FileAttachment(...).json()` to load data, then reference it directly in subsequent code blocks
