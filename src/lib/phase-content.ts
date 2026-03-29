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
    title: 'Pre-Conflict Tensions',
    subtitle: 'The landscape before the first shot',
    paragraphs: [
      'The US-Iran confrontation operates across multiple interconnected domains simultaneously. Iran\'s nuclear program — now enriching uranium to levels that narrow the gap to weapons-grade material — sits at the center of an escalation matrix that includes proxy warfare across Iraq, Syria, Lebanon, and Yemen, maritime tensions in the Persian Gulf, and a sanctions regime that has reshaped Iran\'s economy and domestic politics.',
      'The variables in this phase represent the pre-conflict baseline: how many forces are deployed, how advanced the nuclear program is, how active the proxy networks are, and whether diplomatic channels remain open. These starting conditions don\'t just set the stage — they constrain every outcome that follows. A conflict that begins during a diplomatic freeze looks fundamentally different from one that erupts during failed negotiations.',
      'Use the scenario cards to explore different trigger events. Each one shifts the probability landscape across all downstream phases — not just the immediate military response, but the economic shockwaves, geopolitical realignments, and long-term consequences that cascade from this starting point.',
    ],
    sources: [
      'IISS Military Balance 2025',
      'IAEA Board of Governors Reports',
      'CSIS Iran Threat Assessment',
      'Crisis Group Middle East Reports',
    ],
  },
  {
    phase: 2,
    title: 'Escalation & First Strikes',
    subtitle: 'How restraint breaks down',
    paragraphs: [
      'The passage from crisis to conflict rarely follows a straight line. In the US-Iran context, escalation is more likely to be a cascade of tit-for-tat moves — a targeted killing, a missile barrage, a cyber intrusion — than a single decisive act of war. Each side faces what strategists call the "escalation ladder": a series of rungs where each step raises the cost of backing down while also raising the risk of catastrophic miscalculation. The historical record from 2019-2020, when the killing of Qasem Soleimani and Iran\'s subsequent ballistic missile strike on US bases in Iraq brought the two countries to the edge, illustrates how quickly manageable crises can spiral.',
      'First strikes in this scenario are unlikely to be a bolt from the blue. More plausible triggers include an Iranian decision to cross a uranium enrichment threshold that Washington or Jerusalem has declared a red line, an escalation of Houthi or Hezbollah attacks that kills large numbers of American personnel, or a covert operation gone wrong. The first use of force matters enormously: it establishes precedents, tests resolve, and shapes the narrative of who bears responsibility — a factor that will heavily influence which coalition partners stay engaged and which step back.',
      'The simulation models two critical variables here: the scale of the initial strike and the target set. A limited strike aimed at nuclear facilities produces a very different subsequent probability tree than a broader decapitation campaign targeting military leadership or critical infrastructure. The former invites a measured response and preserves some diplomatic space; the latter collapses it almost entirely.',
    ],
    sources: [
      'RAND Corporation: Conflict with Iran (2019)',
      'Foreign Affairs: The Logic of Iranian Escalation',
      'US Central Command Posture Statements',
      'Belfer Center: Iran Crisis Simulations',
    ],
  },
  {
    phase: 3,
    title: 'Active Conflict',
    subtitle: 'The shape and duration of fighting',
    paragraphs: [
      'Once armed conflict begins, the key variables are intensity, geography, and duration. Iran cannot match the United States in conventional military power — its air force is aging, its navy is outmatched, and its command-and-control systems are vulnerable to American electronic warfare. What Iran can do is impose costs through asymmetric means: ballistic missiles aimed at US bases across the region, drone swarms targeting Gulf state infrastructure, naval mines and fast-boat attacks choking the Strait of Hormuz, and proxy forces opening simultaneous fronts in Iraq, Syria, and Lebanon. This multi-domain response is designed not to win but to make winning too expensive.',
      'The United States, for its part, holds overwhelming advantages in precision strike capability, intelligence surveillance and reconnaissance, and naval power projection. A sustained air campaign could systematically degrade Iran\'s nuclear sites, missile batteries, and command nodes. But "degrading" is not the same as "eliminating" — dispersal, hardening, and redundancy mean that even the most successful strikes leave residual capability. American planners must also weigh the risk of strikes that kill civilians or hit sites near population centers, generating the kind of imagery that fractures political coalitions at home and abroad.',
      'Duration is the variable that most determines outcome character. A short, sharp exchange lasting days to weeks produces a different set of downstream effects than a prolonged campaign extending months. Short conflicts tend to end with ambiguous military results and unresolved political questions; long ones exhaust resources, radicalize populations, and create ungovernable voids. The simulation assigns probability weights to both, reflecting historical base rates from comparable regional air campaigns.',
    ],
    sources: [
      'Center for Strategic and International Studies: Iran Military Power',
      'Stimson Center: The Iran Nuclear Challenge',
      'Congressional Research Service: US Military Presence in the Middle East',
      'Air Force Research Institute: Regional Air Campaign Analysis',
    ],
  },
  {
    phase: 4,
    title: 'Economic Shockwaves',
    subtitle: 'When war reaches the global economy',
    paragraphs: [
      'The Persian Gulf is the arteries of the global energy system. Roughly 20% of the world\'s oil — and an even larger share of liquefied natural gas destined for Asia — passes through the Strait of Hormuz. Any conflict that threatens those shipping lanes sends an immediate price signal through global commodity markets. The 1973 oil embargo, the tanker wars of the 1980s, and the 2019 attacks on Saudi Aramco facilities all demonstrate how even partial disruptions produce outsized economic effects. A full closure of the Strait, even for a few weeks, would remove roughly 17 million barrels per day from global supply — more than enough to trigger a global recession.',
      'The economic damage is not limited to energy. Iran\'s ballistic missiles and proxy networks threaten Gulf state infrastructure — petrochemical plants, desalination facilities, financial centers — that underpin regional economies and global supply chains far beyond oil. Saudi Arabia, the UAE, Kuwait, and Qatar together account for a substantial share of sovereign wealth fund assets globally; instability in those states triggers financial contagion that reaches pension funds and investment portfolios worldwide. Meanwhile, the United States and Europe face the dual burden of higher energy costs and the fiscal weight of military operations.',
      'The simulation models oil price shocks, currency volatility, and GDP impact estimates using historical conflict analogues and IMF stress-testing frameworks. The range of outcomes is wide: a brief, contained exchange might produce a spike and recovery, while a prolonged conflict could lock in structural energy price inflation that reshapes industrial policy across the developed world for years. The economic variables in this phase feed back directly into the geopolitical reaction models in Phase 5.',
    ],
    sources: [
      'International Monetary Fund: Middle East Regional Economic Outlook',
      'US Energy Information Administration: Strait of Hormuz Fact Sheet',
      'World Bank: Oil Price Shocks and Economic Growth',
      'Brookings Institution: The Economic Costs of Gulf Conflict',
    ],
  },
  {
    phase: 5,
    title: 'Geopolitical Reactions',
    subtitle: 'How the world responds to a Middle East war',
    paragraphs: [
      'A US-Iran conflict does not occur in a geopolitical vacuum. China, Russia, Saudi Arabia, Israel, Turkey, and the European Union each have distinct interests — and distinct leverage — that shape the conflict\'s trajectory. China imports roughly 13% of its oil from Iran and has signed a 25-year cooperation agreement with Tehran; it has strategic reasons to prevent Iran\'s complete defeat while avoiding direct confrontation with the United States. Russia, preoccupied with Ukraine and Western sanctions, sees value in keeping American attention and resources diverted to the Middle East. These positions do not translate into direct military intervention, but they do affect the diplomatic pressure available to Washington to end the conflict on favorable terms.',
      'The Gulf Arab states present a more complex calculus. Saudi Arabia and the UAE have spent years building quiet security cooperation with Israel and cultivating ties with Washington precisely because they fear Iranian hegemony. Yet domestic publics across the Arab world remain deeply skeptical of American military action, and Gulf rulers who are seen as facilitating strikes on a Muslim country face real internal political risk. Jordan and Iraq — states hosting significant US military infrastructure — face even sharper dilemmas: they need American security guarantees but cannot politically afford to be visibly complicit in an attack on Iran.',
      'The simulation tracks coalition stability as a dynamic variable, not a fixed parameter. As casualties mount and conflict duration extends, alliance cohesion tends to erode. History offers a clear pattern: the Gulf War coalition of 1991 held because the operation was swift and objectives were limited; the Iraq War coalition of 2003 fractured because neither condition was met. How quickly the diplomatic coalition holds or breaks has direct implications for Phase 7\'s resolution pathways.',
    ],
    sources: [
      'Council on Foreign Relations: US Alliances in the Middle East',
      'Carnegie Endowment: China-Iran Relations',
      'European Council on Foreign Relations: Europe and a US-Iran Conflict',
      'Washington Institute for Near East Policy: Gulf State Threat Perceptions',
    ],
  },
  {
    phase: 6,
    title: 'Humanitarian Impact',
    subtitle: 'The human cost of conflict',
    paragraphs: [
      'Iran is a country of 87 million people with a sophisticated, largely urban population concentrated in cities — Tehran, Isfahan, Shiraz, Tabriz — that have no recent experience of modern air war. Precision strike technology reduces but does not eliminate civilian casualties; the presence of dual-use infrastructure (power grids, water treatment plants, communications networks) near legitimate military targets means that the line between acceptable collateral damage and war crimes is contested by every belligerent in every conflict. Based on population density, building stock, and hospital capacity data, casualty modeling for a sustained air campaign in Iran produces estimates ranging from tens of thousands to hundreds of thousands of deaths depending on target selection and campaign length.',
      'The regional humanitarian picture compounds the Iranian domestic toll. Conflict would trigger refugee flows across borders that are already strained by Syria\'s unresolved displacement crisis. Lebanon, already in economic collapse, would face renewed devastation if Hezbollah is drawn into the fighting — triggering further displacement into a Europe that has demonstrated declining political tolerance for large refugee arrivals. Iraq, whose society remains fractured by two decades of war, would face simultaneous pressure from Iranian-backed militias, potential US strikes on those militias, and disruption to the oil revenues that fund what remains of state services.',
      'The simulation incorporates UN displacement models and historical casualty-to-strike ratios from comparable conflicts. These variables matter beyond their moral weight: humanitarian catastrophe generates international pressure for ceasefire, creates ungoverned spaces that become recruitment grounds for successor militant groups, and forces host-country governments into domestic political crises that can destabilize the broader regional architecture. The humanitarian phase is not a footnote to the conflict — it is a driver of its resolution.',
    ],
    sources: [
      'UNHCR: Regional Displacement Risk Assessment',
      'Airwaves: Civilian Harm Mitigation in Air Operations',
      'Human Rights Watch: Laws of War in Armed Conflict',
      'Médecins Sans Frontières: Healthcare in Conflict Zones',
    ],
  },
  {
    phase: 7,
    title: 'Resolution Paths',
    subtitle: 'How conflicts end — and when they don\'t',
    paragraphs: [
      'Wars end when one or more parties concludes that continued fighting costs more than the best available negotiated outcome. The challenge in US-Iran conflict scenarios is that the two sides\' definitions of an acceptable outcome may be structurally incompatible. Washington\'s stated goal — preventing Iranian nuclear weapons capability — may require a degree of verification and monitoring that Tehran views as a violation of sovereignty. Iran\'s goal of regime survival and regional influence is incompatible with the kind of defeat that would satisfy Washington\'s hardliners. This gap means that ceasefires are more likely than comprehensive peace agreements in the near term.',
      'Three resolution archetypes dominate the historical record for conflicts of this type. In the first, a limited military exchange produces a tacit standoff: both sides absorb the damage, declare partial victories, and revert to the pre-conflict status quo with elevated tensions. The Soleimani-Iraq missile exchange of January 2020 approached this pattern. In the second, a decisive military outcome forces one party to the table under duress — the Gulf War provides the clearest example. In the third, exhaustion and economic pressure produce a negotiated arrangement that satisfies no one but is accepted because the alternatives are worse — the Iran nuclear deal of 2015, the JCPOA, fits this category. The simulation assigns probability weights to each archetype based on the outcomes of earlier phases.',
      'International mediation matters more than is often acknowledged. The UN Security Council, the European Union, and key regional powers (Qatar, Oman, and Turkey have all served as back-channel intermediaries in past US-Iran contacts) can create off-ramps that allow both sides to de-escalate without a humiliating public climb-down. The probability of successful mediation drops sharply once civilian casualties exceed certain thresholds or once domestic political actors in either country have staked maximalist positions that make compromise politically suicidal.',
    ],
    sources: [
      'RAND Corporation: How Wars End',
      'International Crisis Group: Negotiating with Iran',
      'Oman Ministry of Foreign Affairs: Track II Diplomacy',
      'Carnegie Endowment: After the JCPOA — Pathways Forward',
    ],
  },
  {
    phase: 8,
    title: 'Long-Term Aftermath',
    subtitle: 'The world that conflict leaves behind',
    paragraphs: [
      'The most consequential effects of a US-Iran conflict may not be visible for years or decades. The nuclear nonproliferation regime — already under stress from North Korea\'s weapons program and the JCPOA\'s collapse — would face an existential test. If Iran\'s nuclear program is destroyed by military force, every mid-tier state watching the outcome draws the lesson that nuclear weapons are the only reliable deterrent against regime change. Saudi Arabia, Turkey, Egypt, and South Korea have all at various points discussed latent nuclear ambitions; a demonstration that conventional military inferiority can be overcome only by crossing the nuclear threshold would accelerate proliferation pressures globally.',
      'The regional order in the Middle East would be redrawn regardless of which scenario materializes. A weakened Iran might create a power vacuum that accelerates the fragmentation of Iraq, empowers Sunni militant groups, or draws Turkey and Saudi Arabia into new proxy conflicts over the pieces. A resilient Iran that survives military strikes and maintains its nuclear program could emerge with increased internal legitimacy and a more aggressive regional posture, having demonstrated that it can absorb American pressure. Neither outcome produces the stable, manageable Middle East that US policymakers have sought for generations.',
      'For the United States, the long-term aftermath involves resource allocation choices that constrain its global posture. Military operations in the Gulf divert attention and materiel from the Indo-Pacific, where the strategic competition with China is the defining challenge of the century. Prolonged engagement in another Middle Eastern conflict would test an American public and political class that has grown skeptical of military adventurism since Iraq and Afghanistan. The simulation\'s final phase asks the fundamental question that strategy demands: not just what happens, but what comes after — and whether the costs were worth the outcomes achieved.',
    ],
    sources: [
      'Brookings Institution: The Future of Nuclear Nonproliferation',
      'RAND Corporation: US Strategic Interests in a Post-Conflict Middle East',
      'Foreign Affairs: The Lessons of Military Intervention',
      'Council on Foreign Relations: Long-Term Stability in the Gulf',
    ],
  },
];

export function getPhaseContent(phase: number): PhaseContent | undefined {
  return phaseContent.find((p) => p.phase === phase);
}
