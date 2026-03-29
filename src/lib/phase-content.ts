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
];

export function getPhaseContent(phase: number): PhaseContent | undefined {
  return phaseContent.find((p) => p.phase === phase);
}
