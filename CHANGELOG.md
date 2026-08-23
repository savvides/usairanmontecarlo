# Changelog

All notable changes to this project will be documented in this file.

## [1.0.5.0] - 2026-08-23

### Added
- 14 new timeline events covering June 3 – August 20: House and Senate war-powers votes, Islamabad MoU signed, US blockade lifted then reimposed, Iran re-closes Hormuz over Lebanon, June 27 Hormuz stress test, Trump declares the MoU "over," 13-night July campaign, Jordan attack, dual-lane framework that never starts, 60-day window lapse, UAE financial cutoff, Economic D-Day
- 4 bibliography entries: Islamabad Memorandum, Kpler Hormuz MoU post-mortem, Reuters August oil analysis, Wikipedia casualties page
- Snapshot-drift regression tests that lock `lastUpdated` / `observedThrough` to 2026-08-23, require the June 17 / July 8 / August 17 events, and fail if mixed-phase editorial still leads with April 24 or May 22

### Changed
- Editorial rewrite for Phases 3–8 reflecting the signed-then-dead memorandum, the missed H2 Hormuz reopen, Brent's path from $71 to $100 back to $92, Lebanon's 4,324 dead, and Pape Stage 3 not arriving
- Recalibrated Bayesian defaults from observed data: conflict duration (mass to `prolonged_over_6_months` / `4_8_months`+`over_8_months`), ceasefire window and mechanism (`no_ceasefire` 0.34→0.60), Hormuz reopen (`prolonged_closure` 0.55→0.62, timeline `indefinite` 0.23→0.55), oil price default $120→$92 (min 80→65), coercive success (`counterproductive` 0.35→0.42), ground escalation PTrue 0.45→0.28, resolution type (`negotiated_settlement` 0.22→0.12, `wider_regional_war` 0.33→0.38), Iranian civilian toll modal bin `500_2000`→`2000_5000`
- Mixed-phase scenario cards rebased onto August 23 observed conditions without changing IDs (URL state preserved): "Air Campaign Stays Paused," "Strike Campaign Resumes," "Omani Dual-Lane Deal Holds," "Second MoU: Final Deal," "Mediated Settlement by Year-End"
- Methodology Pape-validation note and snapshot-limitation date moved from May 22 to August 23
- README phase status table updated to August 23 reality
- `timeline.json` `lastUpdated` and `observedThrough` bumped to 2026-08-23
- Retuned firing CPT rows so un-overridden histograms match August oil (~$92 band) and ground-escalation (~0.28) defaults instead of leftover March cells

### Fixed
- Results panel kept painting the previous scenario's histograms while a newer 5000-run job was in flight. It now dims those charts and shows an Updating overlay until the latest run lands.
- A dead simulation worker silently fell back to a full 5000-run job on the UI thread. The hook now reconstructs the worker once on error and caps any main-thread fallback at 250 runs.

### For contributors
- Test count: 128 → 171 (snapshot-drift suite, August default-run histogram test, result-view-state helper, main-thread run cap)

## [1.0.4.0] - 2026-04-26

### Changed
- Simulation now runs in a Web Worker. Scenario clicks no longer block the UI thread — even on lower-end mobile devices, clicking through scenarios stays smooth instead of freezing for hundreds of ms while 5000 iterations of a 107-node Bayesian graph run.
- Rapid scenario clicking is now safe. Multiple in-flight simulations are tracked by request ID, and stale results from earlier clicks are dropped silently so the histograms always reflect the latest selection.

### Fixed
- Box-Muller normal sampler could emit -Infinity/NaN when the PRNG returned exactly 0, propagating through the Bayesian network and producing useless distributions. The sampler now draws from (0, 1] so log(0) is unreachable.
- Continuous nodes with `min === max` silently fell through to "high" via NaN comparisons in the discretizer. `validateGraph` now flags zero-range nodes as a configuration error.
- CPT rows could reference parent IDs not declared in `node.parents` (typos or stale data) and the engine would silently ignore the ghost dependency, dropping the intended causality. `validateGraph` now flags stray parent keys. Partial-key rows (intentional for interpolation) still validate.

### For contributors
- Added a worker message-protocol smoke test that uses an in-process loopback Worker to verify request-id round-trip, diagnostics serialization, concurrent request routing, and terminate() semantics without needing a real browser Worker.
- Deleted unused `useWorker.ts` hook (zero callers, broken API).
- Excluded `out/` and `.next/` from `tsconfig.json` so stale build artifacts no longer poison `tsc --noEmit`.
- Test count: 121 → 128.

## [1.0.3.0] - 2026-04-24

### Added
- 8 new timeline events covering April 13-24: US naval blockade takes effect (April 13), brief Hormuz reopening (April 17), Iran re-closes Hormuz (April 18), Iran formalizes toll regime (April 19), Trump extends ceasefire / Islamabad-2 dies (April 21), Iran seizes ships in Hormuz (April 22), Trump "shoot and kill" order (April 23), Hormuz reopen consensus shifts to H2 2026 (April 24)

### Fixed
- Landing page no longer shows a stale "As of March 29, 2026" date — now auto-derives from `timeline.lastUpdated` and stays in sync with each cycle
- Landing page phase status copy was stuck on "Phases 3-8 are probabilistic projections" since v1.0.2.0 — now auto-derives from `timeline.phaseStatus` so it accurately reflects which phases are observed, mixed, and projected
- Phase progress badge for mixed phases said "NOW" on all 5 mixed phases, implying each was the current phase — now reads "MIX" so users can tell the active phase apart from the mixed-status group
- Simulation page header rendered the data date as raw ISO ("2026-04-24") while the landing page showed "April 24, 2026" — now consistently formatted across both surfaces

### Changed
- Editorial rewrite for Phases 3-8 reflecting the dual blockade stand-off, ship seizures, "shoot and kill" order, unilateral ceasefire extension, Lavrov-Xi axis hardening, Hormuz reopen pushed to H2 2026, and Pape's "counterproductive" outcome publicly stated by a Permanent Five member
- Recalibrated 4 Bayesian nodes from observed data: ceasefire_mechanism (turkey_mediated_deal 0.35→0.32, unilateral_ceasefire 0.15→0.20), hormuz_reopening (prolonged_closure 0.45→0.55), coercive_success_probability (counterproductive 0.30→0.35, failed 0.55→0.53), resolution_type (wider_regional_war 0.27→0.33, negotiated_settlement 0.28→0.22)
- Methodology page snapshot date updated from April 12 to April 24
- Pape validation note strengthened: now references blockade, ship seizures, Islamabad-2 cancellation, Lavrov's nuclear-acquisition warning
- README phase status table updated to reflect April 24 reality
- Aligned VERSION file (was 1.0.1.0, drifted from package.json)
- timeline.json `lastUpdated` and `observedThrough` bumped to 2026-04-24

### For contributors
- Consolidated timeline helpers into a single module: `formatLongDate`, `formatDate`, `describePhaseStatus`, and `daysSinceUpdate` all live in `src/lib/timeline.ts`. Typed `timeline` accessor exported so callers no longer cast `as Record<string, PhaseStatus>` at every use site.
- Added 9 regression tests covering the date and phase-status helpers (catches future drift)
- Test count: 112 → 121

## [1.0.2.0] - 2026-04-12

### Added
- 6 new timeline events covering April 6-12: deadline passes, Pakistan-mediated ceasefire, Operation Eternal Darkness in Lebanon, Hormuz remains closed, Islamabad talks, talks collapse
- Pape coercion theory validation note on methodology page, with observed outcomes confirming predictions
- 2 new TODOS: scenario cards for mixed phases (P2), update cadence documentation (P3)

### Changed
- Editorial rewrite for Phases 3-8 reflecting events through April 12: ceasefire, Pakistan mediation replacing Turkey, Islamabad talks collapse, Lebanon escalation, naval blockade threat, Pape theory validated
- Phases 4-7 shifted from projected to mixed status, reflecting observed data from the ceasefire period
- Recalibrated 5 Bayesian nodes from observed data: april_6_deadline_outcome (Phase 5), ceasefire_mechanism, hormuz_reopening, coercive_success_probability, resolution_type (Phase 7)
- Updated ceasefire_mechanism description to note that "turkey_mediated_deal" category now represents any third-party mediated deal (Turkey, Pakistan, or similar)
- Methodology page snapshot date updated from March 29 to April 12
- Phase status description on methodology page updated to reflect mixed phases
- Fixed stale node count in README (100 → 107 in methodology section)

## [1.0.1.0] - 2026-03-30

### Added
- New Bayesian node: energy infrastructure targeting (Phase 3), tracking the Shah/South Pars/Ras Laffan escalation sequence and its effect on oil prices
- New Bayesian node: drone defense cost asymmetry (Phase 3), modeling the financially unsustainable cost exchange between cheap Iranian drones and expensive interceptors
- New Bayesian node: ground operation feasibility (Phase 7), capturing geographic constraints (Zagros mountains, no staging countries, amphibious-only approach)
- All 3 new nodes are wired into the existing graph with sparse CPTs, influencing oil price, conflict duration, and resolution type outcomes
- June 2025 prelude war context added to Phase 1 editorial
- Early 2026 protest crackdown (3,000-30,000 killed) added to Phase 1 editorial
- Named killed leaders (Pakpour, Nasirzadeh, Shirazi, Larijani) added throughout
- Minab school strike (170+ schoolgirls) added to Phase 1 editorial
- Operation True Promise IV and Gulf capital targets (Manama, Riyadh, Abu Dhabi, Kuwait Airport) added to Phase 2
- Missile attrition data (3-digit to 20-30/day), F-35 hit, radar damage, launcher counts (350-400 destroyed) added to Phase 3
- Trump Russia oil embargo suspension and NATO "not our war" refusal added to Phase 4
- Incirlik and Nakhchivan strikes added to Phase 5
- Ground ops geographic constraints and ethnic insurgency assessment added to Phase 7
- Regime survival and "decades to recover" framing added to Phase 8

### Changed
- Enriched iranian_nationalist_resolve node (Phase 6) with wartime protest absence data confirming Pape's rally-around-the-flag prediction
- Enriched regional_expansion_risk_current node (Phase 5) with Incirlik/NATO territory and Nakhchivan/Azerbaijan strike details
- Expanded data integrity test from Phase 1 only to all 8 phases, with cross-phase parent reference validation

## [1.0.0] - 2026-03-29

### Added
- Initial release: 104-node Bayesian network Monte Carlo simulation of the 2026 US-Iran conflict
