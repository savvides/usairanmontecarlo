'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PhaseStatus } from '@/lib/timeline';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  completedPhases: Set<number>;
  canNavigateFreely: boolean;
  onPhaseClick: (phase: number) => void;
  phaseStatuses?: Record<string, PhaseStatus>;
}

const PHASE_LABELS = [
  'Tensions',
  'Escalation',
  'Conflict',
  'Economic',
  'Geopolitical',
  'Humanitarian',
  'Resolution',
  'Aftermath',
];

const STATUS_ICONS: Record<PhaseStatus, string> = {
  observed: '●',
  mixed: '◐',
  projected: '○',
};

const STATUS_LABELS: Record<PhaseStatus, string> = {
  observed: 'OBS',
  mixed: 'MIX',
  projected: 'PROJ',
};

export function PhaseProgress({
  currentPhase,
  totalPhases,
  completedPhases,
  canNavigateFreely,
  onPhaseClick,
  phaseStatuses,
}: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-surface border-b border-border">
      {Array.from({ length: totalPhases }, (_, i) => {
        const phase = i + 1;
        const isCurrent = phase === currentPhase;
        const isCompleted = completedPhases.has(phase);
        const isClickable = canNavigateFreely || isCompleted || phase <= currentPhase;
        const status = phaseStatuses?.[String(phase)];

        return (
          <button
            key={phase}
            onClick={() => isClickable && onPhaseClick(phase)}
            disabled={!isClickable}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
              isCurrent && 'bg-accent/15 text-accent',
              isCompleted && !isCurrent && 'text-text-secondary hover:text-text-primary',
              !isCurrent && !isCompleted && isClickable && 'text-text-muted hover:text-text-secondary',
              !isClickable && 'text-text-muted/40 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono',
                isCurrent && 'bg-accent text-white',
                !isCurrent && status === 'observed' && 'bg-accent/20 text-accent',
                !isCurrent && status === 'mixed' && 'bg-warning/20 text-warning',
                !isCurrent && status === 'projected' && 'bg-surface-elevated text-text-muted',
                !isCurrent && !status && (isCompleted ? 'bg-success/20 text-success' : 'bg-surface-elevated text-text-muted')
              )}
            >
              {status ? STATUS_ICONS[status] : phase}
            </span>
            <span className="hidden lg:inline">{PHASE_LABELS[i]}</span>
            {status && (
              <span
                className={cn(
                  'hidden xl:inline text-[8px] font-mono uppercase',
                  status === 'observed' && 'text-accent/60',
                  status === 'mixed' && 'text-warning/60',
                  status === 'projected' && 'text-text-muted/40'
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            )}
          </button>
        );
      })}
      <div className="ml-auto">
        <Link
          href="/methodology"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-text-muted text-[10px] font-mono hover:text-text-secondary transition-colors"
          title="Methodology"
        >
          ?
        </Link>
      </div>
    </div>
  );
}
