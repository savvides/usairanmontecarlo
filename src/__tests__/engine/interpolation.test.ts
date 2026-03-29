import { describe, it, expect } from 'vitest';
import { sampleOnce, runSimulation } from '@engine/sampler';
import { buildGraph } from '@engine/graph';
import type { SimNode, BinaryNode, CategoricalNode } from '@engine/types';

function makeBinaryNode(id: string, phase: number, parents: string[] = [], defaultPTrue = 0.5): BinaryNode {
  return {
    id, phase, type: 'binary', label: `Test ${id}`, description: `Test node ${id}`,
    parents, cpt: [], defaultPTrue,
    source: { citation: 'Test', url: 'https://test.com', confidence: 'high' },
  };
}

function makeCategoricalNode(
  id: string, phase: number, parents: string[], categories: string[],
  cpt: CategoricalNode['cpt'], defaultProbabilities: Record<string, number>
): CategoricalNode {
  return {
    id, phase, type: 'categorical', label: `Test ${id}`, description: `Test node ${id}`,
    parents, categories, cpt, defaultProbabilities,
    source: { citation: 'Test', url: 'https://test.com', confidence: 'high' },
  };
}

describe('CPT interpolation', () => {
  it('uses exact match when available (backwards compatible)', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0),
      {
        ...makeBinaryNode('b', 1, ['a'], 0.1),
        cpt: [
          { parentValues: { a: 'true' }, pTrue: 0.9 },
          { parentValues: { a: 'false' }, pTrue: 0.1 },
        ],
      } as BinaryNode,
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 5000, 42);
    const bIdx = result.nodeIndexMap.get('b')!;
    let trueCount = 0;
    for (let i = 0; i < 5000; i++) {
      if (result.runs[i][bIdx] === 1) trueCount++;
    }
    expect(trueCount / 5000).toBeCloseTo(0.9, 1);
  });

  it('interpolates when no exact CPT match exists', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0),
      makeBinaryNode('b', 1, [], 1.0),
      {
        ...makeBinaryNode('c', 1, ['a', 'b'], 0.1),
        cpt: [
          { parentValues: { a: 'true', b: 'false' }, pTrue: 0.8 },
          { parentValues: { a: 'false', b: 'true' }, pTrue: 0.7 },
        ],
      } as BinaryNode,
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 5000, 42);
    const cIdx = result.nodeIndexMap.get('c')!;
    let trueCount = 0;
    for (let i = 0; i < 5000; i++) {
      if (result.runs[i][cIdx] === 1) trueCount++;
    }
    const rate = trueCount / 5000;
    // Interpolated: row1 matches a=true (1/2), row2 matches b=true (1/2)
    // Blended pTrue = 0.5*0.8 + 0.5*0.7 = 0.75
    expect(rate).toBeGreaterThan(0.5);
    expect(rate).toBeLessThan(0.95);
  });

  it('falls back to defaults when no CPT row matches any parent', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0),
      {
        ...makeBinaryNode('b', 1, ['a'], 0.3),
        cpt: [
          { parentValues: { a: 'false' }, pTrue: 0.9 },
        ],
      } as BinaryNode,
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 5000, 42);
    const bIdx = result.nodeIndexMap.get('b')!;
    let trueCount = 0;
    for (let i = 0; i < 5000; i++) {
      if (result.runs[i][bIdx] === 1) trueCount++;
    }
    expect(trueCount / 5000).toBeCloseTo(0.3, 1);
  });

  it('interpolates categorical probability vectors', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0),
      makeBinaryNode('b', 1, [], 1.0),
      makeCategoricalNode('c', 1, ['a', 'b'], ['low', 'high'],
        [
          { parentValues: { a: 'true', b: 'false' }, categoryProbabilities: { low: 0.2, high: 0.8 } },
          { parentValues: { a: 'false', b: 'true' }, categoryProbabilities: { low: 0.6, high: 0.4 } },
        ],
        { low: 0.5, high: 0.5 }
      ),
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 5000, 42);
    const cIdx = result.nodeIndexMap.get('c')!;
    let lowCount = 0;
    for (let i = 0; i < 5000; i++) {
      if (result.runs[i][cIdx] === 0) lowCount++;
    }
    expect(lowCount / 5000).toBeCloseTo(0.4, 1);
  });

  it('tracks diagnostics correctly', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 0.5),
      {
        ...makeBinaryNode('b', 1, ['a'], 0.5),
        cpt: [
          { parentValues: { a: 'true' }, pTrue: 0.9 },
        ],
      } as BinaryNode,
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 1000, 42);
    const aDiag = result.diagnostics.nodes.get('a')!;
    expect(aDiag.exact).toBe(1000);
    expect(aDiag.interpolated).toBe(0);
    expect(aDiag.default).toBe(0);
    const bDiag = result.diagnostics.nodes.get('b')!;
    expect(bDiag.exact).toBeGreaterThan(300);
    expect(bDiag.exact + bDiag.interpolated + bDiag.default).toBe(1000);
  });
});
