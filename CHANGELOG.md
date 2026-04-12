# Changelog

All notable changes to this project will be documented in this file.

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
