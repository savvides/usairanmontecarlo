# Methodology Red Team Remediation — Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Triggered by:** Red team analysis revealing 3 critical methodology flaws

---

## Problem Statement

A red team analysis of the simulation methodology found:

1. **CPT Sparsity:** Nodes with 3+ parents need 64-128 CPT rows but have 3-4. The `findCptRow()` exact-match lookup returns `undefined` ~90% of the time, causing silent fallback to `defaultProbabilities`. Parent-child causality is structurally defined but operationally broken.

2. **Insufficient Sample Size:** 1,000 runs with 5% base-rate events gives ~50 samples with ±26% confidence intervals. Rare but critical outcomes (nuclear escalation, wider regional war) are statistically meaningless.

3. **No Transparency:** Users have no way to distinguish robust results from noisy estimates. No methodology explanation, no confidence indicators, no known-limitations disclosure.

## Remediation: 4 Changes

### 1. CPT Interpolation Engine

Replace exact-match CPT lookup with weighted nearest-neighbor interpolation in `src/engine/sampler.ts`.

**Algorithm:**
1. For each CPT row, compute a match score: number of parent values matching current state
2. Exact match (all parents match) → use directly (backwards-compatible, no behavior change)
3. No exact match → find all rows matching at least 1 parent value
4. Weight each row by `matchedParents / totalParents`
5. Normalize weights to sum to 1.0
6. Blend distributions:
   - Binary: weighted average of `pTrue` values
   - Categorical: weighted average of probability vectors (element-wise)
   - Continuous: weighted average of distribution parameters (mean, stddev for normal; min, max for uniform; min, mode, max for triangular)
7. Zero matches → fall back to defaults (track as diagnostic)

**Match quality tracking:**
- Per-node per-run, record match quality: `exact`, `interpolated`, or `default`
- Aggregate into `SimulationDiagnostics` on `SimulationResult`
- Format: `Map<string, { exact: number, interpolated: number, default: number }>`

**Key property:** Backwards-compatible. Nodes with full CPT coverage behave identically. Only sparse nodes get improved causality propagation.

**Files:**
- Modify: `src/engine/sampler.ts` — replace `findCptRow()`, add `interpolateCpt()`, add diagnostics tracking
- Modify: `src/engine/types.ts` — add `SimulationDiagnostics` type, add `diagnostics` field to `SimulationResult`

### 2. Confidence Scoring System

Each node gets a confidence score (0-1) from three weighted factors.

**CPT Coverage Score (40% weight):**
- Per-node: (exact_matches * 1.0 + interpolated_matches * 0.6 + default_fallbacks * 0.2) / total_runs
- Derived from diagnostics data

**Sample Adequacy Score (30% weight):**
- Binary: `min(1, n * p * (1-p) / 25)` where p = observed proportion, n = run count
- Categorical: `min(1, min_category_count / 30)` where min_category_count = smallest observed category
- Continuous: 1.0 (normal distributions converge fast at 5K runs)

**Source Confidence Score (30% weight):**
- From existing node data: `high` = 1.0, `medium` = 0.6, `low` = 0.3

**Composite score → tier:**
- High (0.7-1.0): Solid data, good CPT coverage, sufficient samples
- Medium (0.4-0.69): Directional estimate — trust the trend, not the exact number
- Low (0-0.39): Speculative — heavily interpolated or default-driven

**Files:**
- Create: `src/lib/confidence.ts` — scoring functions
- Modify: `src/hooks/useSimulation.ts` — compute and expose confidence per node
- Modify: `src/components/simulation/ResultsPanel.tsx` — replace source-only badge with composite confidence badge

### 3. Methodology Page

**Route:** `/methodology`

**Sections:**
1. **What This Is** — Monte Carlo simulation explained in plain English
2. **How the Model Works** — Bayesian Network, nodes, CPTs, with one concrete example
3. **What the Confidence Badges Mean** — High/Medium/Low explained with the three scoring factors
4. **Known Limitations** — honest bullet list:
   - Sparse CPTs mean some parent-child relationships are weaker than structure implies
   - Historical base rates from analogous conflicts are imperfect proxies
   - Cannot capture truly novel scenarios
   - Feedback loops approximated as unrolled time steps
   - Subjective probabilities carry expert disagreement
5. **Sources** — master bibliography organized by domain

**Navigation:** Linked from landing page footer and a "?" icon in simulation header.

**Files:**
- Create: `src/app/methodology/page.tsx`
- Modify: `src/app/page.tsx` — add methodology link to footer
- Modify: `src/components/simulation/PhaseProgress.tsx` — add "?" methodology link in header bar

### 4. Sample Size Bump

- Change default run count from 1,000 to 5,000
- Adaptive Web Worker refinement stays at 10K — no change
- Performance target: <1 second for 5K runs with 104 nodes

**Files:**
- Modify: `src/components/simulation/SimulationShell.tsx` — change `simulation.run(1000)` to `simulation.run(5000)`

## What We Are NOT Changing

- No CPT data rewrite (interpolation handles sparsity)
- No new node types or graph structure changes
- No changes to scenario card mechanism
- No changes to D3 visualization components (except confidence badge swap)
- No changes to landing page design or phase navigation flow
- No changes to the cascade strip

## Files Summary

| File | Action | Change |
|------|--------|--------|
| `src/engine/sampler.ts` | Modify | Interpolation engine, diagnostics tracking |
| `src/engine/types.ts` | Modify | `SimulationDiagnostics` type, diagnostics on result |
| `src/engine/index.ts` | Modify | Export new types |
| `src/lib/confidence.ts` | Create | Confidence scoring functions |
| `src/hooks/useSimulation.ts` | Modify | Compute and expose confidence data |
| `src/components/simulation/ResultsPanel.tsx` | Modify | Composite confidence badges |
| `src/components/simulation/SimulationShell.tsx` | Modify | Run count 1K → 5K |
| `src/components/simulation/PhaseProgress.tsx` | Modify | Add methodology "?" link |
| `src/app/methodology/page.tsx` | Create | Methodology page |
| `src/app/page.tsx` | Modify | Add methodology link to footer |

## Verification

1. **Engine tests:** All 49 existing tests must continue to pass (interpolation is backwards-compatible)
2. **New engine tests:** Test interpolation with sparse CPTs — verify blended output differs from defaults
3. **New engine tests:** Test diagnostics tracking — verify exact/interpolated/default counts
4. **Confidence tests:** Test scoring functions with known inputs
5. **Build:** `next build` succeeds with new methodology route
6. **Manual:** Open simulation, select a scenario, verify confidence badges appear and respond to scenario changes
