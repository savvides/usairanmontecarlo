export interface PhaseContent {
  phase: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
  sources: string[];
}

export const phaseContent: PhaseContent[] = [
  {
    phase: 1,
    title: 'The Strike (February 28)',
    subtitle: 'How a surprise attack in 12 hours changed the Middle East',
    paragraphs: [
      'In the early hours of February 28, 2026, the United States and Israel launched a coordinated surprise air campaign that fundamentally altered the strategic landscape of the Middle East. Roughly 900 strikes were executed within a 12-hour window — a tempo of violence that exceeded the opening salvos of Operation Desert Storm and left Iran\'s air defense networks overwhelmed before they could mount a coherent response. B-2 Spirit bombers, F-35s operating from regional bases, and a sustained Tomahawk barrage from US Navy assets in the Arabian Sea formed the backbone of the assault. The stated objectives were threefold: destroy Iran\'s nuclear program, decapitate its military leadership, and signal the irreversibility of regime change.',
      'The leadership decapitation component proved the most consequential and most controversial element of the operation. Supreme Leader Ali Khamenei was killed in the strikes along with at least seven senior officials of the Islamic Revolutionary Guard Corps and the Iranian military establishment. The simultaneous elimination of Iran\'s ultimate decision-making authority and its principal military commanders created an immediate command-and-control vacuum — one that would shape the character of Tehran\'s retaliation in the days that followed. Nuclear facilities at Fordow, Natanz, and Isfahan sustained damage assessed by US officials as sufficient to set the program back years; independent analysts have been more cautious about the long-term effectiveness of strikes on hardened underground sites.',
      'The stated aim of regime change represented a departure from decades of US declaratory policy, which had maintained that military action against Iran was aimed at preventing nuclear proliferation rather than altering its system of government. The legal and strategic justifications offered by the administration — that Khamenei\'s personal direction of terrorist proxies and the nuclear program made him a legitimate military target — were immediately contested by international law scholars and key allies. Whatever the legal merits, the operational reality of February 28 is now fixed: it marks the opening act of the first direct large-scale military conflict between the United States and Iran.',
    ],
    sources: [
      'US DoD Press Briefings, February 28 – March 2, 2026',
      'IAEA Emergency Board Statement, March 1, 2026',
      'Reuters/AP contemporaneous strike reporting, February 28, 2026',
      'Foreign Affairs: The Architecture of the February 28 Campaign',
    ],
  },
  {
    phase: 2,
    title: 'Retaliation & Escalation (Feb 28 – Mar 10)',
    subtitle: 'Iran\'s 500 missiles and the world\'s fastest escalation ladder',
    paragraphs: [
      'Iran\'s response to the February 28 strikes was neither measured nor delayed. Within 48 hours, the Islamic Revolutionary Guard Corps Aerospace Force had launched more than 500 ballistic and cruise missiles at US military installations across Iraq, Qatar, Bahrain, and the UAE, accompanied by approximately 2,000 drones targeting civilian and military infrastructure throughout the Gulf. The scale and simultaneity of this retaliation exceeded any previous Iranian missile salvo and demonstrated that survivable launch capacity had been preserved despite the initial strikes. Several US forward operating bases sustained significant damage; casualties among American servicemembers were in the dozens, triggering automatic escalation protocols under rules of engagement.',
      'The closure of the Strait of Hormuz, announced by acting Iranian military command on March 1, marked the escalation\'s transition from a military exchange to a global economic crisis. Iranian naval assets — including fast-attack craft, submarine-laid mines, and shore-based anti-ship missile batteries — enforced the blockade with sufficient credibility to halt commercial tanker transit within 24 hours of the declaration. Simultaneously, Hezbollah activated its full rocket and anti-tank missile arsenal against Israeli territory, opening a northern front that stretched Israeli air defenses and expanded the geographic scope of the conflict from the Persian Gulf to the eastern Mediterranean. The combination of the Hormuz closure and the Hezbollah activation transformed what had been conceived as a limited strike campaign into a multi-front regional war.',
      'By March 10 — twelve days after the initial strikes — the escalation ladder had been climbed to a level that strategists had long modeled as a worst-case scenario. Iran had struck the territory of four US-allied Gulf states; the United States had responded with sustained counter-battery operations against IRGC launch sites; Israel had struck Hezbollah command nodes in Lebanon and Syria; and the Strait of Hormuz remained closed to commercial navigation. Diplomatic off-ramps that had been theoretically available in the first 72 hours were foreclosed by the scale of casualties and the domestic political dynamics on all sides. The question shifted from whether full-scale war had begun to how long it would last and what it would cost.',
    ],
    sources: [
      'USCENTCOM Operations Update, March 1–10, 2026',
      'International Energy Agency Emergency Oil Market Assessment, March 3, 2026',
      'UN Secretary-General Statement on Hormuz Closure, March 2, 2026',
      'Institute for the Study of War: Iran Retaliation Campaign Tracker',
    ],
  },
  {
    phase: 3,
    title: 'Active Conflict (Current)',
    subtitle: 'Eleven thousand targets, a fourth front, and no end in sight',
    paragraphs: [
      'As of March 29, 2026, the US-led air campaign has prosecuted strikes against more than 11,000 designated targets across Iran — a number that encompasses nuclear infrastructure, IRGC military facilities, ballistic missile production and storage sites, air defense networks, and command nodes. The breadth of the target list reflects a strategic logic that has expanded well beyond the original nuclear-focused rationale: US planners are now attempting to systematically degrade Iran\'s capacity to sustain multi-domain warfare. The pace of operations — approximately 300 to 400 strike sorties per day — is the highest sustained rate of US air operations since the 2003 invasion of Iraq.',
      'The conflict entered a new phase on March 28 when Houthi forces in Yemen formally declared war and launched a sustained barrage of ballistic missiles and attack drones at US naval assets in the Red Sea and at Gulf state infrastructure. The Houthi entry was anticipated by US intelligence but not prevented; it opens a fourth operational front and stretches the logistical and defensive demands on US and allied forces. The USS Harry S. Truman carrier strike group, already managing air operations over Iran, now faces concurrent threats from Houthi anti-ship missiles. The naval dimension — already complicated by Iran\'s Hormuz blockade — is becoming the most operationally taxing aspect of the conflict for American planners.',
      'The fundamental uncertainty of this phase is whether the air campaign, however expansive, can produce a political outcome. Military analysts observe that the US has achieved near-total air superiority and has degraded Iran\'s conventional military capacity significantly; they disagree sharply about whether degradation translates into political leverage. Iran\'s post-Khamenei acting leadership, operating in dispersed and hardened locations, has shown no public willingness to negotiate under fire — a pattern consistent with historical precedent from conflicts in Serbia, Iraq, and Libya. The April 6 deadline imposed by the administration for Iran to accept a framework agreement is being watched as the first real test of whether coercive air power can compel a government fighting for its survival.',
    ],
    sources: [
      'Pentagon Press Briefings, March 2026 (ongoing)',
      'CSIS Conflict Tracker: Iran Campaign, March 2026',
      'Reuters: Houthi Declares War, Enters Iran Conflict — March 28, 2026',
      'RAND Corporation: Coercive Air Campaigns — Limits and Possibilities',
    ],
  },
  {
    phase: 4,
    title: 'Economic Shockwaves',
    subtitle: 'Oil at $126, ten million barrels gone, and the GCC food emergency',
    paragraphs: [
      'The International Energy Agency declared on March 5 that the world is facing its "greatest energy security challenge since the 1970s oil crisis." The assessment is difficult to dispute: the Strait of Hormuz closure has removed approximately 10 to 12 million barrels per day from global oil supply — a figure equivalent to roughly 10% of world consumption and far exceeding the offsetting capacity of strategic petroleum reserve releases and OPEC+ emergency production commitments. Brent crude has traded between $113 and $126 per barrel since the closure, with the range reflecting alternating signals about potential negotiated reopenings and the persistence of mine threats. The IEA has coordinated the largest SPR release in history, but reserve drawdowns are inherently time-limited and markets have priced in the constraint.',
      'The economic damage extends well beyond energy prices. Gulf Cooperation Council states, which collectively host roughly $3.5 trillion in sovereign wealth fund assets and supply approximately 30% of the world\'s food imports through Hormuz-transiting container traffic, are experiencing an acute food security crisis. The UAE and Qatar — both heavily dependent on imported food — have declared national food emergencies and are operating emergency airlift procurement from alternative suppliers. The disruption to GCC food supply chains is cascading into inflation spikes across South Asia and East Africa, where Gulf remittances and re-exports play a critical role in food access. The World Food Programme has estimated that 40 million people in the broader region face acute food insecurity as a direct result of the conflict-driven supply disruption.',
      'The April 6 deadline carries economic as well as military significance. Financial markets have assigned an approximately 60% probability to some form of Hormuz reopening framework before mid-April, based on options pricing in crude futures. If the deadline passes without agreement, analysts at Goldman Sachs and JPMorgan have published scenarios in which Brent reaches $150 to $175, triggering recession across major European economies and a severe growth slowdown in energy-importing emerging markets. The United States, as both a net oil producer and a conflict participant, faces a more complex macro picture: the energy sector is experiencing windfall revenue while manufacturing and consumer sectors absorb cost shocks — a bifurcation that is already generating sharp political divisions about the conflict\'s costs at home.',
    ],
    sources: [
      'International Energy Agency: Oil Market Report — Emergency Assessment, March 5, 2026',
      'World Food Programme: Food Security Alert — Gulf Disruption, March 15, 2026',
      'Goldman Sachs Global Investment Research: Oil Shock Scenarios, March 20, 2026',
      'IMF Rapid Assessment: Macroeconomic Impact of Hormuz Closure, March 10, 2026',
    ],
  },
  {
    phase: 5,
    title: 'Geopolitical Reactions',
    subtitle: 'UNSC Resolution 2817 and a ceasefire deadlocked',
    paragraphs: [
      'The United Nations Security Council passed Resolution 2817 on March 8, calling for an immediate ceasefire and the reopening of the Strait of Hormuz. The resolution\'s text was carefully negotiated to secure abstentions rather than vetoes from Russia and China — both of whom condemned the initial US-Israel strikes as violations of international law but declined to block a ceasefire call that was in their economic interest. Russia\'s abstention was particularly notable: Moscow had loudly condemned the strikes and offered Iran diplomatic support in the first week of the conflict, but the collapse of global oil logistics — which affects Russia\'s own ability to monetize its energy exports through alternative routing — ultimately overrode ideological solidarity. China, with approximately $300 billion in annual trade flowing through Hormuz-connected logistics chains, made clear through back-channel communications that it expected a rapid resolution.',
      'Despite the nominal international consensus embodied in Resolution 2817, ceasefire talks have stalled. The United States has tabled a framework requiring Iran to accept permanent international inspection of all nuclear sites, dissolution of IRGC proxy networks, and extradition of IRGC commanders designated as terrorist leaders — conditions that Iran\'s acting government has characterized as terms of unconditional surrender rather than a negotiated end to hostilities. Iran\'s counter-proposal calls for a mutual ceasefire, US troop withdrawal from the Gulf, and a UN-supervised nuclear arrangement that preserves enrichment rights. The gap between the positions is not merely tactical; it reflects the structural incompatibility between Washington\'s maximalist war aims and Tehran\'s minimum conditions for regime preservation.',
      'Turkey has emerged as the principal mediation candidate, leveraging its NATO membership to maintain access to Washington and its historical Iran trade relationships to maintain credibility with Tehran. Turkish Foreign Minister Hakan Fidan has shuttled between the two capitals twice since March 15; the conversations have reportedly narrowed the humanitarian provisions and produced agreement in principle on a prisoner exchange framework, but core issues of nuclear access and proxy networks remain unresolved. Qatar and Oman, which have historically served as back-channel intermediaries, are playing supporting roles. The ceasefire deadline of April 6 — set unilaterally by the US administration as the point at which it would escalate to "phase three" operations — has given the Turkish mediation a hard clock.',
    ],
    sources: [
      'UN Security Council Resolution 2817, March 8, 2026',
      'Reuters: Turkey Mediation Shuttle Diplomacy Update, March 22, 2026',
      'Financial Times: China and Russia Abstain as UNSC Passes Ceasefire Resolution, March 8, 2026',
      'International Crisis Group: Ceasefire Framework Analysis, March 2026',
    ],
  },
  {
    phase: 6,
    title: 'Humanitarian Impact',
    subtitle: '1,937 dead, 24,800 injured, and a civilization under siege',
    paragraphs: [
      'The confirmed death toll from the conflict stood at 1,937 as of March 27, with 24,800 documented injuries — figures that independent humanitarian organizations assess as significant undercounts given the collapse of reporting infrastructure in the most heavily struck provinces. The dead include Iranian civilians killed in strikes on dual-use infrastructure, US and allied military personnel killed in Iran\'s retaliatory missile campaign, and civilians in Gulf states killed in IRGC drone and missile attacks. The UN Human Rights Office has opened investigations into specific strikes in Tehran, Isfahan, and Shiraz where credible reports indicate civilian casualties inconsistent with proportionality standards under international humanitarian law.',
      'The cultural and infrastructural destruction compounds the human toll in ways that will outlast the immediate conflict. Iranian authorities have reported damage to more than 120 UNESCO-listed and nationally significant historical sites — a consequence of the proximity of ancient urban cores to dual-use military and communications infrastructure in Persian cities. Across 26 of Iran\'s 31 provinces, water treatment facilities, power generation plants, and telecommunications networks have sustained damage that is already producing secondary public health crises: waterborne disease outbreaks have been reported in Khuzestan province, and hospital capacity across the country has been reduced to an estimated 40% of pre-conflict levels as a result of power cuts and staff displacement. The ICRC has described the health system situation as "approaching collapse."',
      'Beyond Iran\'s borders, the humanitarian architecture of the broader region is under severe strain. Lebanon, where Hezbollah\'s full activation has drawn Israeli strikes into Beirut\'s southern suburbs, is absorbing displacement on top of an existing economic and governance crisis. The GCC food emergency — a secondary consequence of the Hormuz closure rather than direct military action — is generating the kind of diffuse mass suffering that is politically difficult to attribute and even more difficult to address through conventional humanitarian mechanisms. Global anti-war demonstrations, the largest since the 2003 Iraq War protests, have drawn millions in European and American cities, creating domestic political pressure on governments that have either supported or acquiesced to the strikes.',
    ],
    sources: [
      'UN OCHA: Iran Conflict Humanitarian Situation Report No. 4, March 27, 2026',
      'ICRC Emergency Bulletin: Healthcare System Under Conflict, March 20, 2026',
      'UNESCO Emergency Heritage Assessment: Iran, March 2026',
      'Amnesty International: Civilian Casualty Tracking Report, March 25, 2026',
    ],
  },
  {
    phase: 7,
    title: 'Resolution Paths',
    subtitle: 'The April 6 deadline and the question of who governs Iran next',
    paragraphs: [
      'The April 6 deadline imposed by the US administration represents the most consequential near-term inflection point in the conflict. The administration has signaled — without providing operational specifics — that failure to reach a framework agreement will trigger "phase three" operations, which analysts interpret as ground component activation or strikes on targets currently held off the list for escalation management reasons. The deadline is designed to create urgency in Turkish-mediated talks; its credibility depends on whether Iran\'s acting government believes Washington will follow through and whether the administration can maintain coalition support for an escalatory step that several Gulf partners have privately opposed.',
      'The power vacuum created by Khamenei\'s death is the wildcard that defies confident modeling. Iran\'s constitutional succession mechanisms have never been tested under conditions of active military conflict and leadership decapitation. The Assembly of Experts — the body formally responsible for selecting a new Supreme Leader — has been unable to convene in full due to security concerns and the deaths of several members in the February 28 strikes. Acting authority has devolved to a committee of IRGC commanders and surviving government officials whose legitimacy is contested internally. The scenario in which reformist or pragmatic factions use the power vacuum to negotiate a deal that ends the conflict is analytically plausible; so is the scenario in which IRGC hardliners consolidate control and escalate. The simulation assigns roughly equal probability to these two paths, reflecting the genuine opacity of Iran\'s current internal politics.',
      'Three resolution archetypes dominate the probability space. The first — a Turkish-brokered ceasefire framework accepted before April 6 — requires sufficient concessions from both sides to be politically survivable for each government; it is possible but requires face-saving formulations on nuclear access that have not yet been found. The second — a continued air campaign that produces Iranian capitulation without a ground war — has historical precedents (Serbia 1999) but also notable failures (Vietnam, Yemen), and Iran\'s dispersed command structure makes capitulation harder to operationalize than surrender of a conventional military. The third — an expansion of the conflict to ground operations or direct confrontation with Russia or China — remains the tail risk that shapes all of the other calculations, assigned a non-trivial probability by military planners on all sides.',
    ],
    sources: [
      'White House Statement on April 6 Framework Deadline, March 18, 2026',
      'RAND Corporation: Post-Khamenei Succession Scenarios, March 2026',
      'Foreign Affairs: Coercion and Capitulation — When Air Power Compels, March 2026',
      'International Crisis Group: Off-Ramps from the Iran Conflict, March 25, 2026',
    ],
  },
  {
    phase: 8,
    title: 'Long-Term Aftermath',
    subtitle: 'Nuclear futures, regime survival, and the post-American Middle East',
    paragraphs: [
      'The most consequential long-term question the conflict poses is what happens to Iran\'s nuclear program — and to the global nonproliferation order — regardless of how the fighting ends. If the February 28 strikes permanently destroyed Iran\'s enrichment capacity and the conflict ends with a verified nuclear rollback, the outcome would mark the first successful coercive denuclearization of a state that had achieved near-weapons-grade enrichment capability. The lesson other states would draw is ambiguous: it demonstrates that the US-Israeli military combination can execute such a strike, but it also demonstrates that nuclear weapons capability is the only reliable deterrent against regime change — a lesson that is already being discussed in Riyadh, Ankara, and Seoul. The Nuclear Non-Proliferation Treaty, already weakened by North Korea\'s breakout and the JCPOA\'s collapse, would face an existential legitimacy test.',
      'The regional order faces reconstruction regardless of outcome. A post-conflict Iran — whether under a negotiated arrangement with the current acting government, a reformist transition enabled by the power vacuum, or a fragmented state if internal conflict follows military defeat — will not simply return to the pre-February 28 status quo. Iraq, whose sovereignty has been violated by strikes on IRGC-linked militias operating from its territory, faces renewed political fragmentation. The Houthi consolidation of control in Yemen has been accelerated by their entry into the conflict. Lebanon\'s already-failed state is more failed. The Arab-Israeli normalization architecture, which the Trump administration had invested heavily in extending, has been set back by years by the image of joint US-Israeli strikes on a Muslim country. The regional order the United States sought to stabilize is, in the short term, more unstable than it was before.',
      'For the United States, the long-term strategic costs and benefits will be debated for decades. The fiscal burden of the campaign — preliminary DoD estimates put direct military costs at $180 billion through the end of March — arrives on top of a federal balance sheet already strained by deficit spending. Indo-Pacific military planners have raised formal concerns that the diversion of precision munitions, naval assets, and ISR capacity to the Gulf campaign has degraded the US deterrence posture toward China at a moment of elevated Taiwan Strait tension. Reconstruction commitments — whether through a peace agreement or a post-conflict stabilization framework — will add further long-term costs. Against these costs, the administration points to the permanent elimination of a near-nuclear Iranian state as a strategic benefit whose value cannot be denominated. That argument will be tested against events in the months and years ahead.',
    ],
    sources: [
      'Carnegie Endowment: Nuclear Proliferation After Iran — Regional Cascades, March 2026',
      'RAND Corporation: Strategic Costs of the Iran Campaign for Indo-Pacific Posture, March 2026',
      'Congressional Budget Office: Preliminary Cost Estimate of Iran Military Operations, March 2026',
      'Brookings Institution: Post-Conflict Middle East Order — What Comes Next, March 2026',
    ],
  },
];

export function getPhaseContent(phase: number): PhaseContent | undefined {
  return phaseContent.find((p) => p.phase === phase);
}
