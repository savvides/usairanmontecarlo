# USA vs Iran War Monte Carlo Simulation — Design Spec

**As of:** 2026-03-29
**Status:** Approved
**Stack:** Next.js 14+ / TypeScript / D3.js / Framer Motion / Tailwind / shadcn/ui
**Hosting:** Vercel (static export)
**Simulation:** Client-side Bayesian Network with Monte Carlo sampling

---

## 1. Purpose & Audience

An educational web application for a general audience — people aware of the US-Iran conflict but unfamiliar with the interconnected systems (military, economic, geopolitical, cyber, humanitarian) that drive outcomes. The goal is to teach systems thinking without calling it systems thinking, by letting users see how decisions in one domain cascade into every other domain.

## 2. Core Experience

**Guided exploration through 8 phases** of the conflict. Users progress linearly on first visit, unlocking free exploration after completing all phases. At each phase, users make strategic choices via scenario cards and watch Monte Carlo-generated probability distributions shift in real time — across the current phase and all downstream phases.

**Tone:** Authoritative but accessible. Think *The Economist* or *Foreign Affairs* — confident assertions backed by sourced data, no jargon without immediate plain-English context.

**Visual identity:** Dark, serious, data-dense. STRATFOR meets Bloomberg Terminal. Dark background, muted accents (steel blue, amber warnings, red escalation), monospace for data, clean sans-serif for body text.

**Data model:** Snapshot-in-time with a clearly stated "as of" date. All parameters sourced from open-source intelligence and think tank reports. No live data feeds.

## 3. Simulation Engine Architecture

### Bayesian Network Graph

The conflict is modeled as a **directed acyclic graph (DAG)** of ~90-110 nodes across 8 phases. Each node represents a discrete variable with a conditional probability table (CPT) defining its distribution given parent node states.

**Node types:**
- `binary` — yes/no events (e.g., "Strait of Hormuz closed")
- `continuous` — numeric ranges (e.g., oil price in $/barrel)
- `categorical` — one of N outcomes (e.g., "limited strike / full campaign / no strike")

**Scenario card mechanism:**
- Each scenario card maps to a set of root node overrides
- Selecting a card clamps specific nodes to fixed values and adjusts related node probabilities
- Advanced sliders (behind a toggle) allow direct modification of individual node CPTs

**Monte Carlo sampling:**
- Topological sort determines evaluation order
- Each run: sample root nodes, propagate through graph, record output values
- Adaptive execution: 1,000 runs instant on main thread (<100ms), then 10,000 refinement via Web Worker using `postMessage` with transferable buffers
- Results stored as `Float32Array` for memory efficiency (~4MB for 10K runs x 100 nodes)

**Phase boundaries:**
- 8 phases are subgraphs within the larger DAG
- Cross-phase edges model cascading effects
- Each phase has summary nodes that aggregate into human-readable outcomes

**Feedback loop handling:**
- DAG constraint prohibits true cycles
- Conflict feedback cycles modeled as unrolled time steps within the graph

## 4. The 8 Phases

### Phase 1: Pre-Conflict Tensions (~10-15 nodes)
**Variables:** US force posture, Iranian nuclear program status, proxy activity level (Hezbollah, Houthis, Iraqi militias), diplomatic channel status, sanctions pressure level.
**Scenario cards:**
- Nuclear breakout detected
- Proxy attack kills US personnel
- Diplomatic collapse at IAEA
- Assassination/sabotage event

### Phase 2: Escalation & First Strikes (~12-18 nodes)
**Variables:** Who strikes first, strike target type (nuclear sites, military bases, oil infrastructure, leadership), strike method (air, cruise missiles, ballistic missiles, cyber), initial battle damage assessment.
**Scenario cards:**
- US precision strike on nuclear facilities
- Iranian ballistic missile salvo on Gulf bases
- Israeli unilateral strike
- Cyber-first escalation

### Phase 3: Active Conflict (~15-20 nodes)
**Variables:** Air superiority timeline, Iranian air defense survivability, naval engagement in the Gulf, ballistic/cruise missile exchanges, cyber operations against critical infrastructure, special operations, information warfare.
**Scenario cards:**
- Sustained air campaign
- Limited tit-for-tat exchanges
- Full naval blockade
- Cyber-dominant conflict

### Phase 4: Economic Shockwaves (~12-15 nodes)
**Variables:** Oil price spike magnitude, Strait of Hormuz closure duration, global supply chain disruption, sanctions escalation, financial market impact, US/Iranian war costs (daily burn rate), energy market substitution speed.
**Scenario cards:**
- Full Strait closure
- Partial disruption + tanker attacks
- Global recession trigger
- Oil market absorbs shock

### Phase 5: Geopolitical Reactions (~12-15 nodes)
**Variables:** NATO/allied coalition formation, Russia's response (arms supply, UN veto, opportunism), China's response (economic leverage, mediation, Taiwan timing), Israel's involvement level, Saudi/GCC positioning, Turkey's role, UN Security Council action.
**Scenario cards:**
- Broad US-led coalition
- US acts largely alone
- Russia/China actively counter
- Regional actors mediate

### Phase 6: Humanitarian Impact (~10-12 nodes)
**Variables:** Military casualties (both sides), civilian casualties, refugee displacement, infrastructure destruction (power, water, hospitals), environmental damage (oil fires, contamination), aid access.
**Scenario cards:**
- Precision conflict with limited civilian impact
- Urban warfare escalation
- Infrastructure collapse
- Refugee crisis destabilizes neighbors

### Phase 7: Resolution Paths (~10-12 nodes)
**Variables:** Conflict duration, ceasefire mechanism, negotiation framework, regime stability (both sides), domestic political pressure, war fatigue indicators, face-saving off-ramps.
**Scenario cards:**
- Quick ceasefire (weeks)
- Negotiated settlement (months)
- Prolonged stalemate
- Escalation to wider regional war

### Phase 8: Long-Term Aftermath (~10-12 nodes)
**Variables:** Iranian nuclear program status post-conflict, regional power balance shift, US force posture change, reconstruction timeline/cost, oil market restructuring, alliance realignment, domestic political consequences (both sides), precedent effects on global order.
**Scenario cards:**
- Regime change + nation building
- Weakened but intact Iran
- Strategic stalemate with frozen conflict
- Regional transformation

**Total: ~90-110 nodes, ~30-32 scenario cards.**

## 5. User Experience & Navigation

### Landing Page
- Dark, cinematic hero with simulation title, "as of" date, single CTA: "Begin Simulation"
- One-paragraph explainer: what this is, what Monte Carlo simulation means in plain English, what the user will experience
- No login, no signup

### Phase Navigation
- Linear progression on first visit — Phase 1 through 8, each unlocking after previous
- After completing once: phase selector sidebar unlocks for free exploration
- Progress bar at top showing current phase and 8-phase structure

### Within Each Phase (Three-Panel Layout)
- **Context panel (left):** 2-3 paragraphs of sourced editorial content. Historical precedents, key actors, what's at stake. Inline footnote citations.
- **Interaction panel (center):** 2-3 scenario cards as primary choice. Selected card glows. "Advanced" toggle reveals individual variable sliders.
- **Results panel (right):** D3 visualizations showing outcome distributions. Updates in real-time on scenario changes. Includes downstream preview strip showing later-phase effects.

### Transitions
- Framer Motion animates result distributions flowing into next phase's inputs — reinforcing causality
- Cascade summary highlights key cross-phase impacts (e.g., "Your Phase 2 choices shifted Phase 4 oil prices by +$38/barrel")

### Interaction Details
- Hover tooltips on any variable: plain-English description, current value, dependencies, source
- Reset to defaults button per phase and globally
- "Share this scenario" generates URL with encoded parameter state (base64-compressed JSON in query params)

## 6. Data Architecture & Sources

### Node Data Structure
```json
{
  "id": "strait_of_hormuz_closure",
  "phase": 4,
  "type": "binary",
  "label": "Strait of Hormuz Closure",
  "description": "Iran fully blocks maritime traffic through the Strait",
  "parents": ["iranian_naval_activation", "conflict_intensity"],
  "cpt": {},
  "source": {
    "citation": "CSIS, 'Iran's Threat to the Strait of Hormuz', 2024",
    "url": "https://...",
    "confidence": "high"
  }
}
```

### Source Hierarchy (preference order)
1. **Primary:** CSIS, RAND Corporation, IISS Military Balance, SIPRI
2. **Military:** GlobalFirepower, Jane's Defence, DoD annual reports, Congressional Research Service
3. **Economic:** World Bank, IMF, EIA, BP Statistical Review
4. **Geopolitical:** Council on Foreign Relations, Chatham House, Crisis Group
5. **OSINT:** Verified open-source intelligence for force dispositions

### Data Organization
- `/src/data/nodes/` — one JSON file per phase
- `/src/data/sources.json` — master bibliography
- `/src/data/scenarios/` — scenario card definitions mapping to node overrides
- Every parameter has a `confidence` rating (`high` / `medium` / `low`) shown in tooltips

### Calibration Approach
- Hard data (force counts, economic figures, weapon ranges): used directly
- Subjective probabilities (escalation decisions): derived from historical base rates of analogous conflicts (Gulf War, Iraq War, 2019-2020 US-Iran crisis, Russia-Ukraine) cross-referenced with think tank scenario analyses
- Every subjective probability documented with reasoning and analogues

## 7. Visualization Design

### Per-Phase Visualizations (Results Panel)
- **Outcome distributions:** Horizontal histograms/density plots for continuous variables. Color-coded by severity (steel blue moderate, amber concerning, red extreme).
- **Probability bars:** Horizontal bars for binary/categorical variables showing likelihood of each outcome. Smooth animation on change.
- **Sensitivity sparklines:** Inline charts showing how sensitive each variable is to current choices.

### Cascade Visualization (Signature Piece)
- **Sankey-style flow diagram** spanning all 8 phases as a compact strip beneath main panels
- Each phase is a column; flows show probability mass movement through the system
- Scenario changes cause downstream flows to visually shift — thicker bands for more likely paths, color-coded by severity
- This is the core systems-thinking teaching tool

### Phase-Specific Visualizations
- **Phase 2:** Animated Persian Gulf map showing strike paths and force positions
- **Phase 3:** Day-by-day conflict timeline from a sample run
- **Phase 4:** Oil price fan chart showing cone of uncertainty over time
- **Phase 5:** Alliance network diagram with edge thickness showing commitment strength
- **Phase 8:** Before/after regional power balance comparison

### Animation Principles
- All transitions 300-500ms, Framer Motion spring physics
- Distributions morph rather than redraw — users see shapes shift, not jump cuts
- Cascade flows animate left-to-right to reinforce causality
- No gratuitous animation — every motion communicates a data relationship

## 8. Project Structure

```
usairanmontecarlo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── simulation/
│   │   │   └── page.tsx        # Main simulation experience
│   │   └── layout.tsx          # Root layout, fonts, metadata
│   │
│   ├── engine/                 # Pure TypeScript, zero React dependencies
│   │   ├── types.ts            # Node, CPT, ScenarioCard, SimulationResult types
│   │   ├── graph.ts            # DAG construction, topological sort, validation
│   │   ├── sampler.ts          # Monte Carlo sampling logic
│   │   ├── worker.ts           # Web Worker for background refinement
│   │   └── index.ts            # Public API: runSimulation(), applyScenario()
│   │
│   ├── data/
│   │   ├── nodes/              # One JSON file per phase (8 files)
│   │   ├── scenarios/          # Scenario card definitions per phase
│   │   └── sources.json        # Master bibliography
│   │
│   ├── components/
│   │   ├── landing/            # Landing page components
│   │   ├── simulation/         # Phase layout, panels, navigation
│   │   ├── cards/              # Scenario card components
│   │   ├── visualizations/     # D3 visualization components
│   │   │   ├── DistributionChart.tsx
│   │   │   ├── CascadeSankey.tsx
│   │   │   ├── ProbabilityBar.tsx
│   │   │   ├── SensitivitySparkline.tsx
│   │   │   ├── GulfMap.tsx
│   │   │   ├── OilFanChart.tsx
│   │   │   ├── AllianceNetwork.tsx
│   │   │   └── PowerBalance.tsx
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── hooks/
│   │   ├── useSimulation.ts    # Engine state, runs, results
│   │   ├── useWorker.ts        # Web Worker lifecycle
│   │   └── usePhase.ts         # Phase navigation state
│   │
│   ├── lib/
│   │   ├── distributions.ts    # Probability distribution helpers
│   │   └── url-state.ts        # Encode/decode scenario state for sharing
│   │
│   └── styles/
│       └── globals.css         # Tailwind + custom D3 styles
│
├── public/
│   └── assets/                 # Static images, map data
│
├── docs/
│   └── superpowers/
│       └── specs/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Key principle:** `engine/` is pure TypeScript with zero React dependencies — testable independently, runnable in Web Workers, extractable to a standalone package.

## 9. Performance & Deployment

### Performance Targets
- Initial 1,000 runs: <100ms on mid-range device
- Background refinement to 10,000 runs: <500ms via Web Worker, non-blocking
- UI re-render on scenario change: <16ms (single frame)
- Total bundle size: <500KB gzipped

### Performance Strategies
- Phase data loaded via dynamic imports — no upfront cost for all 8 phases
- D3 renders to `<canvas>` for density (distributions, Sankey), `<svg>` for interactivity (tooltips, hover)
- `Float32Array` for result storage — transferable via Web Worker `postMessage`
- Memoize CPT evaluations for unchanged subgraphs — changing Phase 4 doesn't resample Phases 1-3

### Vercel Deployment
- Static export: `output: 'export'` in `next.config.ts`
- Zero serverless functions, zero API routes, zero backend dependencies
- Vercel edge CDN serves everything globally

### SEO & Sharing
- Static Open Graph meta tags and images for social sharing
- Scenario sharing via base64-compressed JSON in URL query params
- Pre-rendered landing page for fast first paint

### Accessibility
- `aria-label` descriptions on all visualizations
- Keyboard-navigable scenario cards
- WCAG AA contrast ratios against dark background
- Reduced motion mode disables animations, shows instant state changes

## 10. Testing Strategy

### Engine Tests (Vitest)
- Unit tests for every node type's sampling function
- DAG validation: no cycles, valid parent references, correct topological sort
- CPT validation: probabilities sum to 1.0 for each parent configuration
- Convergence tests: 50K iterations verify distributions match expected means/variances
- Scenario card tests: correct node overrides and propagation
- Deterministic seed tests: same seed produces identical results

### Data Integrity Tests
- Every node references valid parent IDs
- Every scenario card references valid node IDs
- Every source has non-empty citation, URL, and confidence rating
- No orphan nodes
- No forward edges (later phases cannot be parents of earlier phases)

### Component Tests
- D3 visualizations render without errors given valid simulation output
- Scenario card selection triggers simulation re-run
- Phase navigation preserves previous phase state
- URL state encoding/decoding round-trips correctly
- Web Worker initialization and message passing works

### Excluded
- No E2E browser tests (fully client-side, no backend)
- No visual regression tests (data-driven visualizations change with every parameter)
