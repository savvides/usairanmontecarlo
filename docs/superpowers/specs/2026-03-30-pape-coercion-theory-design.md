# Pape's Coercion Theory Integration — Design Spec

**Date:** 2026-03-30
**Status:** Approved
**Source:** Robert Pape, *Bombing to Win* (1996); *Escalation Trap* Substack (2025-26); *Foreign Affairs* (2025-26)

---

## Problem

The simulation models the 2026 US-Iran conflict as a forward-time Bayesian network but lacks the most empirically grounded theoretical framework for predicting coercion outcomes. Pape's research on 33 strategic air campaigns (1917-1991) shows that:

- Punishment strategies succeed 0% of the time (0/8 cases)
- Risk strategies succeed ~0%
- Decapitation has never worked independently against states
- Denial succeeds ~15% (5/33) but only with ground forces (hammer and anvil)
- Bombing consistently triggers nationalist backlash that strengthens defender resolve

The current model gives 18% probability to "decisive US victory" and has no nodes for nationalist resolve, ground escalation, or the coercion success/failure disconnect. These contradict Pape's empirical findings.

## Solution

4 new nodes + 4 CPT recalibrations + methodology page section. No engine changes — Pape's recursive escalation trap is unrolled as discrete states within the existing DAG.

---

## New Nodes

### 1. `iranian_nationalist_resolve` — Phase 6

Pape's core finding: bombing strengthens rather than degrades defender resolve. Authoritarian regimes suppress internal revolt; civilian casualties trigger rally-around-the-flag; the language of sacrifice becomes embedded in state ideology.

- **Type:** categorical
- **Categories:** `low`, `moderate`, `high`, `total_mobilization`
- **Parents:** `us_air_campaign_scale` (Phase 3), `infrastructure_destruction_scale` (Phase 6), `iranian_civilian_death_toll` (Phase 6)
- **CPT logic:** Higher bombing intensity + higher casualties → higher resolve. This is the INVERSE of punishment theory. Specifically:
  - Sustained air campaign + extensive destruction + 500-2000 deaths → `high` (0.55)
  - Sustained + catastrophic destruction + 2000-5000 deaths → `total_mobilization` (0.60)
  - Limited campaign + limited destruction → `moderate` (0.50)
- **Default:** `high` (0.45), `total_mobilization` (0.25), `moderate` (0.25), `low` (0.05)
- **Source:** Pape, *Bombing to Win* Ch. 2-3; Iran-Iraq War resilience data; Pape *Escalation Trap* March 2026
- **Confidence:** medium (historical base rates applied to a novel context)
- **Downstream consumers:** `ceasefire_mechanism` (Phase 7), `iran_post_khamenei_power_structure` (Phase 7), `coercive_success_probability` (Phase 7)

### 2. `escalation_trap_stage` — Phase 3

Pape's three-stage escalation model, unrolled as a categorical variable. Since the Feb 28 strikes killed Khamenei and targeted regime infrastructure across 26 provinces, the conflict entered Stage 2 immediately.

- **Type:** categorical
- **Categories:** `stage_1_precision_strikes`, `stage_2_regime_campaign`, `stage_3_ground_forces`
- **Parents:** `us_air_campaign_scale` (Phase 3), `strike_scale` (Phase 1), `leadership_decapitation` (Phase 1)
- **CPT logic:**
  - Massive strike + Khamenei killed + sustained campaign → `stage_2_regime_campaign` (0.90)
  - Massive strike + Khamenei killed + escalating campaign → `stage_3_ground_forces` (0.40)
- **Default:** `stage_1_precision_strikes` (0.03), `stage_2_regime_campaign` (0.85), `stage_3_ground_forces` (0.12)
- **Source:** Pape, *Escalation Trap* three-stage model; Pape's 75% ground escalation estimate
- **Confidence:** medium
- **Downstream consumers:** `conflict_duration_projection` (Phase 3), `ground_escalation_probability` (Phase 7)

### 3. `coercive_success_probability` — Phase 7

The explicit tactical/strategic disconnect. Pape's central finding: airpower achieves ~100% tactical success but near-zero coercive (political) success against states employing asymmetric strategies.

- **Type:** categorical
- **Categories:** `succeeded`, `partial`, `failed`, `counterproductive`
- **Parents:** `overall_military_balance` (Phase 3), `iranian_nationalist_resolve` (Phase 6), `escalation_trap_stage` (Phase 3)
- **CPT logic:**
  - Decisive US military advantage + high nationalist resolve + Stage 2 → `failed` (0.55), `counterproductive` (0.25), `partial` (0.17), `succeeded` (0.03)
  - Decisive US advantage + total mobilization + Stage 3 → `counterproductive` (0.45), `failed` (0.40), `partial` (0.13), `succeeded` (0.02)
  - The key insight: military dominance DOES NOT improve coercive success when resolve is high
- **Default:** `failed` (0.55), `counterproductive` (0.25), `partial` (0.15), `succeeded` (0.05)
- **Source:** Pape, *Bombing to Win* Propositions 1-6; 0/8 punishment success rate; 5/33 denial success rate
- **Confidence:** high (based on 33-case empirical dataset)
- **Downstream consumers:** `resolution_type`, `ceasefire_mechanism`, `war_termination_terms`, `ground_escalation_probability`

### 4. `ground_escalation_probability` — Phase 7

Pape estimates ~75% probability the US escalates to ground forces when air coercion fails. This is where "the trap really closes" — an open-ended commitment in a country of 88 million people.

- **Type:** binary
- **Parents:** `coercive_success_probability` (Phase 7), `actual_conflict_duration` (Phase 7), `us_domestic_political_impact` (Phase 7)
- **CPT logic:**
  - Coercion failed + conflict > 2 months + rallying effect domestically → pTrue 0.75
  - Coercion failed + conflict > 4 months + growing opposition → pTrue 0.55
  - Coercion succeeded → pTrue 0.05
  - Coercion counterproductive + any duration → pTrue 0.80
- **Default pTrue:** 0.45
- **Source:** Pape, *Escalation Trap* March 2026; Pape's 75% estimate; historical comparison to Iraq 2003 escalation logic
- **Confidence:** low (single analyst estimate, no historical base rate for this specific scenario)
- **Downstream consumers:** `resolution_type`, `reconstruction_cost_estimate`, `us_force_posture_postwar`, `long_term_stability_assessment`

---

## CPT Recalibrations

### `resolution_type` (Phase 7)

**Current:** `decisive_us_victory` at 18%
**Recalibrated:** `decisive_us_victory` at 5%

Pape's punishment (0/8) and decapitation (~0%) success rates mean decisive victory via air power is near-impossible. The 5% allows for outcomes outside Pape's historical base (novel technology, regime internal collapse unrelated to coercion).

Redistribution: +8% to `frozen_conflict` (from 30% to 38%), +5% to `negotiated_settlement` (from 28% to 33%).

Add `coercive_success_probability` and `ground_escalation_probability` as new parents with CPT rows reflecting: coercion failed → frozen conflict dominant; ground war initiated → wider regional war probability increases.

### `iran_post_khamenei_power_structure` (Phase 7)

Add `iranian_nationalist_resolve` as parent. When resolve is `high` or `total_mobilization`, shift probabilities toward `hardliner_successor` and `military_junta` (rally effect consolidates power). Decrease `regime_collapse` and `fragmented_power_vacuum` under high resolve — Pape's finding that bombing unifies rather than fragments.

### `ceasefire_mechanism` (Phase 7)

Add `coercive_success_probability` as parent. When coercion failed → shift toward `no_ceasefire` and `unilateral_ceasefire` (one side stops without agreement). Pape's Proposition 6: successful coercion "takes nearly as long and costs nearly as much as fighting to a finish."

### `war_termination_terms` (Phase 7)

Reduce `unconditional_iranian_surrender` from current level to ~2%. Pape's Proposition 5: "Surrender terms incorporating heavy punishment will not be accepted." When costs of surrender exceed costs of resistance, there is no incentive to concede. Societies expecting regime destruction fight to the end.

---

## Methodology Page Addition

New section between "How the Model Works" and "What the Confidence Badges Mean":

### "Theoretical Framework: Pape's Coercion Theory"

Content covering:

1. **The denial/punishment distinction** — why bombing civilians never works (0/8), and why denial only works with ground forces (5/33)
2. **The escalation trap** — three stages (precision strikes → regime campaign → ground forces) and the recursive failure logic
3. **Nationalist backlash** — bombing as positive feedback for defender resolve, not degradation
4. **Tactical ≠ strategic** — why 100% target destruction produces ~0% political compliance
5. **The 75% ground escalation estimate** — what happens when air coercion fails
6. **How this shapes the simulation** — which nodes encode Pape's parameters and how they affect outcomes
7. **Limitations** — Pape's bilateral framework doesn't fully capture the multilateral dynamics (US, Israel, Iran, proxies, Russia, China); his empirical base predates precision drones and cyber capabilities; the ~75% ground estimate is a single analyst projection

Links to: Pape's *Bombing to Win* (Cornell, 1996), *Escalation Trap* Substack, *Foreign Affairs* articles (2025-26), Talmadge's "Closing Time" (2008), Kroenig/Kahl debate.

---

## Files Modified

| File | Action | Change |
|------|--------|--------|
| `src/data/nodes/phase-3-conflict.json` | Modify | Add `escalation_trap_stage` node |
| `src/data/nodes/phase-6-humanitarian.json` | Modify | Add `iranian_nationalist_resolve` node |
| `src/data/nodes/phase-7-resolution.json` | Modify | Add `coercive_success_probability` + `ground_escalation_probability` nodes; recalibrate `resolution_type`, `iran_post_khamenei_power_structure`, `ceasefire_mechanism`, `war_termination_terms` |
| `src/lib/phase-content.ts` | Modify | Update Phase 3, 6, 7 editorial to reference Pape's framework |
| `src/app/methodology/page.tsx` | Modify | Add "Theoretical Framework" section |
| `src/data/sources.json` | Modify | Add Pape citations |

## What We Are NOT Changing

- No engine changes (DAG stays acyclic; escalation trap unrolled as categorical states)
- No new phase structure (existing 8 phases remain)
- No UI changes beyond methodology page text
- No changes to confidence scoring system
- No changes to timeline bar or phase badges

## Verification

1. All 62 existing tests must pass (new nodes are additive, existing nodes recalibrated but structurally identical)
2. `npx next build` succeeds
3. Manual: Phase 7 should now show lower "decisive US victory" probability and higher "frozen conflict" / "negotiated settlement"
4. Manual: Phase 6 should show new `iranian_nationalist_resolve` node responding to bombing intensity
5. Manual: Methodology page has new Pape section
