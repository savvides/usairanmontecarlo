import { describe, it, expect } from 'vitest';
import { buildGraph, validateGraph, runSimulation, applyScenario } from '@engine/index';
import type { SimNode, ScenarioCard } from '@engine/types';

// Load all phase data
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase2Nodes from '@data/nodes/phase-2-escalation.json';
import phase3Nodes from '@data/nodes/phase-3-conflict.json';
import phase3Scenarios from '@data/scenarios/phase-3-scenarios.json';

const allNodes = [
  ...phase1Nodes,
  ...phase2Nodes,
  ...phase3Nodes,
] as unknown as SimNode[];

const scenarios = phase3Scenarios as unknown as ScenarioCard[];

describe('Multi-phase end-to-end integration', () => {
  it('builds a valid graph from Phase 1-3 data', () => {
    const graph = buildGraph(allNodes);
    expect(graph.nodes.size).toBe(allNodes.length);
    expect(graph.sortedIds.length).toBe(allNodes.length);

    const errors = validateGraph(graph);
    expect(errors).toEqual([]);
  });

  it('runs 1000 simulations with default parameters', () => {
    const graph = buildGraph(allNodes);
    const result = runSimulation(graph, 1000, 42);

    expect(result.runCount).toBe(1000);
    expect(result.runs.length).toBe(1000);
    expect(result.nodeIndexMap.size).toBe(allNodes.length);

    for (const run of result.runs) {
      expect(run.length).toBe(allNodes.length);
    }
  });

  it('produces different outcome distributions for different scenario cards', () => {
    const graph = buildGraph(allNodes);

    const defaultResult = runSimulation(graph, 5000, 42);

    // Use first Phase 3 scenario card (Phase 1-2 have no scenarios — historical data)
    const scenario = scenarios[0];
    expect(scenario).toBeDefined();
    const modifiedGraph = applyScenario(graph, scenario);
    const scenarioResult = runSimulation(modifiedGraph, 5000, 42);

    // Find a Phase 3 node that should be affected by the scenario
    const overriddenNodeId = scenario.overrides[0].nodeId;
    const nodeIdx = graph.sortedIds.indexOf(overriddenNodeId);
    expect(nodeIdx).toBeGreaterThanOrEqual(0);

    // Compute means for the overridden node
    let defaultMean = 0;
    let scenarioMean = 0;
    for (let i = 0; i < 5000; i++) {
      defaultMean += defaultResult.runs[i][nodeIdx];
      scenarioMean += scenarioResult.runs[i][nodeIdx];
    }
    defaultMean /= 5000;
    scenarioMean /= 5000;

    // The scenario should shift the distribution
    expect(Math.abs(scenarioMean - defaultMean)).toBeGreaterThan(0.01);
  });

  it('runs 10000 simulations in under 2 seconds', () => {
    const graph = buildGraph(allNodes);
    const start = performance.now();
    runSimulation(graph, 10000, 42);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('deterministic: same seed produces identical results', () => {
    const graph = buildGraph(allNodes);
    const result1 = runSimulation(graph, 100, 42);
    const result2 = runSimulation(graph, 100, 42);

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < allNodes.length; j++) {
        expect(result1.runs[i][j]).toBe(result2.runs[i][j]);
      }
    }
  });

  it('each scenario card produces valid results', () => {
    const graph = buildGraph(allNodes);

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

  it('diagnostics track match quality correctly', () => {
    const graph = buildGraph(allNodes);
    const result = runSimulation(graph, 1000, 42);

    // Every node should have diagnostics
    for (const nodeId of graph.sortedIds) {
      const diag = result.diagnostics.nodes.get(nodeId);
      expect(diag).toBeDefined();
      expect(diag!.exact + diag!.interpolated + diag!.default).toBe(1000);
    }
  });
});
