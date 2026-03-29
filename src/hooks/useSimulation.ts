'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { buildGraph, runSimulation, applyScenario } from '@engine/index';
import type { SimNode, SimGraph, SimulationResult, ScenarioCard } from '@engine/types';

export interface PhaseResults {
  distributions: Map<string, number[]>;
  stats: Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>;
}

function computeStats(values: number[]): { mean: number; min: number; max: number; p10: number; p90: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    mean,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p10: sorted[Math.floor(sorted.length * 0.1)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
  };
}

function extractPhaseResults(
  result: SimulationResult,
  graph: SimGraph,
  phase: number
): PhaseResults {
  const phaseNodeIds = graph.phaseNodes.get(phase) ?? [];
  const distributions = new Map<string, number[]>();
  const stats = new Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>();

  for (const nodeId of phaseNodeIds) {
    const idx = result.nodeIndexMap.get(nodeId)!;
    const values: number[] = [];
    for (let i = 0; i < result.runCount; i++) {
      values.push(result.runs[i][idx]);
    }
    distributions.set(nodeId, values);
    stats.set(nodeId, computeStats(values));
  }

  return { distributions, stats };
}

export function useSimulation(nodes: SimNode[]) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<Map<number, ScenarioCard>>(new Map());

  const baseGraph = useMemo(() => {
    return buildGraph(nodes);
  }, [nodes]);

  const activeGraph = useMemo(() => {
    let g = baseGraph;
    for (const scenario of selectedScenarios.values()) {
      g = applyScenario(g, scenario);
    }
    return g;
  }, [baseGraph, selectedScenarios]);

  const run = useCallback(
    (runCount: number = 1000, seed: number = Date.now()) => {
      setIsRunning(true);
      requestAnimationFrame(() => {
        const r = runSimulation(activeGraph, runCount, seed);
        setResult(r);
        setIsRunning(false);
      });
    },
    [activeGraph]
  );

  const selectScenario = useCallback((scenario: ScenarioCard) => {
    setSelectedScenarios((prev) => {
      const next = new Map(prev);
      next.set(scenario.phase, scenario);
      return next;
    });
  }, []);

  const clearScenario = useCallback((phase: number) => {
    setSelectedScenarios((prev) => {
      const next = new Map(prev);
      next.delete(phase);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSelectedScenarios(new Map());
    setResult(null);
  }, []);

  const getPhaseResults = useCallback(
    (phase: number): PhaseResults | null => {
      if (!result) return null;
      return extractPhaseResults(result, activeGraph, phase);
    },
    [result, activeGraph]
  );

  return {
    baseGraph,
    activeGraph,
    result,
    isRunning,
    selectedScenarios,
    run,
    selectScenario,
    clearScenario,
    resetAll,
    getPhaseResults,
  };
}
