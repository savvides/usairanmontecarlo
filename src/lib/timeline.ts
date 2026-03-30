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

export function getPhaseStatus(timeline: TimelineData, phase: number): PhaseStatus {
  return timeline.phaseStatus[String(phase)] ?? 'projected';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysSinceUpdate(lastUpdated: string): number {
  const now = new Date();
  const updated = new Date(lastUpdated + 'T00:00:00');
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}
