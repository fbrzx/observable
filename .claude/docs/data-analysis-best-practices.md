# Data Analysis Best Practices

This guide captures practical patterns for working with high-volume marketing, CRM, and media datasets in dashboard-style projects.

## 1) Start with Data Contracts

- Define canonical field names early (`timestamp`, `campaign_id`, `channel`, `spend`, `impressions`, `clicks`, `leads`, `revenue`).
- Keep one source of truth for metric definitions (e.g., CTR, CPL, CAC, ROAS).
- Document grain explicitly: event-level, session-level, user-level, or daily aggregate.
- Validate required columns and types at ingest.

## 2) Model by Grain, Not by Tool

- Keep raw events immutable.
- Build intermediate tables at stable grains:
  - `fact_events` (atomic)
  - `fact_daily_channel` (daily channel metrics)
  - `fact_daily_campaign`
  - `dim_customer`, `dim_campaign`, `dim_channel`
- Never mix incompatible grains in one metric without explicit rollup logic.

## 3) Time Handling Rules (Critical)

- Convert all timestamps to UTC on ingest.
- Keep local time only as derived display fields.
- Define reporting windows consistently (calendar day vs rolling 24h).
- For weekly/monthly reporting, lock the timezone and week-start convention.

## 4) Metric Design for Marketing / CRM / Media

- **Funnel metrics**: impressions → clicks → visits → leads → opportunities → closed-won.
- **Efficiency metrics**: CPC, CPL, CPA, CAC, ROAS.
- **Quality metrics**: lead-to-opportunity rate, opportunity-to-win rate, churn risk.
- **Lag-aware metrics**: revenue often lags spend; always annotate attribution window.

## 5) Attribution and Identity

- Define attribution model up front (first-touch, last-touch, linear, time-decay).
- Keep attribution logic versioned; changing it rewrites history.
- Use deterministic identity joins first (email hash, user ID), then probabilistic only if required.
- Track unknown/unmatched records explicitly; do not silently drop them.

## 6) Working with Numerous Data Points

When plotting large series, prioritize correctness and readability:

- Aggregate to fit the decision horizon (hourly/daily/weekly) before charting.
- Use binning for distributions (histograms, quantiles).
- Use rolling windows for noisy signals (7-day/28-day moving averages).
- Downsample only for visualization; keep full-fidelity metrics for calculations.
- Add filters that reduce cardinality (`channel`, `campaign`, `region`, `segment`).
- Render summary + detail together:
  - Top-line KPIs
  - Trend chart
  - Drill-down table

## 7) Data Quality Guardrails

- Reject or flag impossible values (`spend < 0`, `clicks > impressions`, null IDs where required).
- Add freshness checks (last ingest timestamp, missing periods).
- Monitor distribution drift (sudden CTR spikes, conversion collapses).
- Keep “known exclusions” documented (bots, test campaigns, internal traffic).

## 8) Performance Patterns

- Pre-aggregate expensive joins at build time when possible.
- Prefer narrow payloads for browser views (only required columns).
- For tables, paginate or cap rows and filter server/build-side when possible.
- Cache static reference data (channel maps, geo metadata).

## 9) Visualization Patterns that Scale

- Use consistent color semantics across pages (same channel = same color).
- Always label units and currency (`$`, `%`, `per day`).
- Show sample size (`n=`) and active filters near each chart.
- Provide tooltip context with key dimensions + metric definitions.
- Avoid dual-axis charts unless necessary and clearly explained.

## 10) Reproducibility and Governance

- Keep transformation steps deterministic and idempotent.
- Version derived datasets and metric definitions.
- Keep changelogs for data-source or transformation updates.
- Validate outputs in CI/build with smoke checks.

## 11) Practical QA Checklist Before Publishing

- Metrics reconcile with source-of-truth reports (within expected tolerance).
- Date ranges and timezone labels are visible.
- Filters update all dependent visuals consistently.
- Empty states are handled gracefully (no data for selected segment).
- Large data periods still render fast enough for interactive use.

## 12) Recommended Project Pattern in This Repo Style

- Build-time loader scripts fetch and normalize raw data.
- Output compact static files for runtime dashboards.
- Runtime pages focus on:
  - filtering
  - interaction
  - clear metric communication

This pattern keeps runtime fast and makes analysis behavior predictable.
