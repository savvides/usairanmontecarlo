'use client';

import { motion } from 'framer-motion';
import type { ScenarioCard as ScenarioCardType } from '@engine/types';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  scenario: ScenarioCardType;
  isSelected: boolean;
  onSelect: (scenario: ScenarioCardType) => void;
}

export function ScenarioCard({ scenario, isSelected, onSelect }: ScenarioCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(scenario)}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition-colors',
        isSelected
          ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(74,139,181,0.15)]'
          : 'border-border bg-surface hover:border-text-muted hover:bg-surface-elevated'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      <h3
        className={cn(
          'text-sm font-semibold',
          isSelected ? 'text-accent' : 'text-text-primary'
        )}
      >
        {scenario.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
        {scenario.description}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-text-muted">
          {scenario.overrides.length} variable{scenario.overrides.length !== 1 ? 's' : ''} affected
        </span>
      </div>
    </motion.button>
  );
}
