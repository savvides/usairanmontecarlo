# USA vs Iran War Simulation

**Monte Carlo analysis of the 2026 US-Iran conflict**

[**Launch Simulation →**](https://savvides.github.io/usairanmontecarlo)

An interactive web simulation that models the cascading consequences of the US-Israel strikes on Iran that began February 28, 2026. Walk through 8 phases — from the initial strike through long-term aftermath — and explore how decisions in one domain ripple across military, economic, geopolitical, and humanitarian outcomes.

## How It Works

The simulation runs **5,000 Monte Carlo scenarios** through a **Bayesian network of 100 interconnected variables** across 8 phases:

| Phase | Status | Description |
|-------|--------|-------------|
| 1. The Strike (Feb 28) | Observed | US/Israel surprise campaign: 900 strikes, Khamenei killed, nuclear program destroyed |
| 2. Retaliation (Feb 28 – Mar 10) | Observed | Iran's 500+ missile/2000 drone response, Hormuz closure, Hezbollah activation |
| 3. Active Conflict (Current) | Mixed | Ongoing air campaign, Houthi entry, naval situation |
| 4. Economic Shockwaves | Mixed | Oil at $113-126/bbl, 10M+ bpd lost, GCC food crisis |
| 5. Geopolitical Reactions | Mixed | UNSC Resolution 2817, ceasefire deadlock, Turkey mediation |
| 6. Humanitarian Impact | Mixed | 1,937+ killed, 24,800+ injured, infrastructure devastation |
| 7. Resolution Paths | Projected | Ceasefire scenarios, April 6 deadline, post-Khamenei power vacuum |
| 8. Long-Term Aftermath | Projected | Nuclear future, regime outcome, regional order, reconstruction |

**Observed** phases are locked to real-world data. **Projected** phases use scenario cards to explore different futures.

## Features

- **Living Timeline** — visual timeline showing observed events vs. projections with a NOW marker
- **Scenario Cards** — interactive cards on projected phases that shift probability distributions
- **Confidence Badges** — each result shows High/Medium/Low confidence based on data quality
- **Bayesian Network Engine** — CPT interpolation handles sparse data without silent fallbacks
- **Research-Backed** — sourced from CSIS, RAND, IISS, CFR, Crisis Group, IAEA, and more

## Tech Stack

- **Engine:** Pure TypeScript Bayesian Network with Monte Carlo sampling
- **Frontend:** Next.js 14, React, D3.js, Framer Motion, Tailwind CSS
- **Deploy:** Static export on GitHub Pages (zero backend)
- **Tests:** Vitest (62 tests)

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Run test suite
npm run build        # Production build
npm run update       # Interactive update helper (add new events as conflict evolves)
```

## Updating the Simulation

As the conflict evolves, run `npm run update` to:
1. Add new timeline events with dates, descriptions, and sources
2. Update the "observed through" date
3. Shift the phase boundary (observed → mixed → projected)
4. Validate, test, build, and push — auto-deploys via GitHub Pages

## Methodology

The simulation uses a directed acyclic graph (DAG) of 100 nodes with conditional probability tables. When CPTs are sparse, a weighted nearest-neighbor interpolation engine blends partial matches instead of falling back silently to defaults.

Each result card shows a confidence score computed from:
- **CPT Coverage (40%)** — how often the engine found matching data vs. defaults
- **Sample Adequacy (30%)** — statistical reliability at the observed probability
- **Source Quality (30%)** — quality of underlying research sources

Full methodology: [savvides.github.io/usairanmontecarlo/methodology](https://savvides.github.io/usairanmontecarlo/methodology)

## Sources

Primary: CSIS, RAND Corporation, IISS Military Balance, SIPRI | Military: CRS, DoD, Jane's | Economic: World Bank, IMF, EIA, IEA | Geopolitical: CFR, Chatham House, Crisis Group | Conflict data: ACLED, Al Jazeera, Reuters, PBS

## License

MIT
