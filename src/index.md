# Observable Data Processing Demo

This demo shows how **Observable Framework** processes data at build time and renders interactive visualizations.

---

## How Observable Processes Data

Observable Framework uses **data loaders** - scripts that run during build time to:

1. **Fetch** data from APIs, databases, or files
2. **Transform** and aggregate the data
3. **Output** static snapshots (CSV, JSON, etc.)
4. **Serve** the pre-processed data to the browser instantly

The key insight: **data processing happens on the server during build, not in the browser**. This means:
- Faster page loads for users
- No API keys exposed to the client
- Data can be pre-filtered and aggregated
- Complex computations done once, not per-user

---

## Live Examples

Click on each section below to see the data loaders in action with interactive visualizations.

### 1. Earthquake Map
See real-time earthquake data fetched from USGS, transformed from GeoJSON to CSV, and displayed on an interactive map.

[View Earthquake Visualization →](/earthquakes)

### 2. Weather Forecast Chart
Weather forecast data fetched from the National Weather Service, processed into a clean JSON structure, and displayed as a temperature chart.

[View Weather Forecast →](/weather)

### 3. Countries Data Dashboard
Country data aggregated, sorted, and grouped by region with interactive tables and charts.

[View Countries Dashboard →](/countries)

---

## File Structure

```
src/
├── index.md              # This page
├── earthquakes.md        # Earthquake visualization
├── weather.md            # Weather forecast chart
├── countries.md          # Countries dashboard
└── data/
    ├── earthquakes.csv.js    # Data loader: outputs CSV
    ├── weather.json.js       # Data loader: outputs JSON
    └── countries.json.js     # Data loader: outputs JSON
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Data Loaders** | Scripts ending in `.ext.js` that output static files |
| **FileAttachment** | Load processed data in your visualizations |
| **Build-time execution** | Loaders run once during build, not per-request |
| **stdout output** | Data loaders write to stdout, logs to stderr |

---

*Built with Observable Framework*
