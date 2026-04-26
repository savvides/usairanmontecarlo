import timelineData from '@data/timeline.json';

export type PhaseStatus = 'observed' | 'mixed' | 'projected';

export interface TimelineEvent {
  date: string;
  label: string;
  description: string;
  phase: number;
  source: string;
}

export interface TimelineData {
  lastUpdated: string;
  observedThrough: string;
  currentPhase: number;
  phaseStatus: Record<string, PhaseStatus>;
  events: TimelineEvent[];
}

export const timeline: TimelineData = timelineData as TimelineData;

export function getPhaseStatus(timeline: TimelineData, phase: number): PhaseStatus {
  return timeline.phaseStatus[String(phase)] ?? 'projected';
}

function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysSinceUpdate(lastUpdated: string): number {
  const now = new Date();
  const updated = parseLocalDate(lastUpdated);
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

const PHASE_STATUS_PROSE = {
  observed: 'locked to observed historical data',
  mixed: 'mixed observed and projected',
  projected: 'fully projected',
} as const satisfies Record<PhaseStatus, string>;

const PHASE_STATUS_ORDER = ['observed', 'mixed', 'projected'] as const;

export function describePhaseStatus(status: Record<string, PhaseStatus>): string {
  const groups: Record<PhaseStatus, number[]> = { observed: [], mixed: [], projected: [] };
  for (const [k, v] of Object.entries(status)) groups[v].push(Number(k));
  for (const g of Object.values(groups)) g.sort((a, b) => a - b);

  const fmt = (ns: number[]) =>
    ns.length === 1 ? `Phase ${ns[0]}` : `Phases ${ns[0]}–${ns[ns.length - 1]}`;
  const verb = (ns: number[]) => (ns.length === 1 ? 'is' : 'are');

  return PHASE_STATUS_ORDER
    .filter((s) => groups[s].length > 0)
    .map((s) => `${fmt(groups[s])} ${verb(groups[s])} ${PHASE_STATUS_PROSE[s]}`)
    .join('. ');
}
