import type { PhaseStatus } from '@/lib/timeline';

export function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function describePhaseStatus(status: Record<string, PhaseStatus>): string {
  const groups = { observed: [] as number[], mixed: [] as number[], projected: [] as number[] };
  for (const [k, v] of Object.entries(status)) groups[v as PhaseStatus].push(Number(k));
  for (const g of Object.values(groups)) g.sort((a, b) => a - b);

  const fmt = (ns: number[]) =>
    ns.length === 0 ? '' :
    ns.length === 1 ? `Phase ${ns[0]}` :
    `Phases ${ns[0]}–${ns[ns.length - 1]}`;

  const verb = (ns: number[]) => (ns.length === 1 ? 'is' : 'are');

  const parts: string[] = [];
  if (groups.observed.length) {
    parts.push(`${fmt(groups.observed)} ${verb(groups.observed)} locked to observed historical data`);
  }
  if (groups.mixed.length) {
    parts.push(`${fmt(groups.mixed)} ${verb(groups.mixed)} mixed observed and projected`);
  }
  if (groups.projected.length) {
    parts.push(`${fmt(groups.projected)} ${verb(groups.projected)} fully projected`);
  }
  return parts.join('. ');
}
