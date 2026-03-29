'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { usePhase } from '@/hooks/usePhase';
import { PhaseProgress } from './PhaseProgress';
import { ContextPanel } from './ContextPanel';
import { InteractionPanel } from './InteractionPanel';
import { ResultsPanel } from './ResultsPanel';
import { getPhaseContent } from '@/lib/phase-content';
import { CascadeStrip } from './CascadeStrip';
import { cn } from '@/lib/utils';
import type { SimNode, ScenarioCard as ScenarioCardType } from '@engine/types';

interface SimulationShellProps {
  nodes: SimNode[];
  scenarios: ScenarioCardType[];
}

export function SimulationShell({ nodes, scenarios }: SimulationShellProps) {
  const phase = usePhase();
  const simulation = useSimulation(nodes);

  // Run simulation on mount and whenever scenarios change
  useEffect(() => {
    simulation.run(1000);
  }, [simulation.run]);

  const content = getPhaseContent(phase.currentPhase);
  const phaseScenarios = useMemo(
    () => scenarios.filter((s) => s.phase === phase.currentPhase),
    [scenarios, phase.currentPhase]
  );
  const selectedScenario = simulation.selectedScenarios.get(phase.currentPhase);
  const phaseResults = simulation.getPhaseResults(phase.currentPhase);

  const phaseNodes = useMemo(() => {
    const phaseNodeIds = simulation.activeGraph.phaseNodes.get(phase.currentPhase) ?? [];
    return phaseNodeIds
      .map((id) => simulation.activeGraph.nodes.get(id))
      .filter((n): n is SimNode => n !== undefined);
  }, [simulation.activeGraph, phase.currentPhase]);

  const [mobileView, setMobileView] = useState<'cards' | 'results'>('cards');

  const handleSelectScenario = (scenario: ScenarioCardType) => {
    if (selectedScenario?.id === scenario.id) {
      simulation.clearScenario(phase.currentPhase);
    } else {
      simulation.selectScenario(scenario);
    }
    setTimeout(() => simulation.run(1000), 0);
  };

  if (!content) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-text-muted">Phase {phase.currentPhase} content coming soon</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <PhaseProgress
        currentPhase={phase.currentPhase}
        totalPhases={phase.totalPhases}
        completedPhases={phase.completedPhases}
        canNavigateFreely={phase.canNavigateFreely}
        onPhaseClick={phase.goToPhase}
      />

      {/* Mobile view toggle */}
      <div className="flex md:hidden border-b border-border">
        <button
          onClick={() => setMobileView('cards')}
          className={cn(
            'flex-1 py-2 text-xs font-medium transition-colors',
            mobileView === 'cards' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'
          )}
        >
          Scenarios
        </button>
        <button
          onClick={() => setMobileView('results')}
          className={cn(
            'flex-1 py-2 text-xs font-medium transition-colors',
            mobileView === 'results' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'
          )}
        >
          Results
        </button>
      </div>

      {/* Three-panel layout — responsive */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Context — hidden below lg */}
        <div className="hidden lg:block w-[320px] border-r border-border flex-shrink-0">
          <ContextPanel content={content} />
        </div>

        {/* Center: Interaction — shows on mobile when 'cards' selected */}
        <div className={cn(
          'md:w-[280px] lg:w-[320px] md:border-r border-border flex-shrink-0',
          mobileView === 'cards' ? 'block w-full' : 'hidden md:block'
        )}>
          <InteractionPanel
            scenarios={phaseScenarios}
            selectedScenarioId={selectedScenario?.id ?? null}
            onSelectScenario={handleSelectScenario}
            phase={phase.currentPhase}
            onAdvance={phase.advancePhase}
            canAdvance={phase.canAdvance}
          />
        </div>

        {/* Right: Results — shows on mobile when 'results' selected */}
        <div className={cn(
          'flex-1',
          mobileView === 'results' ? 'block' : 'hidden md:block'
        )}>
          <ResultsPanel
            nodes={phaseNodes}
            phaseResults={phaseResults}
            phase={phase.currentPhase}
            isRunning={simulation.isRunning}
          />
        </div>
      </div>

      <CascadeStrip
        graph={simulation.activeGraph}
        result={simulation.result}
        currentPhase={phase.currentPhase}
      />
    </div>
  );
}
