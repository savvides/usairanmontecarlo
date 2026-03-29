import { describe, it, expect } from 'vitest';
import { applyScenario, resetOverrides } from '@engine/scenario';
import { buildGraph } from '@engine/graph';
import { runSimulation } from '@engine/sampler';
import type { SimNode, BinaryNode, ScenarioCard, NodeOverride } from '@engine/types';

function makeBinaryNode(id: string, phase: number, parents: string[] = [], defaultPTrue = 0.5): BinaryNode {
  return {
    id,
    phase,
    type: 'binary',
    label: `Test ${id}`,
    description: `Test node ${id}`,
    parents,
    cpt: [],
    defaultPTrue,
    source: { citation: 'Test', url: 'https://test.com', confidence: 'high' },
  };
}

describe('applyScenario', () => {
  it('clamps a binary node to true', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.0)];
    const graph = buildGraph(nodes);

    const scenario: ScenarioCard = {
      id: 'test-scenario',
      phase: 1,
      title: 'Test',
      description: 'Test scenario',
      overrides: [{ nodeId: 'a', clampValue: true }],
    };

    const modified = applyScenario(graph, scenario);
    const result = runSimulation(modified, 100, 42);

    const aIdx = modified.sortedIds.indexOf('a');
    for (let i = 0; i < 100; i++) {
      expect(result.runs[i][aIdx]).toBe(1);
    }
  });

  it('overrides pTrue for a binary node', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.0)];
    const graph = buildGraph(nodes);

    const scenario: ScenarioCard = {
      id: 'test-scenario',
      phase: 1,
      title: 'Test',
      description: 'Test scenario',
      overrides: [{ nodeId: 'a', overridePTrue: 0.8 }],
    };

    const modified = applyScenario(graph, scenario);
    const result = runSimulation(modified, 10000, 42);

    const aIdx = modified.sortedIds.indexOf('a');
    let trueCount = 0;
    for (let i = 0; i < 10000; i++) {
      if (result.runs[i][aIdx] === 1) trueCount++;
    }
    expect(trueCount / 10000).toBeCloseTo(0.8, 1);
  });

  it('does not mutate the original graph', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.3)];
    const graph = buildGraph(nodes);

    const scenario: ScenarioCard = {
      id: 'test-scenario',
      phase: 1,
      title: 'Test',
      description: 'Test scenario',
      overrides: [{ nodeId: 'a', overridePTrue: 0.9 }],
    };

    applyScenario(graph, scenario);
    expect((graph.nodes.get('a') as BinaryNode).defaultPTrue).toBe(0.3);
  });
});

describe('resetOverrides', () => {
  it('returns a graph equivalent to the original', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.5)];
    const graph = buildGraph(nodes);

    const scenario: ScenarioCard = {
      id: 'test-scenario',
      phase: 1,
      title: 'Test',
      description: 'Test scenario',
      overrides: [{ nodeId: 'a', clampValue: true }],
    };

    const modified = applyScenario(graph, scenario);
    const reset = resetOverrides(modified, graph);

    const result = runSimulation(reset, 10000, 42);
    const aIdx = reset.sortedIds.indexOf('a');
    let trueCount = 0;
    for (let i = 0; i < 10000; i++) {
      if (result.runs[i][aIdx] === 1) trueCount++;
    }
    expect(trueCount / 10000).toBeCloseTo(0.5, 1);
  });
});
