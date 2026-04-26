# Changelog

All notable changes to this project will be documented in this file.

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
