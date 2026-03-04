# Observable Data Processing Demo

A hands-on demo showing how **Observable Framework** processes data at build time and renders interactive visualizations.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Open http://localhost:3000 to view the demo.

---

## What You'll Learn

This demo shows how Observable Framework handles data processing:

### 1. **Data Loaders** (`src/data/*.js`)
Scripts that run at **build time** to:
- Fetch data from APIs
- Transform and aggregate data
- Output static files (CSV, JSON)

### 2. **FileAttachment** (in `.md` files)
Load pre-processed data in your visualizations:
```js
const data = FileAttachment("data/earthquakes.csv").csv({typed: true});
```

### 3. **Reactivity**
Changes to data automatically update all visualizations that use it.

---

## File Structure

```
src/
├── index.md              # Home page with overview
├── earthquakes.md        # Earthquake map visualization
├── weather.md            # Weather forecast charts
├── countries.md          # Countries data dashboard
└── data/
    ├── earthquakes.csv.js    # Fetches USGS earthquake data → outputs CSV
    ├── weather.json.js       # Fetches weather.gov API → outputs JSON
    └── countries.json.js     # Fetches REST Countries API → aggregates → JSON
```

---

## Key Concepts

### Build-Time vs Runtime

| Phase | What Happens |
|-------|--------------|
| **Build Time** | Data loaders run, fetch data, output static files |
| **Runtime** | Browser loads static files instantly, visualizations render |

### Data Loader Example

```javascript
// src/data/example.csv.js
import {csvFormat} from "d3-dsv";

const response = await fetch("https://api.example.com/data");
const data = await response.json();

// Transform data
const rows = data.map(d => ({
  name: d.name,
  value: d.value
}));

// Output to stdout (becomes the static file)
process.stdout.write(csvFormat(rows));

// Logs go to stderr (don't contaminate output)
console.warn(`Processed ${rows.length} rows`);
```

### Loading Data in Visualizations

```javascript
// In your .md file
const data = FileAttachment("data/example.csv").csv({typed: true});

// Use in visualization
const chart = data.then(d => {
  // d is now an array of objects
  return d3.create("svg")...
});
```

---

## Data Sources

| File | Source API | Output |
|------|-----------|--------|
| `earthquakes.csv.js` | USGS Earthquake API | CSV |
| `weather.json.js` | National Weather Service API | JSON |
| `countries.json.js` | REST Countries API | JSON (aggregated) |

---

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local development server with hot reload |
| `pnpm build` | Build static site to `.observablehq/` |
| `pnpm deploy` | Deploy to Observable HQ (requires account) |

---

## Learn More

- [Observable Framework Docs](https://observablehq.com/framework)
- [Data Loaders](https://observablehq.com/framework/data-loaders)
- [FileAttachment API](https://observablehq.com/framework/file-attachments)
- [Data Analysis Best Practices](.claude/docs/data-analysis-best-practices.md)

---

## License

MIT
