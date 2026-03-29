import { describe, it, expect } from 'vitest';
import { sampleOnce, runSimulation } from '@engine/sampler';
import { buildGraph } from '@engine/graph';
import type { BinaryNode, ContinuousNode, CategoricalNode, SimNode } from '@engine/types';

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

function makeBinaryNodeWithCpt(
  id: string,
  phase: number,
  parents: string[],
  cpt: BinaryNode['cpt'],
  defaultPTrue = 0.5
): BinaryNode {
  return {
    id,
    phase,
    type: 'binary',
    label: `Test ${id}`,
    description: `Test node ${id}`,
    parents,
    cpt,
    defaultPTrue,
    source: { citation: 'Test', url: 'https://test.com', confidence: 'high' },
  };
}

describe('sampleOnce', () => {
  it('samples root binary nodes using defaultPTrue', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 1.0)];
    const graph = buildGraph(nodes);
    const result = sampleOnce(graph, 'test-seed');
    const nodeIndex = graph.sortedIds.indexOf('a');
    expect(result[nodeIndex]).toBe(1);
  });

  it('propagates through a simple chain using CPT', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0),
      makeBinaryNodeWithCpt('b', 1, ['a'], [
        { parentValues: { a: 'true' }, pTrue: 0.9 },
        { parentValues: { a: 'false' }, pTrue: 0.1 },
      ]),
    ];
    const graph = buildGraph(nodes);

    let bTrueCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      const result = sampleOnce(graph, `seed-${i}`);
      const bIdx = graph.sortedIds.indexOf('b');
      if (result[bIdx] === 1) bTrueCount++;
    }
    expect(bTrueCount / runs).toBeCloseTo(0.9, 1);
  });
});

describe('runSimulation', () => {
  it('returns correct number of runs', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.5)];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 1000, 42);
    expect(result.runCount).toBe(1000);
    expect(result.runs.length).toBe(1000);
  });

  it('produces deterministic results with the same seed', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 0.5),
      makeBinaryNode('b', 1, ['a'], 0.5),
    ];
    const graph = buildGraph(nodes);

    const result1 = runSimulation(graph, 100, 42);
    const result2 = runSimulation(graph, 100, 42);

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < graph.sortedIds.length; j++) {
        expect(result1.runs[i][j]).toBe(result2.runs[i][j]);
      }
    }
  });

  it('produces different results with different seeds', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.5)];
    const graph = buildGraph(nodes);

    const result1 = runSimulation(graph, 1000, 42);
    const result2 = runSimulation(graph, 1000, 99);

    let diffCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (result1.runs[i][0] !== result2.runs[i][0]) diffCount++;
    }
    expect(diffCount).toBeGreaterThan(0);
  });

  it('nodeIndexMap maps node IDs to correct indices', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('x', 1),
      makeBinaryNode('y', 1, ['x']),
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 10, 42);

    expect(result.nodeIndexMap.get('x')).toBe(graph.sortedIds.indexOf('x'));
    expect(result.nodeIndexMap.get('y')).toBe(graph.sortedIds.indexOf('y'));
  });
});
