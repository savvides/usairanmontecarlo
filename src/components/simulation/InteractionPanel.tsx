'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScenarioCard } from '@/components/cards/ScenarioCard';
import type { ScenarioCard as ScenarioCardType } from '@engine/types';

interface InteractionPanelProps {
  scenarios: ScenarioCardType[];
  selectedScenarioId: string | null;
  onSelectScenario: (scenario: ScenarioCardType) => void;
  phase: number;
  onAdvance: () => void;
  canAdvance: boolean;
}

export function InteractionPanel({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  phase,
  onAdvance,
  canAdvance,
}: InteractionPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex h-full flex-col overflow-y-auto p-5"
      >
        {scenarios.length > 0 ? (
          <>
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
              Scenario Selection
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Choose a scenario to see how it shifts the probability landscape.
            </p>
            <div className="flex-1 space-y-3">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={scenario.id === selectedScenarioId}
                  onSelect={onSelectScenario}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1">
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
              Historical Record
            </h3>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs leading-relaxed text-text-secondary">
                This phase reflects observed events from the 2026 conflict. The data is locked to what actually happened — no scenario adjustments are available.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Interactive scenario cards become available from Phase 3 onward, where the simulation projects forward from known facts.
              </p>
            </div>
          </div>
        )}

        {canAdvance && (
          <button
            onClick={onAdvance}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Continue to Next Phase
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
