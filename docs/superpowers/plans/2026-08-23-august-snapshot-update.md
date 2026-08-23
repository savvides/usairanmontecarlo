# August 2026 Snapshot Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the simulation's timeline, editorial, Bayesian defaults, and mixed-phase scenario cards current with the conflict as of 23 August 2026.

**Architecture:** No engine or UI changes. `timeline.json` is the date source of truth (landing page and simulation banner already read it). Mixed-phase copy lives in `phase-content.ts`. Probability mass moves via `defaultProbabilities` / `defaultDistribution` / `defaultPTrue` plus node descriptions. Scenario card IDs stay frozen for URL state; titles and overrides are rewritten so cards branch from August 23, not April 6.

**Tech Stack:** JSON data files, TypeScript (`phase-content.ts`, methodology page, tests), Vitest, Next.js static export

**Spec:** `docs/superpowers/specs/2026-08-23-august-snapshot-update.md`

## Global Constraints

- Snapshot date is `2026-08-23` for both `lastUpdated` and `observedThrough`.
- `currentPhase` remains `3`. Phase status remains 1–2 observed, 3–7 mixed, 8 projected.
- Tone: authoritative but accessible. Think *The Economist* or *Foreign Affairs* — confident assertions backed by sourced data, no jargon without immediate plain-English context.
- Data model: snapshot-in-time with a clearly stated "as of" date. All parameters sourced from open-source intelligence and think tank reports. No live data feeds.
- Categorical `defaultProbabilities` must sum to 1.00 (±0.01).
- Scenario card IDs are frozen. Do not rename `conflict-winds-down-april`, `april-6-deadline-forces-hormuz-open`, `april-deal-quick-resolution`, or `negotiated-settlement-by-summer`.
- Do not add nodes, change the DAG, or edit `src/engine/`.
- Do not rewrite Phase 1–2 editorial.
- Do not zero falsified duration bins; leave a 0.01 residual.
- `oil_price_current.min` must be ≤ 65 (July Brent printed $71.57).
- Prefer changing defaults + descriptions, not CPT rows.
- Be respectful of the sensitive subject matter — this is an educational tool about a real conflict affecting real people.
- Version bump is `1.0.4.0` → `1.0.5.0` in both `VERSION` and `package.json`.

---

## File Structure

```
docs/superpowers/specs/2026-08-23-august-snapshot-update.md   # spec (already written)
src/data/timeline.json                                        # MODIFY: dates + 14 events
src/data/nodes/phase-3-conflict.json                          # MODIFY: 4 node defaults + descriptions
src/data/nodes/phase-4-economic.json                          # MODIFY: 6 node defaults + descriptions
src/data/nodes/phase-5-geopolitical.json                      # MODIFY: 3 node defaults + descriptions
src/data/nodes/phase-6-humanitarian.json                      # MODIFY: 1 node default + description
src/data/nodes/phase-7-resolution.json                        # MODIFY: 5 node defaults + descriptions
src/data/scenarios/phase-3-scenarios.json                     # MODIFY: 2 card titles/copy/overrides
src/data/scenarios/phase-4-scenarios.json                     # MODIFY: 1 card title/copy/overrides
src/data/scenarios/phase-7-scenarios.json                     # MODIFY: 2 card titles/copy/overrides
src/data/sources.json                                         # MODIFY: append 4 sources
src/lib/phase-content.ts                                      # MODIFY: phases 3–8 editorial
src/app/methodology/page.tsx                                  # MODIFY: Pape validation + snapshot date
src/__tests__/lib/timeline.regression-001.test.ts             # MODIFY: snapshot-drift assertions
README.md                                                     # MODIFY: phase table
CHANGELOG.md                                                  # MODIFY: 1.0.5.0 entry
VERSION                                                       # MODIFY: 1.0.5.0
package.json                                                  # MODIFY: 1.0.5.0
CONTRIBUTING.md                                               # MODIFY: test count
```

---

### Task 1: Snapshot-drift regression tests

**Files:**
- Modify: `src/__tests__/lib/timeline.regression-001.test.ts`

**Interfaces:**
- Consumes: `timeline` and `formatLongDate` from `src/lib/timeline.ts`; `phaseContent` from `src/lib/phase-content.ts`
- Produces: failing tests that later tasks must turn green. Test names and assertions below are the contract.

- [ ] **Step 1: Write the failing tests**

Append these describes to `src/__tests__/lib/timeline.regression-001.test.ts` (keep the existing `formatLongDate` and `describePhaseStatus` suites):

```typescript
import { phaseContent } from '@/lib/phase-content';

describe('August 2026 snapshot contract', () => {
  it('lastUpdated and observedThrough are 2026-08-23', () => {
    expect(timeline.lastUpdated).toBe('2026-08-23');
    expect(timeline.observedThrough).toBe('2026-08-23');
  });

  it('formatLongDate of lastUpdated is August 23, 2026', () => {
    expect(formatLongDate(timeline.lastUpdated)).toBe('August 23, 2026');
  });

  it('includes the Islamabad Memorandum on 2026-06-17', () => {
    const mou = timeline.events.find((e) => e.date === '2026-06-17');
    expect(mou).toBeDefined();
    expect(mou!.phase).toBe(7);
    expect(mou!.label.toLowerCase()).toMatch(/islamabad|mou|memorandum/);
  });

  it('includes Trump declaring the MoU over on 2026-07-08', () => {
    const over = timeline.events.find((e) => e.date === '2026-07-08');
    expect(over).toBeDefined();
    expect(over!.phase).toBe(7);
  });

  it('includes the 60-day MoU window lapse on 2026-08-17', () => {
    const lapse = timeline.events.find((e) => e.date === '2026-08-17');
    expect(lapse).toBeDefined();
    expect(lapse!.phase).toBe(7);
  });

  it('keeps events sorted by date', () => {
    const dates = timeline.events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('does not lead mixed-phase copy with a stale snapshot date', () => {
    const stale = /As of (April 24|May 22), 2026/;
    for (const p of phaseContent.filter((x) => x.phase >= 3)) {
      expect(p.paragraphs.join(' ')).not.toMatch(stale);
    }
  });

  it('phase 3 editorial names the current snapshot date', () => {
    const p3 = phaseContent.find((p) => p.phase === 3);
    expect(p3).toBeDefined();
    expect(p3!.paragraphs[0]).toContain('August 23, 2026');
  });
});
```

Add the `phaseContent` import at the top of the file next to the existing timeline imports.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/lib/timeline.regression-001.test.ts -v`

Expected: FAIL — `lastUpdated` is still `2026-05-22`; no 2026-06-17 event; phase 3 copy still contains `As of April 24, 2026`.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/__tests__/lib/timeline.regression-001.test.ts
git commit -m "test: snapshot-drift contract for August 23, 2026 update"
```

---

### Task 2: Timeline events and dates

**Files:**
- Modify: `src/data/timeline.json`

**Interfaces:**
- Consumes: existing `TimelineEvent` shape `{ date, label, description, phase, source }` from `src/lib/timeline.ts`
- Produces: `timeline.lastUpdated === "2026-08-23"`, `timeline.observedThrough === "2026-08-23"`, 14 new events, events sorted by `date`

- [ ] **Step 1: Patch the header dates**

In `src/data/timeline.json` set:

```json
"lastUpdated": "2026-08-23",
"observedThrough": "2026-08-23",
"currentPhase": 3
```

Leave `phaseStatus` unchanged:

```json
"1": "observed",
"2": "observed",
"3": "mixed",
"4": "mixed",
"5": "mixed",
"6": "mixed",
"7": "mixed",
"8": "projected"
```

- [ ] **Step 2: Append these 14 events to the `events` array, then sort the array by `date`**

Do not delete or rewrite existing events. Append:

```json
{ "date": "2026-06-03", "label": "House votes to halt the war", "description": "US House passes 215–208 a measure requiring the administration to cease operations against Iran or obtain congressional authorization to continue.", "phase": 5, "source": "Wikipedia (2026 Iran war); Reuters" },
{ "date": "2026-06-17", "label": "Islamabad MoU signed", "description": "Trump (Versailles) and Pezeshkian (Tehran) remotely sign a 14-point memorandum: 60-day halt in strikes, Hormuz reopened toll-free, US blockade of Iranian ports to end, oil-sanctions waiver. Nuclear, missiles, and proxies deferred to a final deal. Mojtaba Khamenei endorses with misgivings.", "phase": 7, "source": "Wikipedia (Islamabad Memorandum); The Guardian, 17 June 2026" },
{ "date": "2026-06-18", "label": "US lifts Iran blockade", "description": "CENTCOM announces the naval blockade of Iranian ports is lifted. Pakistan says Iran will reopen Hormuz 'instantly' and the American blockade will end 'immediately.'", "phase": 7, "source": "Al Jazeera, 18 June 2026; NDTV" },
{ "date": "2026-06-20", "label": "Iran re-closes Hormuz over Lebanon", "description": "One day after Trump announces an Israel–Hezbollah ceasefire, Iran shuts Hormuz again, citing continued Israeli strikes in southern Lebanon as a MoU violation. The US military denies the claim.", "phase": 4, "source": "Reuters / Al Arabiya, 20 June 2026; Al Jazeera" },
{ "date": "2026-06-23", "label": "Senate votes to halt the war", "description": "US Senate passes 50–48 a measure mandating an end to war operations or congressional consent to continue — the second chamber to rebuke the campaign.", "phase": 5, "source": "Reuters, 23 June 2026; Wikipedia (2026 Iran war)" },
{ "date": "2026-06-27", "label": "MoU stress-tested in Hormuz", "description": "After the M/V Ever Lovely and tanker MT Kiku are hit in the strait, US jets strike Iranian missile, drone, and radar sites on Qeshm and along Hormuz. IRGC hits US-linked targets in Bahrain and Kuwait. Each side accuses the other of violating the June deal.", "phase": 3, "source": "NYT, 27 June 2026; NBC News, 28 June 2026; CENTCOM" },
{ "date": "2026-07-08", "label": "Trump declares MoU 'over'", "description": "After Iranian attacks on commercial ships asserting sovereignty over Hormuz, Trump says the memorandum is 'over' and 'I don't want to deal with them anymore.' US strike packages that week hit ≥170 targets — about 17 times the 26 June salvo.", "phase": 7, "source": "Wikipedia (Islamabad Memorandum); CBS News, 10 July 2026; Reuters" },
{ "date": "2026-07-15", "label": "US reimposes naval blockade", "description": "CENTCOM reimposes the naval blockade of Iranian ports at 16:00 ET, reversing the 18 June lift that was the centrepiece of the MoU.", "phase": 7, "source": "CENTCOM; India Today, 16 July 2026" },
{ "date": "2026-07-24", "label": "Thirteen nights of strikes, then a pause", "description": "After 13 consecutive nights of US strikes and Iranian retaliatory attacks on Gulf bases, Trump says he is close to deciding on a 'massive attack,' then both sides pause direct strikes. US officials later describe extreme interceptor shortages.", "phase": 3, "source": "NPR, 24 July 2026; CBS News" },
{ "date": "2026-07-28", "label": "Iran strikes US forces in Jordan", "description": "Iran conducts a ballistic-missile attack on US forces in Jordan. Washington calls it an 'attempted surprise attack' and resumes strikes on 29–30 July, ending the four-day pause.", "phase": 3, "source": "NPR, 30 July 2026; CENTCOM" },
{ "date": "2026-08-04", "label": "Dual-lane Hormuz framework, never starts", "description": "Tehran approves a dual-lane transit framework with Oman — zero tolls, mine clearance of the main lane within 30 days — on a separate 60-day clock. Clearance rallies; the mine work never starts.", "phase": 4, "source": "Kpler, 19 August 2026; Crisis Group trigger list" },
{ "date": "2026-08-17", "label": "60-day MoU window lapses", "description": "The Islamabad Memorandum's deadline for a final deal passes with no agreement, no extension, and no talks under way. Araghchi says Tehran 'never had a ceasefire that would now need to be extended.' Trump answers 'No' when asked about an extension.", "phase": 7, "source": "Kpler, 19 August 2026; Forbes, 18 August 2026" },
{ "date": "2026-08-18", "label": "UAE severs Iran; Ghalibaf keeps Hormuz shut", "description": "After reporting two Iranian missiles, one landing in its territorial waters, the UAE suspends all trade, exchange, and financial transactions with Iran. Ghalibaf tells lawmakers Hormuz stays shut until the blockade is lifted, frozen assets released, and oil sanctions removed. Iran denies the missile claim.", "phase": 5, "source": "Forbes, 18 August 2026; Reuters; Wikipedia (2026 Iran war)" },
{ "date": "2026-08-20", "label": "Trump declares 'Economic D-Day'", "description": "Trump announces that any country trading with Iran will be sanctioned, branding the package 'Economic D-Day.' A US official says the IRGC 'doesn't control the strait. We do.' Hormuz crossings print as low as 7 per day against a pre-war ~130.", "phase": 5, "source": "Times of Israel, 22 August 2026; Reuters, 19 August 2026; Kpler" }
```

After appending, sort `events` by `date` ascending (ISO strings sort correctly). Keep each object on one line to match the file's existing style.

- [ ] **Step 3: Run the snapshot tests**

Run: `npx vitest run src/__tests__/lib/timeline.regression-001.test.ts -v`

Expected: the lastUpdated, MoU, 2026-07-08, 2026-08-17, and sorted-events tests PASS. The two `phase-content` tests still FAIL.

- [ ] **Step 4: Commit**

```bash
git add src/data/timeline.json
git commit -m "data: add 14 timeline events through 23 August 2026"
```

---

### Task 3: Recalibrate Phase 3 nodes

**Files:**
- Modify: `src/data/nodes/phase-3-conflict.json` — nodes `conflict_duration_projection`, `us_military_casualties`, `ceasefire_window`, `escalation_trap_stage`

**Interfaces:**
- Consumes: existing category keys on those four nodes (do not rename keys)
- Produces: new `defaultProbabilities` that sum to 1.00 and descriptions that cite August 2026 facts

- [ ] **Step 1: `conflict_duration_projection`**

Replace its `description` with:

```text
Estimated total duration of active combat operations. Observed: the war began 28 February 2026 and is in its sixth month as of 23 August 2026 (~176 days). A 14-point Islamabad Memorandum signed 17 June produced a 60-day window that lapsed on 17 August with no final deal. A 13-night July air campaign and the 15 July reimposition of the US naval blockade show that 'active combat' now pulses rather than ending. Bins of weeks and 1–3 months are falsified as total-duration outcomes; mass moves to prolonged_over_6_months. Historical comparisons: Kosovo air campaign 78 days, Libya 2011 air campaign 7 months, this campaign has already matched Libya and is not over.
```

Replace `defaultProbabilities` with:

```json
{
  "weeks": 0.01,
  "1_3_months": 0.04,
  "3_6_months": 0.20,
  "prolonged_over_6_months": 0.75
}
```

Replace `source.citation` with:

```text
Historical air campaign duration analysis (Kosovo 78 days, Libya 213 days); Wikipedia '2026 Iran war' as of 23 August 2026 (~176 days ongoing); Kpler '60 days of a broken US-Iran MoU' 19 August 2026; RAND 'Duration and Outcomes of US Military Interventions' 2024
```

- [ ] **Step 2: `us_military_casualties`**

Replace `description` with:

```text
Total US military casualties (killed and wounded) during the conflict. Observed as of 21 July 2026: 19 service members and 1 civilian contractor killed; 624 service members and 5 contractors wounded (Wikipedia / CENTCOM). That is no longer a 'light' air-campaign bill — it is moderate for a six-month standoff-and-strike war, and it does not include the 6 airmen killed in the 12 March KC-135 crash that CENTCOM said was not hostile. Projection forward now depends less on a ground invasion (which has not occurred) and more on whether Hormuz interdiction, Jordan/Bahrain/Kuwait base attacks, and interceptor shortages produce a step-change.
```

Replace `defaultProbabilities` with:

```json
{
  "minimal": 0.02,
  "light": 0.25,
  "moderate": 0.58,
  "heavy": 0.15
}
```

Replace `source.citation` with:

```text
Wikipedia 'Casualties of the 2026 Iran war' (as of 21 July 2026: 19 KIA, 624 wounded); CENTCOM / DoD press briefings; CRS 'US Military Casualties in Operations' database
```

- [ ] **Step 3: `ceasefire_window`**

Replace `description` with:

```text
Assessment of diplomatic openings for a ceasefire or conflict termination. Observed as of 23 August 2026: the window that existed in June was used. The Islamabad Memorandum was signed 17 June, declared 'over' by Trump on 8 July, and its 60-day final-deal clock lapsed on 17 August with no extension and no talks scheduled. Oman is talking to Iran about a dual-lane Hormuz route, not about ending the war. Congressional war-powers votes (House 3 June, Senate 23 June) constrain escalation more than they open a deal. The live state is closer to 'none' than 'strong,' with a residual 'narrow' channel through Pakistan/Qatar/Oman messengers.
```

Replace `defaultProbabilities` with:

```json
{
  "none": 0.48,
  "narrow": 0.38,
  "moderate": 0.12,
  "strong": 0.02
}
```

Replace `source.citation` with:

```text
Wikipedia 'Islamabad Memorandum'; Kpler 19 August 2026; Forbes 'Iran's Top Negotiator Says Hormuz Will Stay Shut' 18 August 2026; Reuters Senate war-powers vote 23 June 2026
```

- [ ] **Step 4: `escalation_trap_stage`**

Replace `description` with:

```text
Position in Robert Pape's three-stage escalation model. Stage 1: precision strikes on nuclear facilities. Stage 2: leadership decapitation and regime air campaign. Stage 3: ground forces and territorial control. The conflict entered Stage 2 on 28 February when Khamenei was killed and regime infrastructure was hit across 26 provinces. As of 23 August 2026 it is still in Stage 2. Pape estimated ~75% probability of progression to Stage 3 when air coercion fails; six months of coercive failure have instead produced a naval blockade, a signed-then-dead memorandum, and 'Economic D-Day' secondary sanctions. Stage 3 is not off the table — Trump threatened to 'take Kharg Island' in July and then said he was unsure 'America has the stomach' — but munitions shortages (virtually all PrSM/ATACMS, ~80% of THAAD) and two congressional war-powers votes are a constraint the original 75% estimate did not price.
```

Replace `defaultProbabilities` with:

```json
{
  "stage_1_precision_strikes": 0.02,
  "stage_2_regime_campaign": 0.90,
  "stage_3_ground_forces": 0.08
}
```

Leave the CPT rows unchanged.

- [ ] **Step 5: Validate JSON and probability sums**

Run:

```bash
node -e "
const n=require('./src/data/nodes/phase-3-conflict.json');
const ids=['conflict_duration_projection','us_military_casualties','ceasefire_window','escalation_trap_stage'];
for (const id of ids) {
  const x=n.find(y=>y.id===id);
  const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
  console.log(id, s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
}
"
```

Expected: four `OK` lines.

- [ ] **Step 6: Commit**

```bash
git add src/data/nodes/phase-3-conflict.json
git commit -m "data: recalibrate Phase 3 defaults for six-month war"
```

---

### Task 4: Recalibrate Phase 4 nodes

**Files:**
- Modify: `src/data/nodes/phase-4-economic.json` — nodes `oil_price_current`, `hormuz_closure_status`, `oil_production_loss`, `hormuz_reopening_timeline`, `oil_price_trajectory_6mo`, `iranian_economic_collapse`

**Interfaces:**
- Consumes: existing category / distribution keys
- Produces: defaults that match August 2026 oil and Hormuz prints; `oil_price_current.min === 65`

- [ ] **Step 1: `oil_price_current`**

Replace `description` with:

```text
Brent crude benchmark price as of 23 August 2026. Observed path: pre-war ~$70–83; March peak prints of $118–$139; $71.57 on 1 July as the MoU briefly de-risked the market; $100.69 on 23 July during the 13-night campaign; $91.62 settle on 19 August (WTI $85.83). The panic premium of March is gone; a structural Hormuz premium remains. Paper-physical dislocation is smaller than in March because Gulf producers have rerouted some barrels (Saudi East-West pipeline, Fujairah STS) and because demand destruction plus SPR releases filled the first months. The default distribution is now centered near $92, not $120.
```

Replace `defaultDistribution` with:

```json
{ "type": "normal", "params": [92, 12] }
```

Replace `"min": 80` with `"min": 65`. Leave `"max": 200`.

Replace `source.citation` with:

```text
Reuters 'Oil prices settle near 4-week high' 19 August 2026 (Brent $91.62, WTI $85.83); Wikipedia energy section (Brent $71.57 on 1 July, $100.69 on 23 July); Reuters 'Oil market starts pricing in a prolonged Hormuz crisis' 18 August 2026
```

- [ ] **Step 2: `hormuz_closure_status`**

Replace `description` with:

```text
Current operational status of the Strait of Hormuz for commercial shipping. Observed as of 23 August 2026: not fully open and not a literal zero. Pre-war throughput was ~130 vessels/day and ~18 million bpd. Kpler counted ~13 crossings/day in mid-August and 7 on 21 August, the lowest daily print of the war. Trump says the strait is 'open and operating' and 'all water mines have been removed'; Ghalibaf says it stays shut until US conditions are met. The accurate state is closed_selective_passage — a handful of hulls (some dark, some on the UN/Omani southern route, occasional Iraqi tankers Iran allows as a concession that preserves Iranian management claims) against a collapsed commercial baseline.
```

Replace `defaultProbabilities` with:

```json
{
  "open": 0.01,
  "partial": 0.08,
  "closed_selective_passage": 0.82,
  "fully_closed": 0.09
}
```

Replace `source.citation` with:

```text
Kpler / Reuters Hormuz crossing counts 13–21 August 2026 (7–13/day vs ~130 pre-war); Forbes 18 August 2026 (Ghalibaf); Crisis Group trigger list 18 August 2026 (Trump 'open and operating'); Lloyd's List
```

- [ ] **Step 3: `oil_production_loss`**

Replace `description` with:

```text
Net reduction in global oil supply reaching market due to the conflict. The March 'over 10 million bpd' emergency print is no longer the whole story. Kpler: Hormuz crude+products averaged 4.8 million bpd in July and ~2 million bpd so far in August, versus ~18 million bpd pre-war — a 13–16 million bpd hole through the strait — but substitution is real. Saudi East-West pipeline and Fujairah ship-to-ship transfers, plus demand destruction and SPR barrels, mean the net market shortfall is smaller than the strait hole. UAE crude exports in August were actually slightly above 2025. The modal bin therefore moves from over_10m_bpd toward 7_10m_bpd, with a fat tail still in over_10m if ADNOC-linked attacks and Economic D-Day collapse the workarounds.
```

Replace `defaultProbabilities` with:

```json
{
  "under_3m_bpd": 0.05,
  "3_7m_bpd": 0.25,
  "7_10m_bpd": 0.45,
  "over_10m_bpd": 0.25
}
```

Replace `source.citation` with:

```text
Reuters / Kpler 18 August 2026 (Hormuz 4.8 mb/d July, ~2 mb/d August vs 18 mb/d pre-war; UAE August exports 3.38 mb/d); IEA Oil Market Report; EIA
```

- [ ] **Step 4: `hormuz_reopening_timeline`**

Replace `description` with:

```text
Projected timeline for resumption of commercial shipping through the Strait of Hormuz, measured from 23 August 2026. The April Dallas Fed / Baker Hughes consensus that the strait would not fully reopen until H2 2026 is now a miss — August is H2 and daily crossings are in the single digits. The 17 June MoU was supposed to reopen the strait toll-free for 60 days; Iran re-closed it on 20 June over Lebanon, and the window lapsed on 17 August. A 4 August Iran–Oman dual-lane framework (zero tolls, 30-day mine clearance) never started. Ghalibaf's 18 August conditions — lift the blockade, release frozen assets, remove oil sanctions — are a negotiated outcome, not a minesweeping problem. 'Indefinite' is now the modal bin.
```

Replace `defaultProbabilities` with:

```json
{
  "within_weeks": 0.03,
  "1_3_months": 0.12,
  "3_6_months": 0.30,
  "indefinite": 0.55
}
```

Replace `source.citation` with:

```text
Kpler '60 days of a broken US-Iran MoU' 19 August 2026; Forbes 18 August 2026; Dallas Fed Energy survey April 2026 (H2 reopen call, now missed); CENTCOM MCM reporting
```

- [ ] **Step 5: `oil_price_trajectory_6mo`**

Replace `description` with:

```text
Projected Brent crude price 6 months forward from 23 August 2026 (approximately February 2027). The March default centered at $140 assumed the panic premium would persist. It did not: the market learned to live with a half-closed strait, and Brent spent early July in the $70s before repricing the MoU collapse back into the $90s. The forward question is whether Economic D-Day, ADNOC-tanker attacks, and a 1.8 mb/d Q3 deficit (IEA August revision) push prices back to three digits, or whether substitution and demand destruction cap them near $90–110. The default is now centered near $98, not $140.
```

Replace `defaultDistribution` with:

```json
{ "type": "normal", "params": [98, 18] }
```

Replace `"min": 80` with `"min": 65`. Leave `"max": 250`.

Replace `source.citation` with:

```text
Reuters 18–19 August 2026; IEA August 2026 Oil Market Report (Q3 deficit revised to 1.8 mb/d); ICE Brent; Goldman Sachs Gulf-disruption scenarios
```

- [ ] **Step 6: `iranian_economic_collapse`**

Replace `description` with:

```text
Severity of Iran's economic collapse as of 23 August 2026. Reuters/Kpler: Iranian crude exports have fallen to 294,000 bpd this month from 1.7 million bpd in 2025. ISNA: inflation exceeded 80% year-on-year in July. The US blockade, reimposed 15 July, and the 20 August 'Economic D-Day' threat (secondary sanctions on any country trading with Iran) are the current squeeze, not just strike damage. The regime is not a failed state: it signed a presidential MoU in June, the SNSC still issues Hormuz conditions, and parliament still legislates. That is 'near_total' economic pain with a functioning wartime state, not 'failed_state.'
```

Replace `defaultProbabilities` with:

```json
{
  "managed": 0.02,
  "severe": 0.38,
  "near_total": 0.50,
  "failed_state": 0.10
}
```

Replace `source.citation` with:

```text
Reuters 18 August 2026 (exports 294k bpd vs 1.7 mb/d; inflation >80% YoY July per ISNA); Wikipedia 'Economic D-Day' 20 August 2026; World Bank Iran Economic Monitor
```

- [ ] **Step 7: Validate sums and min**

Run:

```bash
node -e "
const n=require('./src/data/nodes/phase-4-economic.json');
for (const id of ['hormuz_closure_status','oil_production_loss','hormuz_reopening_timeline','iranian_economic_collapse']) {
  const x=n.find(y=>y.id===id);
  const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
  console.log(id, s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
}
const oil=n.find(y=>y.id==='oil_price_current');
console.log('oil min', oil.min, oil.min<=65?'OK':'BAD', 'mean', oil.defaultDistribution.params[0]);
"
```

Expected: four `OK` probability lines, `oil min 65 OK mean 92`.

- [ ] **Step 8: Commit**

```bash
git add src/data/nodes/phase-4-economic.json
git commit -m "data: recalibrate Phase 4 oil and Hormuz defaults to August prints"
```

---

### Task 5: Recalibrate Phase 5 nodes

**Files:**
- Modify: `src/data/nodes/phase-5-geopolitical.json` — nodes `ceasefire_negotiation_status`, `gcc_alignment_shift`, `global_alliance_realignment`

**Interfaces:**
- Consumes: existing category keys
- Produces: defaults that encode MoU-dead, UAE cutoff, congressional votes

- [ ] **Step 1: `ceasefire_negotiation_status`**

Replace `description` with:

```text
Current state of diplomatic efforts to achieve a ceasefire. Observed as of 23 August 2026: a deal was reached, implemented in part, and then died. The 17 June Islamabad Memorandum was the 'near_agreement' / 'progressing' state; Trump declared it 'over' on 8 July; the 60-day final-deal clock lapsed on 17 August. Ghalibaf on 18 August restated maximalist Hormuz conditions. Trump the same day said no talks are scheduled. Oman is negotiating a shipping-route technical arrangement, which is not a ceasefire negotiation. The live state is deadlocked, with a thin residual 'progressing' mass for the Oman/Pakistan/Qatar messenger channel.
```

Replace `defaultProbabilities` with:

```json
{
  "not_attempted": 0.03,
  "deadlocked": 0.85,
  "progressing": 0.10,
  "near_agreement": 0.02
}
```

Replace `source.citation` with:

```text
Wikipedia 'Islamabad Memorandum' (signed 17 June, 'over' 8 July, window lapsed 17 August); Forbes 18 August 2026; Crisis Group trigger list 18 August 2026
```

- [ ] **Step 2: `gcc_alignment_shift`**

Replace `description` with:

```text
How Gulf Cooperation Council states' political alignment shifts in response to the conflict. Observed as of 18–20 August 2026: the UAE suspended all trade, exchange, and financial transactions with Iran after reporting two Iranian missiles (one in UAE territorial waters) and after a week of ADNOC-affiliated tanker attacks that Abu Dhabi named as IRGC piracy. That is a step toward closer_to_us on the Iran question. Simultaneously, Trump's 'get your own oil' line, NATO's 'not our war' posture through the spring, and the 20 August threat to sanction any country trading with Iran push GCC capitals toward hedging — they want the strait open and do not want to be drafted into Economic D-Day. Rezaei's 22 August threat to halt all oil through Hormuz if neighbors join the US crackdown is the squeeze from the other side. Modal outcome remains hedging, with closer_to_us still large and a fatter distancing tail than in March.
```

Replace `defaultProbabilities` with:

```json
{
  "closer_to_us": 0.38,
  "hedging": 0.42,
  "distancing_from_us": 0.16,
  "hostile_to_us": 0.04
}
```

Replace `source.citation` with:

```text
Wikipedia '2026 Iran war' 18 August 2026 (UAE financial cutoff); Reuters 19 August 2026; Times of Israel 22 August 2026 (Economic D-Day); Hormuz Strait Monitor 23 August 2026 (Rezaei threat)
```

- [ ] **Step 3: `global_alliance_realignment`**

Replace `description` with:

```text
Whether the conflict triggers broader realignment of the international order. New observed facts since the March UNSC 13-0-2 vote: the US House (3 June, 215–208) and Senate (23 June, 50–48) voted to halt the war or require authorization; NATO on 19 August said it is 'prepared to defend all allies' against Iran, which is Article 5 language aimed at Iranian strikes on Turkey/Incirlik and Jordan, not a commitment to join the Iran campaign; US munitions stocks (PrSM, ATACMS, THAAD, Tomahawk, Reaper) are visibly depleted, which Indo-Pacific planners will read as a transfer of deterrence from Taiwan to Hormuz; Trump's 20 August secondary-sanctions threat is an attempt to coerce China, Iran's top remaining oil customer. The US-led order is not collapsing, but the 'unchanged' bin of March is too generous. Mass moves toward multipolar_fragmentation.
```

Replace `defaultProbabilities` with:

```json
{
  "us_led_order_strengthened": 0.12,
  "unchanged": 0.28,
  "multipolar_fragmentation": 0.42,
  "anti_us_bloc_forming": 0.18
}
```

Replace `source.citation` with:

```text
Reuters House 3 June and Senate 23 June 2026 war-powers votes; Wikipedia NATO statement 19 August 2026; The Hill 4 August 2026 (munitions); Times of Israel 22 August 2026 (Economic D-Day)
```

- [ ] **Step 4: Validate sums**

Run:

```bash
node -e "
const n=require('./src/data/nodes/phase-5-geopolitical.json');
for (const id of ['ceasefire_negotiation_status','gcc_alignment_shift','global_alliance_realignment']) {
  const x=n.find(y=>y.id===id);
  const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
  console.log(id, s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
}
"
```

Expected: three `OK` lines.

- [ ] **Step 5: Commit**

```bash
git add src/data/nodes/phase-5-geopolitical.json
git commit -m "data: recalibrate Phase 5 diplomacy, GCC, and alliance defaults"
```

---

### Task 6: Recalibrate Phase 6 civilian-toll node

**Files:**
- Modify: `src/data/nodes/phase-6-humanitarian.json` — node `iranian_civilian_death_toll`

**Interfaces:**
- Consumes: categories `under_500`, `500_2000`, `2000_5000`, `5000_10000`, `over_10000`
- Produces: defaults that treat 500_2000 as no longer modal given six months of war and divergent 3.4k–6k total-death prints

- [ ] **Step 1: Replace description, defaults, citation**

Description:

```text
Total Iranian civilian fatalities from direct strike effects and secondary causes. Reporting has not converged. HRANA has documented 3,684 war deaths in Iran (its 7 April cut showed 1,701 civilians, 1,221 military, 714 unclassified — military is an undercount). Iran's Health Ministry has reported 3,528; OCHA 3,400; the IDF 6,000. Civilian-only figures are therefore a range, not a point: likely still inside or just above the 2,000–5,000 bracket once unclassified and post-April deaths are considered, with a real tail into 5,000–10,000 if the IDF number is closer to truth or if July's 13-night campaign is under-counted in HRANA's slow update. Do not present a single number as fact. The 500–2,000 bin that was modal in March is no longer the center of mass.
```

Defaults:

```json
{
  "under_500": 0.01,
  "500_2000": 0.22,
  "2000_5000": 0.55,
  "5000_10000": 0.18,
  "over_10000": 0.04
}
```

Citation:

```text
Wikipedia 'Casualties of the 2026 Iran war' (HRANA 3,684; Iran MoH 3,528; OCHA 3,400; IDF 6,000); HRANA 7 April 2026 civilian/military split; IFRC earlier ~1,900
```

- [ ] **Step 2: Validate sum**

Run:

```bash
node -e "
const n=require('./src/data/nodes/phase-6-humanitarian.json');
const x=n.find(y=>y.id==='iranian_civilian_death_toll');
const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
console.log('iranian_civilian_death_toll', s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
"
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add src/data/nodes/phase-6-humanitarian.json
git commit -m "data: shift Iranian civilian-toll defaults off the March 500-2000 bin"
```

---

### Task 7: Recalibrate Phase 7 nodes

**Files:**
- Modify: `src/data/nodes/phase-7-resolution.json` — nodes `actual_conflict_duration`, `ceasefire_mechanism`, `hormuz_reopening`, `coercive_success_probability`, `ground_escalation_probability`, `resolution_type`

**Interfaces:**
- Consumes: existing category keys; `ground_escalation_probability.defaultPTrue` is a number in `[0,1]`
- Produces: duration mass in 4–8 months / over 8 months; no_ceasefire modal; prolonged Hormuz closure modal; counterproductive up; ground PTrue down; frozen_conflict still modal

- [ ] **Step 1: `actual_conflict_duration`**

Description:

```text
The realized duration of active hostilities measured from the 28 February 2026 initiation of US/Israel strikes. As of 23 August 2026 the conflict is ~176 days old — inside the 4–8 month bin and 12 days short of 6 months. Bins of under_6_weeks and 2–4 months are falsified as total-duration outcomes. Whether the war ends inside 8 months (late October) or runs past it is now the live question: the Islamabad Memorandum's 60-day clock has already expired, the blockade is described by Hegseth as sustainable 'indefinitely,' and no talks are scheduled. Historical reference: 1991 Gulf War combat phase 43 days; OIF major combat 21 days; this war is already in the Libya-2011 / Korea-negotiation class.
```

Defaults:

```json
{
  "under_6_weeks": 0.01,
  "2_4_months": 0.04,
  "4_8_months": 0.52,
  "over_8_months": 0.43
}
```

- [ ] **Step 2: `ceasefire_mechanism`**

Description:

```text
The primary mechanism through which hostilities are halted, if at all. Observed path: a Pakistan-mediated two-week ceasefire on 7–8 April; a unilateral Trump extension on 21 April; then, on 17 June, a 14-point Islamabad Memorandum signed by Trump and Pezeshkian — the 'turkey_mediated_deal' bin (third-party mediated deal, Pakistan-led) actually happened. Trump declared it 'over' on 8 July after Hormuz ship attacks; Iran suspended MoU commitments on 18 July; the 60-day final-deal window lapsed on 17 August with no extension. The live state is no_ceasefire. The mediated-deal bin retains mass because that path was taken once and could be taken again; us_ultimatum_accepted remains residual given six months of Iranian nuclear refusal.
```

Defaults:

```json
{
  "us_ultimatum_accepted": 0.04,
  "turkey_mediated_deal": 0.18,
  "un_brokered": 0.06,
  "unilateral_ceasefire": 0.12,
  "no_ceasefire": 0.60
}
```

Citation:

```text
Wikipedia 'Islamabad Memorandum' (signed 17 June, over 8 July, window lapsed 17 August); Reuters 8 July 2026; Kpler 19 August 2026
```

- [ ] **Step 3: `hormuz_reopening`**

Description:

```text
The timeline and manner in which the Strait of Hormuz is reopened to commercial shipping after its closure since 4 March. The April 7 ceasefire required reopening; Iran did not. The 17 June MoU required toll-free reopening for 60 days; Iran re-closed the strait on 20 June over Lebanon. A 4 August Iran–Oman dual-lane framework never started mine clearance. On 17 August the MoU window lapsed. On 18 August Ghalibaf said the strait stays shut until the blockade is lifted, frozen assets released, and oil sanctions removed. Trump the same day said the strait is open. Kpler counted 7 crossings on 21 August versus ~130 pre-war. Immediate post-ceasefire reopening is a counterfactual. Prolonged closure is the modal observed trajectory; permanent rerouting (East-West pipeline, Fujairah STS, dark fleet) is the adaptation already underway.
```

Defaults:

```json
{
  "immediate_post_ceasefire": 0.01,
  "phased_reopening": 0.10,
  "prolonged_closure": 0.62,
  "permanent_rerouting": 0.27
}
```

Citation:

```text
Kpler 19 August 2026; Forbes 18 August 2026; Reuters 19–21 August 2026 (7 crossings); Wikipedia '2026 Strait of Hormuz crisis'
```

- [ ] **Step 4: `coercive_success_probability`**

Description:

```text
Pape's central finding: airpower achieves ~100% tactical success but near-zero coercive (political) success against states employing asymmetric strategies. April 2026 already validated the prediction (38 days of air dominance, zero nuclear concessions). August 2026 extends it: a presidential memorandum was signed and then collapsed; a 13-night July campaign did not produce a final deal; the 60-day clock ran out; Ghalibaf's conditions on 18 August are more maximalist than April's, not less. The campaign has also produced Pape's 'counterproductive' outcome in two visible forms — Lavrov's warning that the war pushes Iran toward a bomb, and Iran's conversion of Hormuz from a casualty of war into a negotiated hostage. 'Failed' remains the largest bin; 'counterproductive' continues to gain on it. 'Succeeded' is a residual.
```

Defaults:

```json
{
  "succeeded": 0.01,
  "partial": 0.07,
  "failed": 0.50,
  "counterproductive": 0.42
}
```

Citation:

```text
Pape, Bombing to Win (Cornell, 1996); Wikipedia 'Islamabad Memorandum'; Forbes 18 August 2026; Al Jazeera 'Lavrov: Iran war could push Tehran toward nuclear bomb' April 2026
```

- [ ] **Step 5: `ground_escalation_probability`**

Replace the description's last sentence so the node records the six-month miss on Pape's 75% Stage-3 estimate. Set the full description to:

```text
Pape estimates ~75% probability the US escalates to ground forces when air coercion fails. This is where 'the trap really closes' — an open-ended commitment in a country of 88 million people. Observed as of 23 August 2026: six months of air-coercion failure have not produced Stage 3. Trump threatened in July to 'take Kharg Island' and then told Fox he was unsure 'America has the stomach' to do it. Two congressional war-powers votes (House 3 June, Senate 23 June) and reported interceptor/long-range-missile exhaustion (virtually all PrSM and ATACMS, ~80% of THAAD) are a political and material ceiling. The default therefore falls. The CPT rows that still carry 0.70–0.80 in the counterproductive × 2–4 month cells remain as 'if the administration chooses that path' conditionals; they are no longer the prior.
```

Replace `defaultPTrue` with `0.28`. Do not edit CPT rows.

- [ ] **Step 6: `resolution_type`**

Description (replace the May 22 closing sentences; keep the four-way definition):

```text
The overall characterization of how the conflict resolves. This is the summary node for Phase 7. A decisive US victory requires military success (largely achieved in the air) and political consolidation through favorable terms — the 1991 Gulf War template, which six months have not produced. A negotiated settlement is the path the 17 June Islamabad Memorandum tried and that the 17 August lapse closed; it is still possible, but it is no longer the base case. A frozen conflict is the Korean War/Kashmir template: fighting pulses, no resolution occurs, Hormuz stays a weapon. A wider regional war is the tail in which Economic D-Day, ADNOC-tanker attacks, the UAE cutoff, Houthi Red Sea operations, and the Lebanon war cascade. As of 23 August 2026 frozen_conflict is modal. Wider_regional_war ticks up. Negotiated_settlement ticks down. Decisive_us_victory stays residual.
```

Defaults:

```json
{
  "decisive_us_victory": 0.02,
  "negotiated_settlement": 0.12,
  "frozen_conflict": 0.48,
  "wider_regional_war": 0.38
}
```

Citation:

```text
Wikipedia 'Islamabad Memorandum'; Kpler 19 August 2026; Reuters 19 August 2026; Forbes 18 August 2026; Crisis Group trigger list 18–20 August 2026
```

- [ ] **Step 7: Validate sums**

Run:

```bash
node -e "
const n=require('./src/data/nodes/phase-7-resolution.json');
for (const id of ['actual_conflict_duration','ceasefire_mechanism','hormuz_reopening','coercive_success_probability','resolution_type']) {
  const x=n.find(y=>y.id===id);
  const s=Object.values(x.defaultProbabilities).reduce((a,b)=>a+b,0);
  console.log(id, s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
}
const g=n.find(y=>y.id==='ground_escalation_probability');
console.log('ground defaultPTrue', g.defaultPTrue, g.defaultPTrue===0.28?'OK':'BAD');
"
```

Expected: five `OK` probability lines and `ground defaultPTrue 0.28 OK`.

- [ ] **Step 8: Commit**

```bash
git add src/data/nodes/phase-7-resolution.json
git commit -m "data: recalibrate Phase 7 duration, MoU-dead, and Pape defaults"
```

---

### Task 8: Rewrite mixed-phase editorial (phases 3–8)

**Files:**
- Modify: `src/lib/phase-content.ts` — the six `PhaseContent` objects with `phase: 3` through `phase: 8`

**Interfaces:**
- Consumes: `PhaseContent` `{ phase, title, subtitle, paragraphs, sources }`
- Produces: phase 3 paragraph 0 contains `August 23, 2026`; no phase ≥ 3 paragraph matches `/As of (April 24|May 22), 2026/`

Replace only the `title`, `subtitle`, `paragraphs`, and `sources` fields on phases 3–8. Do not touch phases 1–2. Do not change the `getPhaseContent` helper.

- [ ] **Step 1: Phase 3**

```typescript
{
  phase: 3,
  title: 'Active Conflict (Current)',
  subtitle: 'A 60-day memorandum, a 13-night campaign, and a war that would not end',
  paragraphs: [
    'As of August 23, 2026, the war is in its sixth month and the air campaign is no longer a single arc. A 14-point Islamabad Memorandum signed by Trump and President Pezeshkian on June 17 paused strikes, lifted the US blockade of Iranian ports, and was supposed to reopen Hormuz toll-free while the parties spent 60 days on a final deal. The nuclear file was deferred. Mojtaba Khamenei endorsed the text with misgivings. Twenty-one days later, after Iranian attacks on commercial ships asserting sovereignty over the strait, Trump declared the memorandum "over." CENTCOM reimposed the blockade on July 15. The 60-day clock ran out on August 17 with no extension and no talks scheduled.',
    'The kinetic interval between those diplomatic facts was the largest US strike series since April. CBS reported at least 170 targets on July 8–9, about seventeen times the June 26 salvo. Thirteen consecutive nights of strikes followed, then a pause, then an Iranian ballistic-missile attack on US forces in Jordan on July 28 that restarted the bombing. Iranian retaliation in this period hit US-linked facilities in Bahrain, Kuwait, and Jordan. What the campaign is running out of is interceptors and long-range missiles: by early August reporting held that the United States had expended virtually all of its PrSM and ATACMS stocks, roughly 80 percent of THAAD interceptors, and about half its global Tomahawks. Trump and Hegseth clashed at Camp David on August 6 over those shortages. A ground invasion has not been attempted. Kharg Island was threatened in July and not taken.',
    'Robert Pape\'s coercion framework has now been tested against a signed presidential deal, not just against an ultimatum. Airpower remains tactically dominant and politically barren. The memorandum did not produce a nuclear concession; the July campaign did not produce one either. The substitution for Pape\'s Stage 3 — ground forces — has been a naval blockade plus the August 20 threat of secondary sanctions on any country trading with Iran. That is still Stage 2. It is a more expensive Stage 2 than March, and it has not closed the trap so much as relocated it to the strait and the oil market.',
  ],
  sources: [
    'Wikipedia: Islamabad Memorandum (signed 17 June, declared over 8 July, window lapsed 17 August 2026)',
    'CBS News: US strike packages of ≥170 targets, 8–10 July 2026',
    'NPR: 13 nights of strikes / Jordan attack, 24–30 July 2026',
    'The Hill / Washington Post: US munitions exhaustion, 4–6 August 2026',
    'CENTCOM: blockade reimposed 15 July 2026',
  ],
},
```

- [ ] **Step 2: Phase 4**

```typescript
{
  phase: 4,
  title: 'Economic Shockwaves',
  subtitle: 'Brent near $92, Hormuz at a handful of ships a day, and a missed H2 reopen',
  paragraphs: [
    'As of August 23, 2026, the oil market has learned to live with a half-closed strait and has not learned to reopen it. Brent peaked in the $118–$139 range in March, fell to $71.57 on July 1 when the memorandum briefly de-risked the complex, printed $100.69 on July 23 during the strike campaign, and settled at $91.62 on August 19 (WTI $85.83). That is not the $150–$200 Goldman tail from April. It is also not a return to pre-war prices. Reuters, citing Kpler, puts Hormuz crude-and-products flows at 4.8 million barrels a day in July and about 2 million so far in August, against roughly 18 million before the war. Iranian crude exports are 294,000 barrels a day this month, against 1.7 million in 2025. Iranian inflation exceeded 80 percent year-on-year in July.',
    'The April Dallas Fed / Baker Hughes consensus that the strait would not fully reopen until the second half of 2026 is now a miss. August is the second half, and Kpler counted seven crossings on August 21 against a pre-war norm near 130. The June 17 memorandum was supposed to reopen the waterway toll-free for 60 days; Iran shut it again on June 20, citing Israeli operations in Lebanon. A dual-lane Iran–Oman framework approved on August 4 — zero tolls, mine clearance of the main lane within 30 days — never started the mine work. Ghalibaf told Iranian lawmakers on August 18 that the strait stays shut until the blockade is lifted, frozen assets released, and oil sanctions removed. Trump the same day said the strait was open and the mines were gone. Both statements cannot be operationally true. The AIS is the tie-breaker: single digits.',
    'Substitution is the reason prices are $92 rather than $150. Saudi barrels move on the East-West pipeline to the Red Sea. The UAE has used Fujairah ship-to-ship transfers, and its August crude exports actually sat slightly above 2025. Those workarounds are now the target set. ADNOC-affiliated tankers were hit repeatedly in mid-August; the UAE named the IRGC and called it piracy. Houthis have opened a second squeeze in the Bab al-Mandeb, including the fatal attack on the Tihamah on August 11. Trump\'s August 20 "Economic D-Day" — secondary sanctions on any country trading with Iran — is an attempt to close the remaining Chinese offtake. The IEA\'s August report revised the third-quarter deficit to 1.8 million barrels a day, more than double the prior estimate. The market is no longer waiting for Hormuz. It is pricing a prolonged crisis.',
  ],
  sources: [
    'Reuters: Brent $91.62 settle, 19 August 2026; prolonged-crisis analysis, 18 August 2026',
    'Kpler: 60 days of a broken US-Iran MoU, 19 August 2026 (7 crossings on 21 August; 4.8 / ~2 mb/d vs 18 mb/d)',
    'Forbes: Ghalibaf Hormuz conditions, 18 August 2026',
    'IEA Oil Market Report, August 2026 (Q3 deficit 1.8 mb/d)',
    'Dallas Fed Energy survey, April 2026 (H2 reopen call, now missed)',
  ],
},
```

- [ ] **Step 3: Phase 5**

```typescript
{
  phase: 5,
  title: 'Geopolitical Reactions',
  subtitle: 'Congress votes to halt, the UAE severs Iran, and secondary sanctions become the war',
  paragraphs: [
    'As of August 23, 2026, the diplomatic fact that matters is not that talks failed. It is that a deal was signed and then discarded. The Islamabad Memorandum of June 17 was a 14-point framework brokered by Pakistan with Qatar, Saudi Arabia, Turkey, and Egypt in the room. It ended the first US blockade, waived oil sanctions for 60 days, and deferred the nuclear file. Trump signed at Versailles after the G7; Pezeshkian signed in Tehran; Mojtaba Khamenei endorsed on paper. Israel, which was not a party, kept striking Lebanon. Iran re-closed Hormuz on June 20. Trump called the memorandum "over" on July 8. The final-deal clock expired on August 17. Ghalibaf\'s conditions the next day were more maximalist than April\'s, not less.',
    'The US Congress has now voted, in both chambers, to halt the war or require authorization to continue — the House 215–208 on June 3, the Senate 50–48 on June 23. That is not a veto-proof off-ramp, and operations continued, but it is a domestic constraint that did not exist in March. NATO on August 19 said it is "prepared to defend all allies" against Iran, language aimed at Iranian strikes on Turkey and Jordan, not at joining the campaign against Iran. The munitions the United States has burned — PrSM, ATACMS, THAAD, Tomahawk, Reaper — are a transfer of deterrence from the Taiwan Strait to the Gulf that Indo-Pacific planners will not unread.',
    'The regional alignment is moving in two directions at once. On August 18 the UAE suspended all trade, exchange, and financial transactions with Iran after reporting two missiles, one in its territorial waters, and after a week of attacks on ADNOC-linked tankers it named as IRGC piracy. That is the closest a Gulf state has come to formally breaking with Tehran during this war. The same week Trump threatened to sanction any country that still trades with Iran, and Iran\'s new security chief, Mohsen Rezaei, threatened to halt all oil through Hormuz if neighbors joined the crackdown. GCC capitals want the strait open. They do not want to be drafted into a secondary-sanctions war. Hedging is still the equilibrium. The UAE cutoff is the shock to it.',
  ],
  sources: [
    'Wikipedia: Islamabad Memorandum; 2026 Iran war (House 3 June, Senate 23 June, UAE cutoff 18 August)',
    'Reuters: Senate war-powers vote, 23 June 2026; oil / UAE, 19 August 2026',
    'Forbes: Ghalibaf statement, 18 August 2026',
    'Times of Israel: Economic D-Day, 22 August 2026',
    'NATO statement, 19 August 2026',
  ],
},
```

- [ ] **Step 4: Phase 6**

```typescript
{
  phase: 6,
  title: 'Humanitarian Impact',
  subtitle: 'Lebanon past 4,300 dead, Iran\'s toll in the thousands, a million people displaced',
  paragraphs: [
    'As of August 23, 2026, the Lebanese Health Ministry has recorded 4,324 killed and 12,221 injured in Israel\'s war with Hezbollah, with more than a million people displaced — roughly a fifth of the country. Operation Eternal Darkness on April 8, launched hours after the first US–Iran ceasefire, was the single worst day (357 killed). It was not the last. A June 19 Israel–Hezbollah ceasefire announced by Trump did not hold in the south. The humanitarian collapse in Lebanon, compounding years of economic failure, is no longer a side theater. It is one of the reasons Iran re-closed Hormuz on June 20, and one of the reasons Ghalibaf still lists "an end to the war against Iran\'s allies in Lebanon" among the conditions for reopening the strait.',
    'Iranian death figures have not converged. HRANA has documented 3,684 war deaths; Iran\'s Health Ministry 3,528; OCHA 3,400; the IDF 6,000. HRANA\'s April 7 split — 1,701 civilians, 1,221 military, 714 unclassified — is the last detailed civilian/military cut, and it undercounts military dead by construction. Treat the civilian toll as a range inside or just above two to five thousand, not as a point. The Minab girls\' school strike (170+ schoolgirls, a building that had previously been an IRGC facility) remains the most politically costly single incident. Seafarers are a new casualty class: at least 14 civilian mariners confirmed dead in Hormuz-area incidents since the April 8 ceasefire, plus one missing from the Minoan Pioneer on August 3, counted separately from six dead aboard the Tihamah in the Bab al-Mandeb on August 11.',
    'US fatalities, as of 21 July, stand at 19 service members and one civilian contractor killed, with 624 service members wounded. That is not a Kosovo air-campaign bill. It is also not a ground war. Pape\'s nationalist-backlash finding still holds inside Iran: no mass anti-war protest movement has materialized under bombardment, the IRGC has threatened crackdown, and the government that signed a presidential memorandum in June is the same government that let it lapse in August. Rally-around-the-flag is not a metaphor here. It is the observed domestic politics of a state that has been at war for six months and has not split.',
  ],
  sources: [
    'Wikipedia: Casualties of the 2026 Iran war (Lebanon 4,324 / 12,221; Iran range 3,400–6,000; US 19 KIA / 624 wounded as of 21 July)',
    'Lebanese Ministry of Public Health',
    'HRANA documented war deaths',
    'GlobalSecurity Day 170 (seafarer toll; Tihamah, 11 August 2026)',
  ],
},
```

- [ ] **Step 5: Phase 7**

```typescript
{
  phase: 7,
  title: 'Resolution Paths',
  subtitle: 'The 60-day window lapsed. No talks. No extension. No deal.',
  paragraphs: [
    'As of August 23, 2026, the resolution path that was supposed to close the war has already been taken and has already failed. The Islamabad Memorandum of June 17 was a Pakistan-brokered, presidentially signed, 14-point framework: halt strikes, reopen Hormuz toll-free, lift the US blockade, waive oil sanctions for 60 days, talk about a $300 billion reconstruction fund, and leave the nuclear file, the missiles, and the proxies to a final deal. Trump declared it "over" on July 8. Iran suspended its commitments on July 18. The clock ran out on August 17. Asked about an extension, Trump said "No." Araghchi said Tehran "never had a ceasefire that would now need to be extended." That is coercive failure with a paper trail.',
    'The four paths have been reweighted by that paper trail. Frozen conflict is the modal path: the blockade is described by Hegseth as sustainable "indefinitely," Hormuz crossings print in the single digits, talks are not scheduled, and both capitals prefer a managed standoff to a concession. Wider regional war has gained mass — ADNOC tankers hit, the UAE financially severed from Iran, Houthis killing seafarers in the Red Sea, Economic D-Day aimed at China, Rezaei threatening a total Hormuz halt if neighbors join the squeeze. A second mediated settlement is still possible; it would have to succeed where a signed presidential memorandum failed, on worse trust and a more explicit Iranian price list. Ground operations remain the least likely path that is still on the board. Pape\'s ~75 percent Stage-3 estimate has missed for six months. Munitions shortages and two congressional war-powers votes are why.',
    'The structural gap on the nuclear file did not move. The memorandum deferred it. Vance claimed in late June that Switzerland talks had put IAEA inspections back on the table; Iran did not confirm. Ghalibaf\'s August 18 conditions do not include a 20-year enrichment ban. They include lifting the blockade, releasing frozen assets, and removing oil sanctions — the inverse of an ultimatum accepted. Iran still had, as of the winter strikes, on the order of 440 kilograms of highly enriched uranium. Six months of bombing, a blockade, a deal, a discarded deal, and a sanctions threat have not produced a verified accounting of that stock, let alone its surrender.',
  ],
  sources: [
    'Wikipedia: Islamabad Memorandum',
    'Kpler: 60 days of a broken US-Iran MoU, 19 August 2026',
    'Forbes: Ghalibaf conditions, 18 August 2026',
    'CBS / CENTCOM: blockade reimposed 15 July 2026; Hegseth "indefinitely," 13 August 2026',
    'Pape, Bombing to Win (Cornell, 1996)',
  ],
},
```

- [ ] **Step 6: Phase 8**

```typescript
{
  phase: 8,
  title: 'Long-Term Aftermath',
  subtitle: 'Six months in, the regime stands, the bomb is not surrendered, and the strait is a weapon',
  paragraphs: [
    'As of August 23, 2026, one five-year question already has a six-month answer. Iran will not give up its nuclear program under this amount of military pressure. A surprise decapitation strike, 11,000-plus designated targets, a naval blockade, a presidential memorandum, a 13-night July campaign, and a threatened secondary-sanctions regime have produced a refusal, not a surrender. Lavrov said in the spring that the war would push Tehran toward a bomb. Other capitals in Riyadh, Ankara, and Seoul do not need him to finish the sentence. The nonproliferation lesson of this war is being written while the war is still on.',
    'The regional order is more fragmented than it was on February 27. Lebanon is past 4,300 dead and a million displaced. The UAE has cut its financial ties to Iran. Hormuz, which carried a fifth of the world\'s oil, has been converted from a chokepoint into a negotiating hostage that neither Washington nor Tehran will release except on terms the other will not accept. Trump has said he may "keep" the strait. Rezaei has said it "has been Iranian, is Iranian, and will remain Iranian." The United States has burned through precision munitions that were supposed to be a Taiwan reserve. China, still the residual offtaker of Iranian crude, is the target of Economic D-Day. That is not a restored American Middle East. It is a more expensive, more explicitly militarized, less trusted one.',
    'Iran has been devastated and will take decades to recover. The regime has not fallen. The man who signed the memorandum in Tehran is still president. The man who restated Hormuz conditions in August is still speaker. The son of the killed Supreme Leader is still Supreme Leader. No wartime protest movement has displaced them. Trump can declare victory and leave whenever the domestic cost exceeds the value of the remaining coercive theory. He has not, yet, been able to convert tactical destruction into the political end-state the February 28 campaign was sold as delivering: a denuclearized Iran, an open strait, and a weaker regional order for Tehran. As of this snapshot, none of the three has arrived.',
  ],
  sources: [
    'Wikipedia: Islamabad Memorandum; Casualties of the 2026 Iran war',
    'Kpler / Reuters: Hormuz flows and Iranian exports, 18–19 August 2026',
    'Times of Israel: Economic D-Day, 22 August 2026',
    'The Hill: US munitions exhaustion, 4 August 2026',
    'Carnegie / RAND: proliferation and Indo-Pacific posture costs (spring–summer 2026)',
  ],
},
```

- [ ] **Step 7: Run the snapshot tests**

Run: `npx vitest run src/__tests__/lib/timeline.regression-001.test.ts -v`

Expected: ALL tests in that file PASS, including the two `phase-content` assertions.

- [ ] **Step 8: Commit**

```bash
git add src/lib/phase-content.ts
git commit -m "content: rewrite phases 3–8 editorial for 23 August 2026 snapshot"
```

---

### Task 9: Rewrite anachronistic scenario cards (keep IDs)

**Files:**
- Modify: `src/data/scenarios/phase-3-scenarios.json` — cards `conflict-winds-down-april` and `sustained-campaign-through-summer`
- Modify: `src/data/scenarios/phase-4-scenarios.json` — card `april-6-deadline-forces-hormuz-open`
- Modify: `src/data/scenarios/phase-7-scenarios.json` — cards `april-deal-quick-resolution` and `negotiated-settlement-by-summer`

**Interfaces:**
- Consumes: existing `ScenarioCard` shape `{ id, phase, title, description, overrides[] }` and existing override node IDs
- Produces: same IDs; titles and descriptions that branch from 23 August 2026; override keys unchanged; categorical override maps still sum to 1.00

Do not change card IDs. Do not add or remove override `nodeId`s. Only retitle, rewrite `description`, and replace the probability / distribution objects listed below.

- [ ] **Step 1: Phase 3 card `conflict-winds-down-april`**

Set `"title"` to `"Air Campaign Stays Paused"`.

Set `"description"` to:

```text
From the 23 August 2026 snapshot: Hegseth says the blockade can run indefinitely, but the 13-night July campaign and the Camp David munitions row have taken a full-scale air restart off the immediate table. Both capitals keep the Oman/Pakistan messenger channel open. Direct strikes on Iran stay at a low simmer — interception, occasional coastal radar hits, no 170-target nights. Houthis are leaned on by Riyadh to stop killing seafarers. Hezbollah and Israel remain in their own war, which this card does not settle. The conflict is already six months old, so 'winding down' no longer means a sub-three-month war; it means the remaining duration is a frozen blockade plus sporadic fire, not a new campaign. Hormuz stays the prize and does not reopen on this path either, but the kinetic temperature falls.
```

Replace the `conflict_duration_projection` override with:

```json
{ "weeks": 0.01, "1_3_months": 0.04, "3_6_months": 0.25, "prolonged_over_6_months": 0.70 }
```

Replace the `ceasefire_window` override with:

```json
{ "none": 0.15, "narrow": 0.40, "moderate": 0.35, "strong": 0.10 }
```

Replace the `us_air_campaign_scale` override with:

```json
{ "paused": 0.42, "limited": 0.40, "sustained": 0.16, "escalating": 0.02 }
```

Leave the remaining overrides on this card (`overall_military_balance`, `us_military_casualties`, `nuclear_escalation_risk`, `hezbollah_attack_intensity`, `energy_infrastructure_targeting`, `drone_cost_asymmetry`) unchanged.

- [ ] **Step 2: Phase 3 card `sustained-campaign-through-summer`**

Set `"title"` to `"Strike Campaign Resumes"`.

Set `"description"` to:

```text
From the 23 August 2026 snapshot: Economic D-Day does not reopen Hormuz, Rezaei carries out a wider anti-ship campaign, and Trump authorizes another multi-night strike package on the scale of 8–24 July — coastal missile and drone storage, radar, IRGC Navy, selected energy nodes. Interceptor stocks are already thin, so the campaign is real but shorter-ranged than the administration's rhetoric. Iran answers against US-linked facilities in the Gulf and Jordan. This is the path back toward Pape Stage 2 intensification without Stage 3. Duration lengthens. The ceasefire window narrows toward none. Ground invasion is still not selected.
```

Replace the `conflict_duration_projection` override with:

```json
{ "weeks": 0.01, "1_3_months": 0.03, "3_6_months": 0.16, "prolonged_over_6_months": 0.80 }
```

Replace the `ceasefire_window` override with:

```json
{ "none": 0.55, "narrow": 0.32, "moderate": 0.11, "strong": 0.02 }
```

Replace the `us_air_campaign_scale` override with:

```json
{ "paused": 0.02, "limited": 0.08, "sustained": 0.45, "escalating": 0.45 }
```

Leave the remaining overrides on this card (`iranian_military_casualties`, `us_military_casualties`, `nuclear_escalation_risk`, `iranian_air_defense_status`, `energy_infrastructure_targeting`, `drone_cost_asymmetry`) unchanged.

- [ ] **Step 3: Phase 4 card `april-6-deadline-forces-hormuz-open`**

Set `"title"` to `"Omani Dual-Lane Deal Holds"`.

Set `"description"` to:

```text
From the 23 August 2026 snapshot: the 4 August Iran–Oman dual-lane framework, which never started in observed history, is implemented. Mine clearance of the main lane begins within 30 days, zero tolls are charged for a defined window, and the UN/Omani southern route is used in both directions. Iran keeps a claim of administration; the US keeps the blockade of Iranian ports but stops shooting at hulls on the cleared lane. Traffic recovers from single digits toward a third of pre-war volume over a quarter, not overnight. Brent retreats from the $90s toward $80–88 as the Hormuz premium bleeds out. This is not the April 6 ultimatum working. It is a technical shipping deal that leaves the nuclear file untouched — the only reopen path that does not require Ghalibaf's political conditions or Trump's 'total surrender.'
```

Replace the `hormuz_reopening_timeline` override with:

```json
{ "within_weeks": 0.18, "1_3_months": 0.52, "3_6_months": 0.24, "indefinite": 0.06 }
```

Replace the `oil_price_trajectory_6mo` overrideDistribution with:

```json
{ "type": "normal", "params": [84, 10] }
```

Leave other overrides on this card unchanged.

- [ ] **Step 4: Phase 7 card `april-deal-quick-resolution`**

Set `"title"` to `"Second MoU: Final Deal"`.

Set `"description"` to:

```text
From the 23 August 2026 snapshot: Pakistan and Qatar put a second memorandum in front of both presidents within weeks. Lessons of June are written in: Hormuz reopen is sequenced and monitored, Israel-Lebanon is either carved out explicitly or included with a verification mechanism, and the nuclear paragraph is no longer deferred — Iran accepts dilution of the highly enriched stock and IAEA access short of a 20-year enrichment ban; the US lifts the blockade and the oil-sanctions waiver becomes a wind-down rather than a 60-day tease. Trump frames it as the deal the first MoU was supposed to be. Iranian hardliners call it a pause. Because the war is already six months old, this is not a sub-six-week resolution. It is a 4–8 month war that ends in a settlement rather than a freeze. Durability is the risk: a second duress deal, still without a treaty, can be abandoned by the next administration the way the JCPOA was.
```

Replace these overrides (keep every other override on the card):

`actual_conflict_duration`:

```json
{ "under_6_weeks": 0.01, "2_4_months": 0.04, "4_8_months": 0.72, "over_8_months": 0.23 }
```

`ceasefire_mechanism`:

```json
{ "us_ultimatum_accepted": 0.10, "turkey_mediated_deal": 0.62, "un_brokered": 0.12, "unilateral_ceasefire": 0.10, "no_ceasefire": 0.06 }
```

`hormuz_reopening`:

```json
{ "immediate_post_ceasefire": 0.12, "phased_reopening": 0.58, "prolonged_closure": 0.22, "permanent_rerouting": 0.08 }
```

`resolution_type`:

```json
{ "decisive_us_victory": 0.08, "negotiated_settlement": 0.62, "frozen_conflict": 0.24, "wider_regional_war": 0.06 }
```

- [ ] **Step 5: Phase 7 card `negotiated-settlement-by-summer`**

Set `"title"` to `"Mediated Settlement by Year-End"`.

Set `"description"` to:

```text
From the 23 August 2026 snapshot: there is no second presidential signing this month. A grinding autumn of blockade, sporadic strikes, and Economic D-Day costs produces a late-year package mediated by China and Pakistan, not a summer package mediated by Turkey. Iran trades a monitored Hormuz reopen and a dilution schedule for sanctions relief and a written end to the blockade. The US does not get a 20-year enrichment ban. Israel is not a signatory; Lebanon is handled on a parallel track that may or may not hold. This is the slower cousin of 'Second MoU: Final Deal' — more destruction, more seafarer dead, a war that has crossed eight months — and slightly more international buy-in, which is the only reason it might last longer than June's memorandum did.
```

Replace these overrides (keep every other override on the card):

`actual_conflict_duration`:

```json
{ "under_6_weeks": 0.01, "2_4_months": 0.03, "4_8_months": 0.32, "over_8_months": 0.64 }
```

`ceasefire_mechanism`:

```json
{ "us_ultimatum_accepted": 0.06, "turkey_mediated_deal": 0.40, "un_brokered": 0.22, "unilateral_ceasefire": 0.18, "no_ceasefire": 0.14 }
```

`hormuz_reopening`:

```json
{ "immediate_post_ceasefire": 0.04, "phased_reopening": 0.42, "prolonged_closure": 0.38, "permanent_rerouting": 0.16 }
```

`resolution_type`:

```json
{ "decisive_us_victory": 0.04, "negotiated_settlement": 0.48, "frozen_conflict": 0.36, "wider_regional_war": 0.12 }
```

- [ ] **Step 6: Validate override sums and IDs**

Run:

```bash
node -e "
function sum(o){return Object.values(o).reduce((a,b)=>a+b,0)}
function check(file, id, keys){
  const cards=require(file);
  const c=cards.find(x=>x.id===id);
  if(!c) throw new Error('missing '+id);
  console.log(id, 'title=', c.title);
  for (const k of keys){
    const ov=c.overrides.find(x=>x.nodeId===k);
    const s=sum(ov.overrideProbabilities);
    console.log(' ', k, s.toFixed(4), Math.abs(s-1)<0.011?'OK':'BAD');
  }
}
check('./src/data/scenarios/phase-3-scenarios.json','conflict-winds-down-april',['conflict_duration_projection','ceasefire_window','us_air_campaign_scale']);
check('./src/data/scenarios/phase-3-scenarios.json','sustained-campaign-through-summer',['conflict_duration_projection','ceasefire_window','us_air_campaign_scale']);
check('./src/data/scenarios/phase-4-scenarios.json','april-6-deadline-forces-hormuz-open',['hormuz_reopening_timeline']);
check('./src/data/scenarios/phase-7-scenarios.json','april-deal-quick-resolution',['actual_conflict_duration','ceasefire_mechanism','hormuz_reopening','resolution_type']);
check('./src/data/scenarios/phase-7-scenarios.json','negotiated-settlement-by-summer',['actual_conflict_duration','ceasefire_mechanism','hormuz_reopening','resolution_type']);
"
```

Expected: every printed sum `OK`. Then:

Run: `npx vitest run src/__tests__/engine/data-integrity.test.ts -v`

Expected: PASS (scenario IDs still unique, override nodeIds still exist, categorical sums still 1.00).

- [ ] **Step 7: Commit**

```bash
git add src/data/scenarios/phase-3-scenarios.json src/data/scenarios/phase-4-scenarios.json src/data/scenarios/phase-7-scenarios.json
git commit -m "data: rebase mixed-phase scenario cards onto August 23 observed conditions"
```

---

### Task 10: Methodology, README, sources

**Files:**
- Modify: `src/app/methodology/page.tsx`
- Modify: `README.md`
- Modify: `src/data/sources.json`

**Interfaces:**
- Consumes: snapshot date `2026-08-23`; phase status already described by `describePhaseStatus`
- Produces: methodology Pape-validation and snapshot-limitation sentences dated 23 August; README phase table matching the spec; four new source entries

- [ ] **Step 1: Methodology — Pape validation paragraph**

In `src/app/methodology/page.tsx`, replace the paragraph that begins with `Observed validation (May 2026)` with:

```tsx
              <strong className="text-text-primary">Observed validation (August 2026).</strong> As of
              August 23, 2026, six months of war have extended Pape&apos;s predicted pattern rather
              than broken it. Near-total tactical dominance still has not produced a nuclear
              concession. A 14-point presidential memorandum was signed on June 17 and declared
              &ldquo;over&rdquo; on July 8; its 60-day final-deal clock lapsed on August 17 with no
              extension. A 13-night July air campaign did not reopen the strait or move the
              enrichment file. Iran has converted Hormuz from a casualty of war into a negotiated
              hostage — Pape&apos;s &ldquo;counterproductive&rdquo; bin in operational form, on top
              of Lavrov&apos;s spring warning that the campaign pushes Tehran toward a bomb. Stage 3
              has not arrived. The United States substituted a reimposed naval blockade and
              August 20 &ldquo;Economic D-Day&rdquo; secondary sanctions for ground forces, against
              a ceiling of interceptor shortages and two congressional war-powers votes. The
              nationalist backlash coefficient still holds: no mass anti-war protest movement has
              displaced the government that signed the memorandum and then let it lapse.
```

- [ ] **Step 2: Methodology — snapshot limitation bullet**

Replace the list item that currently says `May 22, 2026` with:

```tsx
              <strong className="text-text-primary">Snapshot-in-time model</strong> — parameters
              reflect conditions as of our last manual update (August 23, 2026). The simulation is updated
              manually as significant developments unfold in the ongoing conflict, ensuring readers see a structured timeline rather than stale information.
```

Leave the following list item (Phases 1–2 locked, 3–7 mixed, 8 projected) unchanged.

- [ ] **Step 3: README phase table**

Replace the eight-row phase table in `README.md` with:

```markdown
| Phase | Status | Description |
|-------|--------|-------------|
| 1. The Strike (Feb 28) | Observed | US/Israel surprise campaign: 900 strikes, Khamenei killed, nuclear program destroyed |
| 2. Retaliation (Feb 28 – Mar 10) | Observed | Iran's 500+ missile/2000 drone response, Hormuz closure, Hezbollah activation |
| 3. Active Conflict (Current) | Mixed | Six-month war; Islamabad MoU signed June 17 and declared over July 8; 13-night July campaign; blockade reimposed July 15 |
| 4. Economic Shockwaves | Mixed | Brent ~$92; Hormuz 7–13 crossings/day vs ~130 pre-war; April H2-reopen call missed; Economic D-Day announced August 20 |
| 5. Geopolitical Reactions | Mixed | House and Senate war-powers votes; UAE severs financial ties with Iran August 18; no talks scheduled |
| 6. Humanitarian Impact | Mixed | Iran deaths 3,400–6,000 depending on source; Lebanon 4,324 killed, 1M+ displaced; US 19 KIA / 624 wounded |
| 7. Resolution Paths | Mixed | 60-day MoU window lapsed August 17; Ghalibaf keeps Hormuz shut pending blockade/sanctions/assets; frozen conflict is modal |
| 8. Long-Term Aftermath | Projected | Nuclear refusal hardened; regime survival observed so far; Hormuz converted into a negotiated hostage |
```

Also replace the Features bullet that still implies a fresher cadence only if it names a date; the current Features section has no date — leave it.

- [ ] **Step 4: Append four sources to `src/data/sources.json`**

Inside the `sources` array, before the closing `]`, add a comma after the last entry and append:

```json
    {
      "id": "islamabad-memorandum",
      "title": "Islamabad Memorandum of Understanding between the United States of America and the Islamic Republic of Iran",
      "publisher": "Wikipedia / Wikisource",
      "url": "https://en.wikipedia.org/wiki/Islamabad_Memorandum",
      "type": "geopolitical",
      "usedFor": ["17 June 2026 MoU terms", "60-day window", "blockade lift and collapse"]
    },
    {
      "id": "kpler-hormuz-mou-2026-08",
      "title": "60 days of a broken US-Iran MoU: the market stopped waiting for Hormuz",
      "publisher": "Kpler",
      "url": "https://www.kpler.com/blog/60-days-of-a-broken-us-iran-mou-the-market-stopped-waiting-for-hormuz",
      "type": "economic",
      "usedFor": ["Hormuz flows July–August 2026", "MoU lapse 17 August", "crossing counts"]
    },
    {
      "id": "reuters-oil-2026-08",
      "title": "Oil market starts pricing in a prolonged Hormuz crisis",
      "publisher": "Reuters",
      "url": "https://www.reuters.com/commentary/reuters-open-interest/oil-market-starts-pricing-prolonged-hormuz-crisis-2026-08-18/",
      "type": "economic",
      "usedFor": ["Brent path", "Iranian export collapse", "August oil prices"]
    },
    {
      "id": "wikipedia-casualties-2026",
      "title": "Casualties of the 2026 Iran war",
      "publisher": "Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Casualties_of_the_2026_Iran_war",
      "type": "osint",
      "usedFor": ["Iran death-toll range", "Lebanon Health Ministry figures", "US KIA/wounded as of 21 July"]
    }
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/engine/data-integrity.test.ts src/__tests__/lib/timeline.regression-001.test.ts -v`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/methodology/page.tsx README.md src/data/sources.json
git commit -m "docs: point methodology, README, and sources at the 23 August snapshot"
```

---

### Task 11: Version, changelog, full verification

**Files:**
- Modify: `VERSION`
- Modify: `package.json` (`version` field only)
- Modify: `CHANGELOG.md`
- Modify: `CONTRIBUTING.md` (test-count sentence only)

**Interfaces:**
- Consumes: all prior tasks
- Produces: version `1.0.5.0`; changelog entry in the `1.0.3.0` style; green full test suite and production build

- [ ] **Step 1: Bump version**

Set `VERSION` to:

```text
1.0.5.0
```

In `package.json` set `"version": "1.0.5.0"`.

- [ ] **Step 2: Changelog entry**

Insert this block at the top of `CHANGELOG.md`, immediately under the intro sentence and above `## [1.0.4.0]`:

```markdown
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

### For contributors
- Test count: 128 → 136 (8 new assertions in the snapshot-drift suite)
```

After running the full suite in Step 4, if the actual test count is not 136, edit that one line to match `npx vitest run` output before committing. Do not guess.

- [ ] **Step 3: CONTRIBUTING test count**

In `CONTRIBUTING.md` replace the `npm test       # 128 tests` line with the count Vitest actually prints after Step 4. Example, if Vitest prints 136:

```text
npm test       # 136 tests
```

- [ ] **Step 4: Run the full suite and the production build**

Run: `npx vitest run`

Expected: all tests PASS. Note the test count for Step 2 / Step 3.

Run: `npx tsc --noEmit`

Expected: no errors.

Run: `npx next build`

Expected: production build succeeds, including `/`, `/simulation`, `/methodology`.

- [ ] **Step 5: Commit**

```bash
git add VERSION package.json CHANGELOG.md CONTRIBUTING.md
git commit -m "chore: release 1.0.5.0 August 23 snapshot"
```

Do not push unless asked.

---

## Self-review

**1. Spec coverage**

| Spec requirement | Task |
|---|---|
| Snapshot dates 2026-08-23 | Task 2, Task 1 tests |
| 14 curated events, sorted | Task 2 |
| Phase status / currentPhase unchanged | Task 2 (explicit leave-alone) |
| Phase 3 duration, casualties, ceasefire window, trap stage | Task 3 |
| Phase 4 oil, Hormuz, production loss, Iranian economy | Task 4 |
| Phase 5 diplomacy, GCC, alliance | Task 5 |
| Phase 6 civilian toll range | Task 6 |
| Phase 7 duration, mechanism, Hormuz, Pape, ground PTrue, resolution | Task 7 |
| Editorial phases 3–8, no stale "As of April 24/May 22" | Task 8 + Task 1 tests |
| Scenario IDs frozen, April/summer cards rewritten | Task 9 |
| Methodology + README + sources | Task 10 |
| Version 1.0.5.0, changelog, tests, build | Task 11 |
| No engine/UI/new nodes/Phase 1–2 rewrite | Global constraints; no tasks touch those files |
| Ground escalation falls, not rises | Task 7 Step 5 |
| oil min ≤ 65 | Task 4 Step 1 |
| Falsified duration bins keep 0.01 residual | Task 3 Step 1, Task 7 Step 1 |

**2. Placeholder scan:** no TBD / TODO / "add validation" / "similar to Task N" remaining in task bodies. Scenario-card steps that say "leave other overrides unchanged" name the card and list every override that *does* change.

**3. Type consistency:** `PhaseStatus` values stay `'observed' \| 'mixed' \| 'projected'`. Category keys on every recalibrated node match the keys already in the JSON (`prolonged_over_6_months`, `turkey_mediated_deal`, `closed_selective_passage`, `counterproductive`, etc.). Scenario IDs are the existing strings. Continuous oil nodes keep `{ type: "normal", params: [mean, sd] }`.
