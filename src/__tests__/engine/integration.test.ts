import { describe, it, expect } from 'vitest';
import { buildGraph, validateGraph, runSimulation, applyScenario } from '@engine/index';
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import type { SimNode, ScenarioCard } from '@engine/types';

const nodes = phase1Nodes as unknown as SimNode[];
const scenarios = phase1Scenarios as unknown as ScenarioCard[];

describe('Phase 1 end-to-end integration', () => {
  it('builds a valid graph from Phase 1 data', () => {
    const graph = buildGraph(nodes);
    expect(graph.nodes.size).toBe(nodes.length);
    expect(graph.sortedIds.length).toBe(nodes.length);

    const errors = validateGraph(graph);
    expect(errors).toEqual([]);
  });

  it('runs 1000 simulations with default parameters', () => {
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 1000, 42);

    expect(result.runCount).toBe(1000);
    expect(result.runs.length).toBe(1000);
    expect(result.nodeIndexMap.size).toBe(nodes.length);

    for (const run of result.runs) {
      expect(run.length).toBe(nodes.length);
    }
  });

  it('produces different outcome distributions for different scenario cards', () => {
    const graph = buildGraph(nodes);

    const defaultResult = runSimulation(graph, 5000, 42);

    const nuclearScenario = scenarios.find((s) => s.id === 'nuclear-breakout-detected')!;
    const nuclearGraph = applyScenario(graph, nuclearScenario);
    const nuclearResult = runSimulation(nuclearGraph, 5000, 42);

    const triggerIdx = graph.sortedIds.indexOf('escalation_trigger_probability');

    let defaultTriggerRate = 0;
    for (let i = 0; i < 5000; i++) {
      defaultTriggerRate += defaultResult.runs[i][triggerIdx];
    }
    defaultTriggerRate /= 5000;

    let nuclearTriggerRate = 0;
    for (let i = 0; i < 5000; i++) {
      nuclearTriggerRate += nuclearResult.runs[i][triggerIdx];
    }
    nuclearTriggerRate /= 5000;

    expect(nuclearTriggerRate).toBeGreaterThan(defaultTriggerRate);
  });

  it('runs 10000 simulations in under 1 second', () => {
    const graph = buildGraph(nodes);
    const start = performance.now();
    runSimulation(graph, 10000, 42);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('deterministic: same seed produces identical results', () => {
    const graph = buildGraph(nodes);
    const result1 = runSimulation(graph, 100, 42);
    const result2 = runSimulation(graph, 100, 42);

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < nodes.length; j++) {
        expect(result1.runs[i][j]).toBe(result2.runs[i][j]);
      }
    }
  });

  it('each scenario card produces valid results', () => {
    const graph = buildGraph(nodes);

    for (const scenario of scenarios) {
      const modified = applyScenario(graph, scenario);
      const result = runSimulation(modified, 100, 42);
      expect(result.runCount).toBe(100);

      for (const run of result.runs) {
        for (let j = 0; j < run.length; j++) {
          expect(Number.isNaN(run[j])).toBe(false);
        }
      }
    }
  });
});
