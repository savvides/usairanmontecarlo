'use client';

import { useEffect, useMemo } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { usePhase } from '@/hooks/usePhase';
import { PhaseProgress } from './PhaseProgress';
import { ContextPanel } from './ContextPanel';
import { InteractionPanel } from './InteractionPanel';
import { ResultsPanel } from './ResultsPanel';
import { getPhaseContent } from '@/lib/phase-content';
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[320px] border-r border-border flex-shrink-0">
          <ContextPanel content={content} />
        </div>

        <div className="w-[320px] border-r border-border flex-shrink-0">
          <InteractionPanel
            scenarios={phaseScenarios}
            selectedScenarioId={selectedScenario?.id ?? null}
            onSelectScenario={handleSelectScenario}
            phase={phase.currentPhase}
            onAdvance={phase.advancePhase}
            canAdvance={phase.canAdvance}
          />
        </div>

        <div className="flex-1">
          <ResultsPanel
            nodes={phaseNodes}
            phaseResults={phaseResults}
            phase={phase.currentPhase}
            isRunning={simulation.isRunning}
          />
        </div>
      </div>
    </div>
  );
}
