import { describe, it, expect } from 'vitest';
import { buildGraph } from '@engine/graph';
import { runSimulation } from '@engine/sampler';
import type { SimNode, BinaryNode } from '@engine/types';

// Note: Web Workers can't be tested in Node.js directly.
// We test the simulation logic that the worker wraps.
// Worker integration is tested manually or in browser tests.

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

describe('worker simulation logic (non-worker test)', () => {
  it('can run 10000 simulations without error', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 0.5),
      makeBinaryNode('b', 1, ['a'], 0.5),
      makeBinaryNode('c', 1, ['a', 'b'], 0.5),
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 10000, 42);
    expect(result.runCount).toBe(10000);
    expect(result.runs.length).toBe(10000);
  });

  it('10000 run results are statistically valid', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 0.7),
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 10000, 42);

    const aIdx = result.nodeIndexMap.get('a')!;
    let trueCount = 0;
    for (let i = 0; i < 10000; i++) {
      if (result.runs[i][aIdx] === 1) trueCount++;
    }
    expect(trueCount / 10000).toBeCloseTo(0.7, 1);
  });

  it('runs complete in under 500ms for 10000 iterations with 11 nodes', () => {
    const nodes: SimNode[] = [];
    for (let i = 0; i < 11; i++) {
      const parents = i > 0 ? [`node_${i - 1}`] : [];
      nodes.push(makeBinaryNode(`node_${i}`, 1, parents, 0.5));
    }
    const graph = buildGraph(nodes);

    const start = performance.now();
    runSimulation(graph, 10000, 42);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
  });
});
