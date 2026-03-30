# Pape's Coercion Theory Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Robert Pape's coercion theory into the simulation — 4 new nodes encoding nationalist backlash, escalation trap staging, coercive success probability, and ground escalation; 4 CPT recalibrations; methodology page section.

**Architecture:** New nodes are appended to existing phase JSON files. CPT recalibrations modify defaultProbabilities and add parent references on existing nodes. No engine changes — the DAG structure handles everything. The methodology page gets a new "Theoretical Framework" section.

**Tech Stack:** JSON data files, TypeScript (phase-content.ts), Next.js (methodology page)

---

## File Structure

```
src/
├── data/
│   └── nodes/
│       ├── phase-3-conflict.json       # MODIFY: add escalation_trap_stage node
│       ├── phase-6-humanitarian.json   # MODIFY: add iranian_nationalist_resolve node
│       └── phase-7-resolution.json     # MODIFY: add 2 new nodes + recalibrate 4 existing
├── lib/
│   └── phase-content.ts               # MODIFY: update Phase 3, 6, 7 editorial
└── app/
    └── methodology/
        └── page.tsx                    # MODIFY: add Theoretical Framework section
```

---

### Task 1: Add `escalation_trap_stage` to Phase 3

**Files:**
- Modify: `src/data/nodes/phase-3-conflict.json`

- [ ] **Step 1: Add the new node to the Phase 3 JSON array**

Read `src/data/nodes/phase-3-conflict.json`. Append this node object to the end of the JSON array (before the closing `]`):

```json
{
  "id": "escalation_trap_stage",
  "phase": 3,
  "type": "categorical",
  "label": "Escalation Trap Stage (Pape)",
  "description": "Position in Robert Pape's three-stage escalation model. Stage 1: precision strikes on nuclear facilities (tactical success, strategic ambiguity). Stage 2: leadership decapitation and regime air campaign (qualitative phase transition to regime-change war). Stage 3: ground forces and territorial control (open-ended commitment). Since the Feb 28 strikes killed Khamenei and targeted regime infrastructure across 26 provinces, the conflict entered Stage 2 immediately. Pape estimates ~75% probability of progression to Stage 3 when air coercion fails.",
  "parents": ["us_air_campaign_scale", "strike_scale", "leadership_decapitation"],
  "categories": ["stage_1_precision_strikes", "stage_2_regime_campaign", "stage_3_ground_forces"],
  "cpt": [
    {
      "parentValues": { "us_air_campaign_scale": "sustained", "strike_scale": "massive_campaign", "leadership_decapitation": "true" },
      "categoryProbabilities": { "stage_1_precision_strikes": 0.02, "stage_2_regime_campaign": 0.85, "stage_3_ground_forces": 0.13 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "escalating", "strike_scale": "massive_campaign", "leadership_decapitation": "true" },
      "categoryProbabilities": { "stage_1_precision_strikes": 0.01, "stage_2_regime_campaign": 0.59, "stage_3_ground_forces": 0.40 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "sustained", "leadership_decapitation": "false" },
      "categoryProbabilities": { "stage_1_precision_strikes": 0.15, "stage_2_regime_campaign": 0.75, "stage_3_ground_forces": 0.10 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "limited", "leadership_decapitation": "false" },
      "categoryProbabilities": { "stage_1_precision_strikes": 0.70, "stage_2_regime_campaign": 0.25, "stage_3_ground_forces": 0.05 }
    }
  ],
  "defaultProbabilities": {
    "stage_1_precision_strikes": 0.03,
    "stage_2_regime_campaign": 0.85,
    "stage_3_ground_forces": 0.12
  },
  "source": {
    "citation": "Pape, 'Escalation Trap' Substack March 2026; Pape, Bombing to Win (Cornell, 1996); Pape, Foreign Affairs 2025-26",
    "url": "https://escalationtrap.substack.com/",
    "confidence": "medium"
  }
}
```

- [ ] **Step 2: Validate JSON**

Run:
```bash
node -e "const n=require('./src/data/nodes/phase-3-conflict.json'); console.log(n.length + ' nodes'); n.forEach(x => { if(x.type==='categorical') { const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0); if(Math.abs(s-1)>0.01) console.error('BAD:',x.id,s); } }); console.log('Valid')"
```
Expected: `16 nodes` + `Valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/nodes/phase-3-conflict.json
git commit -m "feat: add escalation_trap_stage node (Pape's three-stage model) to Phase 3"
```

---

### Task 2: Add `iranian_nationalist_resolve` to Phase 6

**Files:**
- Modify: `src/data/nodes/phase-6-humanitarian.json`

- [ ] **Step 1: Add the new node**

Read `src/data/nodes/phase-6-humanitarian.json`. Append this node after `humanitarian_cost_index` (at end of array):

```json
{
  "id": "iranian_nationalist_resolve",
  "phase": 6,
  "type": "categorical",
  "label": "Iranian Nationalist Resolve (Pape)",
  "description": "Pape's core empirical finding: strategic bombing strengthens rather than degrades defender resolve. Punishment strategies failed in all 8 cases studied (1917-1991). Iran absorbed hundreds of thousands of casualties during the Iran-Iraq War without collapsing; the language of sacrifice and martyrdom is embedded in state ideology. Authoritarian regimes suppress internal dissent under external pressure. Bombing 'infuses nationalism in the regime and across the society,' creating a positive feedback loop for resistance. Higher casualties and more destruction produce HIGHER resolve, not capitulation — the inverse of punishment theory's prediction.",
  "parents": ["us_air_campaign_scale", "infrastructure_destruction_scale", "iranian_civilian_death_toll"],
  "categories": ["low", "moderate", "high", "total_mobilization"],
  "cpt": [
    {
      "parentValues": { "us_air_campaign_scale": "sustained", "infrastructure_destruction_scale": "extensive", "iranian_civilian_death_toll": "500_2000" },
      "categoryProbabilities": { "low": 0.03, "moderate": 0.22, "high": 0.55, "total_mobilization": 0.20 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "sustained", "infrastructure_destruction_scale": "catastrophic", "iranian_civilian_death_toll": "2000_5000" },
      "categoryProbabilities": { "low": 0.01, "moderate": 0.09, "high": 0.35, "total_mobilization": 0.55 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "escalating", "infrastructure_destruction_scale": "catastrophic", "iranian_civilian_death_toll": "5000_10000" },
      "categoryProbabilities": { "low": 0.01, "moderate": 0.04, "high": 0.20, "total_mobilization": 0.75 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "limited", "infrastructure_destruction_scale": "limited", "iranian_civilian_death_toll": "under_500" },
      "categoryProbabilities": { "low": 0.25, "moderate": 0.50, "high": 0.20, "total_mobilization": 0.05 }
    },
    {
      "parentValues": { "us_air_campaign_scale": "paused", "infrastructure_destruction_scale": "limited" },
      "categoryProbabilities": { "low": 0.40, "moderate": 0.40, "high": 0.15, "total_mobilization": 0.05 }
    }
  ],
  "defaultProbabilities": {
    "low": 0.05,
    "moderate": 0.25,
    "high": 0.45,
    "total_mobilization": 0.25
  },
  "source": {
    "citation": "Pape, Bombing to Win Ch. 2-3 (Cornell, 1996); Pape, 'Escalation Trap' March 2026; Iran-Iraq War resilience data (1980-88)",
    "url": "https://escalationtrap.substack.com/",
    "confidence": "medium"
  }
}
```

- [ ] **Step 2: Validate**

```bash
node -e "const n=require('./src/data/nodes/phase-6-humanitarian.json'); console.log(n.length + ' nodes'); n.forEach(x => { if(x.type==='categorical') { const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0); if(Math.abs(s-1)>0.01) console.error('BAD:',x.id,s); } }); console.log('Valid')"
```
Expected: `13 nodes` + `Valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/nodes/phase-6-humanitarian.json
git commit -m "feat: add iranian_nationalist_resolve node (Pape's backlash coefficient) to Phase 6"
```

---

### Task 3: Add New Nodes + Recalibrate Existing Nodes in Phase 7

**Files:**
- Modify: `src/data/nodes/phase-7-resolution.json`

This is the most complex task — 2 new nodes + 4 existing node modifications.

- [ ] **Step 1: Add `coercive_success_probability` node**

Read `src/data/nodes/phase-7-resolution.json`. Add this node BEFORE `resolution_type` (since `resolution_type` will depend on it):

```json
{
  "id": "coercive_success_probability",
  "phase": 7,
  "type": "categorical",
  "label": "Coercive Success Probability (Pape)",
  "description": "Pape's central finding: airpower achieves ~100% tactical success but near-zero coercive (political) success against states employing asymmetric strategies. Punishment strategies succeeded 0 of 8 times. Denial succeeded 5 of 33 times (~15%), but only with ground forces creating a hammer-and-anvil effect. Iran's strategy — asymmetric deterrence, proxy networks, geographic depth, Strait of Hormuz leverage — resembles Vietnam's guerrilla model, against which Pape found denial 'impotent.' The tactical/strategic disconnect means military dominance does not predict political compliance.",
  "parents": ["overall_military_balance", "iranian_nationalist_resolve", "escalation_trap_stage"],
  "categories": ["succeeded", "partial", "failed", "counterproductive"],
  "cpt": [
    {
      "parentValues": { "overall_military_balance": "decisive_us", "iranian_nationalist_resolve": "high", "escalation_trap_stage": "stage_2_regime_campaign" },
      "categoryProbabilities": { "succeeded": 0.03, "partial": 0.17, "failed": 0.55, "counterproductive": 0.25 }
    },
    {
      "parentValues": { "overall_military_balance": "decisive_us", "iranian_nationalist_resolve": "total_mobilization", "escalation_trap_stage": "stage_2_regime_campaign" },
      "categoryProbabilities": { "succeeded": 0.02, "partial": 0.08, "failed": 0.45, "counterproductive": 0.45 }
    },
    {
      "parentValues": { "overall_military_balance": "decisive_us", "iranian_nationalist_resolve": "total_mobilization", "escalation_trap_stage": "stage_3_ground_forces" },
      "categoryProbabilities": { "succeeded": 0.02, "partial": 0.13, "failed": 0.40, "counterproductive": 0.45 }
    },
    {
      "parentValues": { "overall_military_balance": "decisive_us", "iranian_nationalist_resolve": "moderate" },
      "categoryProbabilities": { "succeeded": 0.10, "partial": 0.25, "failed": 0.45, "counterproductive": 0.20 }
    },
    {
      "parentValues": { "overall_military_balance": "decisive_us", "iranian_nationalist_resolve": "low" },
      "categoryProbabilities": { "succeeded": 0.20, "partial": 0.35, "failed": 0.35, "counterproductive": 0.10 }
    }
  ],
  "defaultProbabilities": {
    "succeeded": 0.05,
    "partial": 0.15,
    "failed": 0.55,
    "counterproductive": 0.25
  },
  "source": {
    "citation": "Pape, Bombing to Win (Cornell, 1996) — 33-case empirical analysis; Pape, 'Escalation Trap' March 2026; Kahl, 'Not Time to Attack Iran' Foreign Affairs 2012",
    "url": "https://escalationtrap.substack.com/",
    "confidence": "high"
  }
}
```

- [ ] **Step 2: Add `ground_escalation_probability` node**

Add this node after `coercive_success_probability`:

```json
{
  "id": "ground_escalation_probability",
  "phase": 7,
  "type": "binary",
  "label": "Ground Escalation Initiated (Pape)",
  "description": "Pape estimates approximately 75% probability that the US escalates to ground forces when air coercion fails. This is where 'the trap really closes' — an open-ended military commitment in a country of 88 million people spanning 636,000 square miles of mountainous terrain. Historical precedent: the same logic drove the 2003 Iraq invasion after a decade of air-only containment. Pape's framework predicts this as a structural outcome, not a policy choice — the recursive failure of airpower creates domestic political pressure that makes ground escalation appear as the 'only remaining option.'",
  "parents": ["coercive_success_probability", "actual_conflict_duration", "us_domestic_political_impact"],
  "cpt": [
    {
      "parentValues": { "coercive_success_probability": "failed", "actual_conflict_duration": "2_4_months", "us_domestic_political_impact": "rallying_effect" },
      "pTrue": 0.75
    },
    {
      "parentValues": { "coercive_success_probability": "failed", "actual_conflict_duration": "4_8_months", "us_domestic_political_impact": "growing_opposition" },
      "pTrue": 0.55
    },
    {
      "parentValues": { "coercive_success_probability": "counterproductive", "actual_conflict_duration": "2_4_months" },
      "pTrue": 0.80
    },
    {
      "parentValues": { "coercive_success_probability": "counterproductive", "actual_conflict_duration": "4_8_months" },
      "pTrue": 0.70
    },
    {
      "parentValues": { "coercive_success_probability": "partial" },
      "pTrue": 0.30
    },
    {
      "parentValues": { "coercive_success_probability": "succeeded" },
      "pTrue": 0.05
    }
  ],
  "defaultPTrue": 0.45,
  "source": {
    "citation": "Pape, 'Escalation Trap' March 2026 (~75% estimate); Pape, Bombing to Win Ch. 9-10; Posen, 'A Grand Strategy of Restraint' (2014)",
    "url": "https://escalationtrap.substack.com/",
    "confidence": "low"
  }
}
```

- [ ] **Step 3: Recalibrate `resolution_type`**

Find the `resolution_type` node in the JSON. Update its `parents` to include the two new nodes:

```json
"parents": ["ceasefire_mechanism", "war_termination_terms", "regional_expansion_risk_current", "coercive_success_probability", "ground_escalation_probability"]
```

Update `defaultProbabilities`:

```json
"defaultProbabilities": {
  "decisive_us_victory": 0.05,
  "negotiated_settlement": 0.33,
  "frozen_conflict": 0.38,
  "wider_regional_war": 0.24
}
```

Add CPT rows for the new parents:

```json
{
  "parentValues": { "coercive_success_probability": "failed", "ground_escalation_probability": "false" },
  "categoryProbabilities": { "decisive_us_victory": 0.02, "negotiated_settlement": 0.30, "frozen_conflict": 0.48, "wider_regional_war": 0.20 }
},
{
  "parentValues": { "coercive_success_probability": "failed", "ground_escalation_probability": "true" },
  "categoryProbabilities": { "decisive_us_victory": 0.08, "negotiated_settlement": 0.15, "frozen_conflict": 0.32, "wider_regional_war": 0.45 }
},
{
  "parentValues": { "coercive_success_probability": "counterproductive", "ground_escalation_probability": "true" },
  "categoryProbabilities": { "decisive_us_victory": 0.03, "negotiated_settlement": 0.10, "frozen_conflict": 0.27, "wider_regional_war": 0.60 }
}
```

- [ ] **Step 4: Recalibrate `war_termination_terms`**

Find `war_termination_terms`. Add `coercive_success_probability` to parents. Update defaultProbabilities — reduce `unconditional_iranian_surrender` to 0.02 per Pape's Proposition 5:

Check current categories and redistribute. The key change: unconditional surrender near-zero, redistribute to mutual_concessions and frozen_conflict.

- [ ] **Step 5: Recalibrate `ceasefire_mechanism`**

Find `ceasefire_mechanism`. Add `coercive_success_probability` to parents. Add CPT row:

```json
{
  "parentValues": { "coercive_success_probability": "failed" },
  "categoryProbabilities": { "us_ultimatum_accepted": 0.03, "turkey_mediated_deal": 0.12, "un_brokered": 0.10, "unilateral_ceasefire": 0.25, "no_ceasefire": 0.50 }
}
```

Per Pape's Proposition 6: coercion takes nearly as long as fighting to a finish.

- [ ] **Step 6: Recalibrate `iran_post_khamenei_power_structure`**

Find `iran_post_khamenei_power_structure`. Add `iranian_nationalist_resolve` to parents. Add CPT rows:

```json
{
  "parentValues": { "iranian_nationalist_resolve": "high" },
  "categoryProbabilities": { "hardliner_successor": 0.45, "military_junta": 0.30, "reformist_opening": 0.05, "fragmented_power_vacuum": 0.15, "regime_collapse": 0.05 }
},
{
  "parentValues": { "iranian_nationalist_resolve": "total_mobilization" },
  "categoryProbabilities": { "hardliner_successor": 0.55, "military_junta": 0.30, "reformist_opening": 0.02, "fragmented_power_vacuum": 0.10, "regime_collapse": 0.03 }
}
```

High resolve → hardliner consolidation (rally effect), not collapse.

- [ ] **Step 7: Validate entire Phase 7**

```bash
node -e "
const n=require('./src/data/nodes/phase-7-resolution.json');
console.log(n.length + ' nodes');
const ids = new Set(n.map(x=>x.id));
n.forEach(x => {
  if(x.type==='categorical') {
    const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
    if(Math.abs(s-1)>0.01) console.error('PROB SUM BAD:', x.id, s);
  }
  x.parents.forEach(p => {
    if(!ids.has(p)) {
      // Check other phases
    }
  });
});
console.log('Valid');
"
```
Expected: `13 nodes` + `Valid`

- [ ] **Step 8: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass

- [ ] **Step 9: Build check**

```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 10: Commit**

```bash
git add src/data/nodes/phase-7-resolution.json
git commit -m "feat: add coercive_success_probability + ground_escalation nodes, recalibrate resolution nodes (Pape)"
```

---

### Task 4: Update Methodology Page

**Files:**
- Modify: `src/app/methodology/page.tsx`

- [ ] **Step 1: Add Theoretical Framework section**

Read `src/app/methodology/page.tsx`. Add a new `<section>` after "How the Model Works" and before "What the Confidence Badges Mean":

```tsx
<section className="mt-10">
  <h2 className="text-lg font-semibold text-text-primary">Theoretical Framework: Pape&apos;s Coercion Theory</h2>
  <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
    <p>
      This simulation&apos;s conflict dynamics are informed by Robert Pape&apos;s empirical research
      on strategic coercion, the most comprehensive scholarly analysis of airpower&apos;s
      political effectiveness. Pape analyzed every strategic air campaign from 1917 to 1991
      (33 cases) and found a striking pattern: airpower almost always succeeds tactically
      but almost never achieves its political objectives.
    </p>
    <p>
      <strong className="text-text-primary">The denial/punishment distinction.</strong> Pape
      classified coercive airpower into four strategies. Punishment (targeting civilians to
      force capitulation) failed in all 8 cases where it was the dominant approach.
      Decapitation (killing leaders) has never worked independently against states. Only
      denial (threatening the enemy&apos;s ability to achieve military objectives) produced
      success — and only 15% of the time (5 of 33 cases), always requiring ground forces
      to create what Pape calls a &ldquo;hammer and anvil&rdquo; effect.
    </p>
    <p>
      <strong className="text-text-primary">The escalation trap.</strong> Applied to Iran,
      Pape&apos;s framework predicts a three-stage escalation pattern. Stage 1: precision
      strikes achieve tactical success but fail to eliminate dispersed nuclear knowledge.
      Stage 2: strategic disappointment drives escalation to regime-change bombing. Stage 3:
      air coercion fails to produce political compliance, creating structural pressure for
      ground forces (~75% probability by Pape&apos;s estimate). The core logic is recursive:
      failure generates fear, fear justifies escalation, escalation produces new failure.
    </p>
    <p>
      <strong className="text-text-primary">Nationalist backlash.</strong> Pape&apos;s most
      counterintuitive finding: bombing consistently <em>strengthens</em> defender resolve
      rather than degrading it. This is the inverse of what punishment theory predicts.
      Authoritarian regimes suppress internal revolt under external pressure, and civilian
      casualties trigger rally-around-the-flag effects. Iran absorbed hundreds of thousands
      of casualties during the Iran-Iraq War without collapsing. The simulation models this
      as a positive feedback loop where higher bombing intensity increases Iranian nationalist
      resolve, making political concessions <em>less</em> likely.
    </p>
    <p>
      <strong className="text-text-primary">How this shapes the model.</strong> Four nodes
      directly encode Pape&apos;s parameters: escalation trap stage (Phase 3), Iranian
      nationalist resolve (Phase 6), coercive success probability (Phase 7), and ground
      escalation probability (Phase 7). Resolution outcomes are calibrated against Pape&apos;s
      empirical success rates — &ldquo;decisive US victory&rdquo; through airpower alone is set
      near 5%, consistent with the 0-15% historical range for punishment and denial strategies.
    </p>
    <p>
      <strong className="text-text-primary">Limitations of the framework.</strong> Pape&apos;s
      33-case dataset predates precision-guided standoff weapons, advanced cyber capabilities,
      and Iranian drone swarms. His bilateral model does not fully capture multilateral
      dynamics (US, Israel, Iran, proxies, Russia, China). The ~75% ground escalation estimate
      is a single analyst projection without a historical base rate for this specific scenario.
      Competing scholars (Kroenig, Mueller) argue Pape underestimates punishment&apos;s marginal
      contribution in compound strategies.
    </p>
  </div>
  <div className="mt-4 border-t border-border pt-4">
    <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Key Sources</h4>
    <ul className="space-y-1 text-xs text-text-muted">
      <li>Pape, <em>Bombing to Win: Air Power and Coercion in War</em> (Cornell, 1996)</li>
      <li>Pape, &ldquo;Escalation Trap&rdquo; Substack (2025-26)</li>
      <li>Pape, <em>Foreign Affairs</em> articles on Iran (2025-26)</li>
      <li>Talmadge, &ldquo;Closing Time&rdquo; <em>International Security</em> (2008)</li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/methodology/page.tsx
git commit -m "feat: add Pape coercion theory section to methodology page"
```

---

### Task 5: Update Phase Editorial Content

**Files:**
- Modify: `src/lib/phase-content.ts`

- [ ] **Step 1: Update Phase 3 editorial**

Read `src/lib/phase-content.ts`. Find the Phase 3 entry. Add a sentence to the third paragraph referencing Pape's escalation trap — something like: "Robert Pape's coercion theory identifies this as Stage 2 of an escalation trap — a regime-change air campaign that produces tactical dominance but structural coercive failure, creating pressure for further escalation."

- [ ] **Step 2: Update Phase 6 editorial**

Find Phase 6. Add to the second paragraph: "Pape's empirical research on 33 air campaigns found that bombing consistently strengthens defender resolve rather than degrading it — the nationalist backlash coefficient. Iran's wartime history confirms this pattern."

- [ ] **Step 3: Update Phase 7 editorial**

Find Phase 7. Add to the first paragraph: "Pape's framework predicts that coercive success through airpower alone is near-impossible (~5% for states employing asymmetric strategies), and estimates a 75% probability of escalation to ground forces when air coercion fails."

- [ ] **Step 4: Commit**

```bash
git add src/lib/phase-content.ts
git commit -m "feat: add Pape coercion theory references to phase editorial content"
```

---

### Task 6: Final Verification + Push

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```
Expected: All tests pass

- [ ] **Step 2: Build**

```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 3: Verify node counts**

```bash
for f in src/data/nodes/*.json; do echo "$(basename $f): $(node -e "console.log(require('./$f').length)") nodes"; done
```
Expected: Phase 3: 16, Phase 6: 13, Phase 7: 13

- [ ] **Step 4: Push**

```bash
git push
```

---

## Summary

After all 6 tasks:

- **4 new Pape-derived nodes:** `escalation_trap_stage` (Phase 3), `iranian_nationalist_resolve` (Phase 6), `coercive_success_probability` (Phase 7), `ground_escalation_probability` (Phase 7)
- **4 recalibrated nodes:** `resolution_type` (decisive victory 18%→5%), `war_termination_terms` (unconditional surrender→~2%), `ceasefire_mechanism` (harder when coercion fails), `iran_post_khamenei_power_structure` (high resolve → hardliner consolidation)
- **Methodology page:** New "Theoretical Framework" section explaining Pape's denial/punishment distinction, escalation trap, nationalist backlash, and limitations
- **Phase editorials:** Phases 3, 6, 7 reference Pape's framework
- **Total nodes:** 100 → 104
