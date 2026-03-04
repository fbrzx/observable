# Countries Data Dashboard

This page demonstrates data aggregation, grouping, and sorting with interactive visualizations.

## Load Data

```js
// Load the pre-processed and aggregated countries data
const countriesData = await FileAttachment("data/countries.json").json();
const allCountries = countriesData.allCountries;
const regionStats = countriesData.regionStats;
const topByPopulation = countriesData.topByPopulation;

const formatMil = value => d3.format(".2s")(value).replace("G", "B");
```

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Countries | ${countriesData.totalCountries} |
| Number of Regions | ${new Set(allCountries.map(c => c.region)).size} |
| Most Populous | ${topByPopulation[0].name} (${(topByPopulation[0].population / 1000000000).toFixed(2)}B) |
| Largest by Area | ${countriesData.topByArea[0].name} (${countriesData.topByArea[0].area.toLocaleString()} km²) |

## Population by Region

```js
// Create a bar chart showing population by region
{
  const width = 700;
  const height = 400;
  const margin = {top: 20, right: 20, bottom: 60, left: 80};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const x = d3.scaleBand()
    .domain(regionStats.map(d => d.region))
    .range([0, innerWidth])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(regionStats, d => d.totalPopulation) * 1.1])
    .range([innerHeight, 0]);

  // Color scale
  const colorScale = d3.scaleQuantize()
    .domain([0, d3.max(regionStats, d => d.totalPopulation)])
    .range(["#a8ddb5", "#4eb3d3", "#f768a1", "#882371"]);

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll("rect")
    .data(regionStats)
    .join("rect")
    .attr("x", d => x(d.region))
    .attr("y", d => y(d.totalPopulation))
    .attr("width", x.bandwidth())
    .attr("height", d => innerHeight - y(d.totalPopulation))
    .attr("fill", d => colorScale(d.totalPopulation))
    .append("title")
    .text(d => `${d.region}\nPopulation: ${formatMil(d.totalPopulation)}\nCountries: ${d.count}`);

  // X Axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-25)")
    .style("text-anchor", "end")
    .style("font-size", "11px");

  // Y Axis
  g.append("g")
    .call(d3.axisLeft(y)
      .tickFormat(d => formatMil(d)));

  // Y Label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -60)
    .text("Total Population")
    .style("fill", "#666")
    .attr("text-anchor", "middle");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .text("Population by Region")
    .attr("text-anchor", "middle")
    .style("fill", "#666")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  display(svg.node());
}
```

## Top 10 Countries by Population

```js
// Create a horizontal bar chart for top countries
{
  const top10 = topByPopulation;

  const width = 800;
  const height = 350;
  const margin = {top: 20, right: 120, bottom: 20, left: 150};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const y = d3.scaleBand()
    .domain(top10.map(d => d.name))
    .range([0, innerHeight])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.population) * 1.1])
    .range([0, innerWidth]);

  // Color scale
  const popColor = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.population)])
    .range(["#a8ddb5", "#882371"]);

  const formatPop = d3.format(",.0f");

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll("rect")
    .data(top10)
    .join("rect")
    .attr("x", 0)
    .attr("y", d => y(d.name))
    .attr("width", d => x(d.population))
    .attr("height", y.bandwidth())
    .attr("fill", d => popColor(d.population))
    .attr("rx", 4);

  // Country labels
  g.selectAll(".country-label")
    .data(top10)
    .join("text")
    .attr("x", -10)
    .attr("y", d => y(d.name) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(d => d.name)
    .style("font-size", "11px")
    .style("fill", "#fff");

  // Population labels
  g.selectAll(".pop-label")
    .data(top10)
    .join("text")
    .attr("x", d => x(d.population) + 5)
    .attr("y", d => y(d.name) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => formatPop(d.population))
    .style("font-size", "11px")
    .style("fill", "#fff");

  // X Axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x)
      .ticks(5)
      .tickFormat(d => formatMil(d)));

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .text("Top 10 Most Populous Countries")
    .attr("text-anchor", "middle")
    .style("fill", "#666")
    .style("font-size", "14px")
    .style("font-weight", "bold");

  display(svg.node());
}
```

## Interactive Data Table

```js
// Create an interactive, filterable table
{
  // Create filter input
  const searchInput = html`<input type="text" placeholder="Search countries..." style="padding: 8px; width: 250px; border: 1px solid #ddd; border-radius: 4px;">`;

  // Create region filter
  const regions = [...new Set(allCountries.map(c => c.region))].sort();
  const regionSelect = html`
    <select style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <option value="">All Regions</option>
      ${regions.map(r => html`<option value="${r}">${r}</option>`)}
    </select>
  `;

  // Render function
  function renderTable(data) {
    const tbody = container.querySelector('#countries-tbody');
    tbody.replaceChildren();

    data.slice(0, 50).forEach(c => {
      const row = tbody.insertRow();
      row.style.borderBottom = "1px solid #eee";

      const nameCell = row.insertCell();
      nameCell.style.padding = "10px";
      nameCell.style.fontWeight = "500";
      nameCell.textContent = c.name;

      const regionCell = row.insertCell();
      regionCell.style.padding = "10px";
      regionCell.style.color = "#666";
      regionCell.textContent = c.region;

      const populationCell = row.insertCell();
      populationCell.style.padding = "10px";
      populationCell.style.textAlign = "right";
      populationCell.textContent = c.population.toLocaleString();

      const areaCell = row.insertCell();
      areaCell.style.padding = "10px";
      areaCell.style.textAlign = "right";
      areaCell.textContent = c.area.toLocaleString();

      const densityCell = row.insertCell();
      densityCell.style.padding = "10px";
      densityCell.style.textAlign = "right";
      densityCell.textContent = parseFloat(c.density).toFixed(1);
    });
  }

  // Initial render
  const container = html`
    <div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap; margin-bottom:8px">${searchInput}${regionSelect}</div>
      <div style="max-height: 500px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead style="position: sticky; top: 0; z-index: 1;">
            <tr>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Country</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Region</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Population</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Area (km²)</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Density</th>
            </tr>
          </thead>
          <tbody id="countries-tbody">
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Add event listeners
  searchInput.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    const region = regionSelect.value;
    const result = allCountries.filter(c =>
      c.name.toLowerCase().includes(search) &&
      (region === '' || c.region === region)
    );
    renderTable(result);
  });

  regionSelect.addEventListener('change', (e) => {
    const search = searchInput.value.toLowerCase();
    const region = e.target.value;
    const result = allCountries.filter(c =>
      c.name.toLowerCase().includes(search) &&
      (region === '' || c.region === region)
    );
    renderTable(result);
  });

  // Initial render
  renderTable(allCountries);

  display(container);
}
```

## How Data Was Processed

The `countries.json.js` loader performed these operations at build time:

1. **Fetch**: Retrieved data from REST Countries API
2. **Transform**: Extracted relevant fields (name, population, area, etc.)
3. **Filter**: Removed countries without population data
4. **Sort**: Ordered by population (descending)
5. **Aggregate**: Grouped by region and calculated regional statistics
6. **Output**: Saved as a single JSON file

All of this processing happens **once during build**, so the browser receives ready-to-use data.

## Key Pattern

```javascript
// Load data with await
const data = await FileAttachment("data/countries.json").json();

// Access properties directly
const items = data.allCountries;

// Use in visualizations
```
