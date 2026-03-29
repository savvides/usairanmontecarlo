'use client';

import { cn } from '@/lib/utils';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  completedPhases: Set<number>;
  canNavigateFreely: boolean;
  onPhaseClick: (phase: number) => void;
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

export function PhaseProgress({
  currentPhase,
  totalPhases,
  completedPhases,
  canNavigateFreely,
  onPhaseClick,
}: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-surface border-b border-border">
      {Array.from({ length: totalPhases }, (_, i) => {
        const phase = i + 1;
        const isCurrent = phase === currentPhase;
        const isCompleted = completedPhases.has(phase);
        const isClickable = canNavigateFreely || isCompleted || phase <= currentPhase;

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
                isCompleted && !isCurrent && 'bg-success/20 text-success',
                !isCurrent && !isCompleted && 'bg-surface-elevated text-text-muted'
              )}
            >
              {phase}
            </span>
            <span className="hidden lg:inline">{PHASE_LABELS[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
