'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { buildGraph, runSimulation, applyScenario } from '@engine/index';
import { SimulationWorker } from '@engine/worker-client';
import type { SimNode, SimGraph, SimulationResult, ScenarioCard } from '@engine/types';
import { computeNodeConfidence, getConfidenceTier, type ConfidenceTier } from '@/lib/confidence';

export interface PhaseResults {
  distributions: Map<string, number[]>;
  stats: Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>;
  confidence: Map<string, { score: number; tier: ConfidenceTier }>;
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
  const confidence = new Map<string, { score: number; tier: ConfidenceTier }>();

  for (const nodeId of phaseNodeIds) {
    const idx = result.nodeIndexMap.get(nodeId)!;
    const node = graph.nodes.get(nodeId)!;
    const values: number[] = [];
    for (let i = 0; i < result.runCount; i++) {
      values.push(result.runs[i][idx]);
    }
    distributions.set(nodeId, values);
    const nodeStats = computeStats(values);
    stats.set(nodeId, nodeStats);

    const diag = result.diagnostics.nodes.get(nodeId);
    if (diag) {
      let minCategoryCount: number | undefined;
      if (node.type === 'categorical') {
        const catCounts = node.categories.map((_, catIdx) =>
          values.filter((v) => v === catIdx).length
        );
        minCategoryCount = Math.min(...catCounts);
      }
      const score = computeNodeConfidence(
        diag,
        result.runCount,
        node.type,
        nodeStats.mean,
        node.source,
        minCategoryCount
      );
      confidence.set(nodeId, { score, tier: getConfidenceTier(score) });
    }
  }

  return { distributions, stats, confidence };
}

export function useSimulation(nodes: SimNode[]) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<Map<number, ScenarioCard>>(new Map());

  const workerRef = useRef<SimulationWorker | null>(null);
  const latestRunIdRef = useRef(0);

  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    let raw: Worker | null = null;
    try {
      // Construct the Worker at the call site so the bundler can statically
      // detect new Worker(new URL(...)) and transpile the worker entrypoint.
      raw = new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' });
      const wrapper = new SimulationWorker();
      wrapper.attach(raw, () => {
        // Worker failed to load/run — drop wrapper so run() falls back to main thread.
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsRunning(false);
      });
      workerRef.current = wrapper;
    } catch {
      raw?.terminate();
      workerRef.current = null;
    }
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

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
      const myId = ++latestRunIdRef.current;
      setIsRunning(true);

      const worker = workerRef.current;
      if (worker) {
        worker.run(activeGraph, [], runCount, seed).then((r) => {
          if (myId !== latestRunIdRef.current) return; // stale — newer run dispatched
          setResult(r);
          setIsRunning(false);
        });
        return;
      }

      // Fallback: no Worker available (SSR, tests, unsupported env). Run on main thread.
      requestAnimationFrame(() => {
        if (myId !== latestRunIdRef.current) return;
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
