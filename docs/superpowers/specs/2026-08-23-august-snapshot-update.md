# August 2026 Snapshot Update — Design Spec

**As of:** 2026-08-23
**Status:** Approved
**Implements:** snapshot-in-time data model from `docs/superpowers/specs/2026-03-29-usa-iran-monte-carlo-design.md` §2 and §6
**Prior snapshot:** `src/data/timeline.json` lastUpdated `2026-05-22` (editorial in `src/lib/phase-content.ts` still leads several mixed phases as of April 24)

---

## 1. Purpose

Bring the simulation's observed facts, editorial copy, Bayesian defaults, and mixed-phase scenario cards current with the conflict as of 23 August 2026. No engine, UI, or graph-structure changes. No new nodes.

The last complete data cycle stopped at 22 May 2026 (Project Freedom, EU navigation sanctions, Munir in Tehran). Three months of material events have since occurred: the Islamabad Memorandum was signed, the dual blockade was lifted then reimposed, a 13-night July air campaign ran, the 60-day MoU window lapsed with no deal, and the war's center of gravity moved from air strikes to Hormuz-as-leverage plus "Economic D-Day" sanctions.

## 2. Snapshot Contract

- `timeline.lastUpdated` = `2026-08-23`
- `timeline.observedThrough` = `2026-08-23`
- `timeline.currentPhase` remains `3`
- Phase status remains: 1–2 observed, 3–7 mixed, 8 projected
- Landing page, simulation banner, README table, and methodology snapshot sentence all derive from or quote that date
- Mixed-phase editorial (`phase-content.ts` phases 3–8) must not lead with a stale "As of April 24" / "As of May 22" date
- Scenario card **IDs stay frozen** (URL state). Titles, descriptions, and override weights may change so cards branch from August 23 observed conditions, not from April 6

## 3. Observed Facts (source of calibration)

Every probability shift and every editorial sentence in the plan must trace to one of these facts. If a fact is not listed here, do not invent it.

### Diplomatic

- **17 June 2026:** Trump (Versailles, after G7) and President Masoud Pezeshkian (Tehran) remotely sign the 14-point Islamabad Memorandum. Mojtaba Khamenei issues a written endorsement with misgivings. Pakistan is primary broker; Qatar, Saudi Arabia, Turkey, Egypt facilitate. Source: Wikipedia *Islamabad Memorandum*; Guardian 17 June 2026.
- MoU terms that matter for this model: 60-day halt in strikes; Hormuz reopened toll-free for 60 days; US naval blockade of Iranian ports to end; oil-export sanctions waived (not eliminated) for 60 days; $300bn reconstruction fund discussed; **nuclear program, uranium stockpile, ballistic missiles, and proxy network deferred** to a final deal. Source: Wikipedia *Islamabad Memorandum*.
- **18 June:** CENTCOM announces the naval blockade of Iranian ports is lifted. Pakistan says Hormuz reopens "instantly." Source: Al Jazeera 18 June 2026.
- **19 June:** Trump announces an Israel–Hezbollah ceasefire. Israel continues strikes in southern Lebanon. Source: Wikipedia *2026 Iran war*.
- **20 June:** Iran re-closes Hormuz, citing Israeli Lebanon strikes as a MoU violation. US military denies the claim. Source: Reuters / Al Arabiya 20 June 2026.
- **8 July:** After Iranian attacks on commercial ships asserting sovereignty over Hormuz, Trump says the MoU is "over." US strikes resume. Source: Wikipedia *Islamabad Memorandum*; Reuters 8 July 2026.
- **15 July:** US reimposes the naval blockade of Iranian ports at 16:00 ET. Source: CENTCOM / MECSR regional advisory.
- **18 July:** Iran's Deputy FM Kazem Gharibabadi suspends MoU commitments, citing US breach. Source: Wikipedia *Islamabad Memorandum*.
- **17 August:** The 60-day window for a final deal lapses. No extension. Trump answers "No" when asked about extending. Araghchi: Tehran "never had a ceasefire that would now need to be extended." Source: Kpler 19 August 2026; Forbes 18 August 2026.
- **18 August:** Parliament speaker / lead negotiator Ghalibaf: Hormuz stays shut until the blockade is lifted, frozen assets released, and oil sanctions removed. Trump: no talks scheduled; blockade in full force; "the Hormuz Strait is open and operating." Source: Forbes 18 August 2026; Crisis Group trigger list 18 August 2026.
- **As of 23 August:** no active US–Iran negotiation track. Oman talks on a dual-lane transit framework exist separately and have not reopened the strait.

### Military / Hormuz

- **26–28 June:** Fragile MoU tested. M/V *Ever Lovely* (Singapore-flag) and tanker *MT Kiku* (Panama-flag) hit in Hormuz. US strikes Iranian missile/drone/radar sites on Qeshm and along the strait. IRGC hits US-linked targets in Bahrain and Kuwait. Source: NYT 27 June 2026; NBC 28 June 2026.
- **8–24 July:** Largest US strike packages since April (CBS: ≥170 targets on 8–9 July, ~17× the 26 June salvo). Thirteen consecutive nights of strikes. Trump threatens a "massive attack," then a pause. Source: CBS 10 July 2026; NPR 24 July 2026.
- **28–30 July:** Iran conducts a ballistic-missile attack on US forces in Jordan; US resumes strikes. Source: NPR 30 July 2026; IndustryWeek Hormuz Watch 31 July 2026.
- **4 August:** Tehran approves a dual-lane transit framework (zero tolls, mine clearance of the main lane within 30 days) on a separate 60-day clock. Mine work does not start. Source: Kpler 19 August 2026.
- **11 August:** US forces fire on the rudder of a Panama-flagged vessel attempting to break the blockade in the Gulf of Oman. No casualties. Source: Wikipedia *2026 Iran war*.
- **13–16 August:** Hegseth: the blockade can be sustained "indefinitely." Multiple ADNOC-affiliated vessels struck in Hormuz. UAE Foreign Ministry names the IRGC and calls it piracy in breach of UNSCR 2817. Source: Wikipedia; GlobalSecurity Day 169–170.
- **21 August:** Kpler/Reuters: 7 Hormuz crossings — lowest daily figure of the war (pre-war ~130/day). Source: MECSR / Reuters.
- CENTCOM blockade accounting (reimposed period): on the order of 44–64 commercial vessels redirected, 2–3 disabled, 2 boarded, depending on the week's statement. Do not treat any single day's number as cumulative-from-April.

### Economic

- Brent peaked ~$118–$139 in March. By 1 July it had fallen to $71.57. It printed $100.69 on 23 July, closed $96.78 on 24 July, and on 19 August settled **$91.62** (WTI $85.83). Source: Wikipedia energy section; Reuters 19 August 2026.
- Kpler: Hormuz crude+products 4.8 million bpd in July, ~2 million bpd so far in August, vs ~18 million bpd pre-war. Iranian crude exports 294,000 bpd this month vs 1.7 million bpd in 2025. Iranian inflation exceeded 80% YoY in July (ISNA). Source: Reuters 18 August 2026.
- Dallas Fed / Baker Hughes April call that Hormuz would not fully reopen until H2 2026 is now a miss — August is H2 and the strait is not open.
- Trump, 20 August: "Economic D-Day" — any country trading with Iran will be sanctioned. Full package expected 24 August. Source: Times of Israel 22 August 2026; Wikipedia.

### Political / alliance

- **3 June:** US House 215–208 vote requiring the war to cease or obtain congressional approval. **23 June:** Senate 50–48. Source: Wikipedia *2026 Iran war*.
- **18 August:** UAE suspends all trade, exchange, and financial transactions with Iran after reporting two Iranian missiles, one landing in UAE territorial waters. Iran denies, alleges false flag. Source: Wikipedia.
- **19 August:** NATO says it is "prepared to defend all allies" against the Iranian regime. Source: Wikipedia.
- US munitions: virtually all PrSM and ATACMS expended; ~80% of THAAD interceptors; "a little less than half" of global Tomahawks; ~25% of Reapers. 6 August Camp David clash between Trump and Hegseth over "extreme missile shortages" (Washington Post; Trump denied the report). 7 August: $58.6bn Lockheed Patriot contract. Source: Wikipedia; The Hill 4 August 2026.
- US 5th Fleet base in Bahrain reported inoperable (NYT 14 August, per Wikipedia infobox).
- Mohsen Rezaei is the new SNSC secretary; 22 August he threatens to halt all oil through Hormuz if neighbors join the US economic crackdown. Source: Hormuz Strait Monitor 23 August 2026.

### Humanitarian

- **Iran deaths (divergent, all must be shown as a range):** HRANA 3,684 documented (of which 1,701 civilians as of the 7 April HRANA cut, plus 714 unclassified); Iran MoH 3,528; OCHA 3,400; IDF 6,000. Do not pick a single number. Source: Wikipedia *Casualties of the 2026 Iran war*.
- **Lebanon:** Lebanese Health Ministry 4,324 killed, 12,221 injured; >1 million displaced. Source: Wikipedia *2026 Lebanon war* excerpt.
- **United States (as of 21 July):** 19 service members and 1 civilian contractor killed; 624 service members and 5 contractors wounded. Source: Wikipedia *Casualties*.
- Seafarer toll in Hormuz-area incidents since the 8 April ceasefire: 14+ civilian mariners confirmed dead, 1 missing (*Minoan Pioneer* third engineer, 3 August). Counted separately: 6 dead aboard *Tihamah* in Bab al-Mandeb on 11 August (first fatal Houthi shipping attack of this war). Source: GlobalSecurity Day 170.

### What has NOT happened (do not write as if it has)

- No US or Israeli ground invasion of Iran. Kharg Island was threatened in July and not taken.
- No Iranian nuclear detonation, no confirmed new warhead, no IAEA-verified reconstitution of a weapon.
- No regime collapse. Pezeshkian signed the MoU; Ghalibaf still negotiates; Mojtaba Khamenei is Supreme Leader; the SNSC issues conditions.
- Hormuz is not fully closed to every hull and not fully open. Observed state is **selective / near-halt passage** (single-digit to low-teens daily crossings vs ~130 pre-war).
- Pape Stage 3 (ground forces) has not been entered. The US substituted blockade + secondary sanctions for ground escalation.

## 4. Calibration Rules

- Change **defaultProbabilities** / **defaultDistribution** / **defaultPTrue** and the node's `description` + `source.citation`. Do not rewrite CPT rows unless a parent state is now observed-impossible *and* leaving the old row would make the default and the CPT contradict each other in a way the interpolation engine would prefer. Prefer leaving sparse CPTs alone — interpolation already blends.
- Categorical defaults must sum to 1.00 (±0.01, the existing data-integrity test).
- Continuous `oil_price_current.min` must drop below the July print of $71.57 (set min to 65).
- Falsified duration bins (`under_6_weeks`, `weeks`, `1_3_months`) may keep a 0.01 residual; do not zero them (interpolation / scenario overrides still reference those keys).
- Direction of travel, not just the point estimate:
  - Duration: mass moves to `4_8_months` and `over_8_months` / `prolonged_over_6_months`.
  - Hormuz: `prolonged_closure` and `indefinite` rise; `immediate_post_ceasefire` nearly dies.
  - Coercion: `counterproductive` rises relative to `failed`; `succeeded` shrinks.
  - Resolution: `frozen_conflict` stays modal; `negotiated_settlement` falls (MoU was tried and died); `wider_regional_war` ticks up on Economic D-Day + ADNOC attacks + Lebanon; `decisive_us_victory` stays residual.
  - Ground escalation **falls** (0.45 → 0.28). Six months of air-coercion failure produced blockade and sanctions, not Stage 3. Munitions shortages and two congressional war-powers votes are the constraint Pape's 75% estimate did not price.
- Scenario cards that still pivot on "April 6" or "by summer" must be rewritten as August-23 counterfactuals. Keep IDs.

## 5. Out of Scope

- Engine, worker, interpolation, confidence scoring, TimelineBar, UI chrome
- New Bayesian nodes
- Changing `currentPhase` or promoting Phase 8 to mixed
- Live data feeds
- Rewriting Phase 1–2 editorial (locked observed)
- Force-push, version skip, or combining this with unrelated refactors

## 6. Tone and Copy Rules (from the parent spec, verbatim)

- Tone: authoritative but accessible. Think *The Economist* or *Foreign Affairs* — confident assertions backed by sourced data, no jargon without immediate plain-English context.
- Data model: snapshot-in-time with a clearly stated "as of" date. All parameters sourced from open-source intelligence and think tank reports. No live data feeds.
- Be respectful of the sensitive subject matter — this is an educational tool about a real conflict affecting real people.

## 7. Version

Bump `1.0.4.0` → `1.0.5.0` in `VERSION` and `package.json`. Changelog style matches `1.0.3.0` (data cycle): Added events, Changed editorial + recalibrations, For contributors test-count delta.
