import { describe, it, expect } from 'vitest';
import { buildGraph, validateGraph } from '@engine/graph';
import type { SimNode, BinaryNode, ContinuousNode } from '@engine/types';

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

function makeContinuousNode(id: string, phase: number, parents: string[] = []): ContinuousNode {
  return {
    id,
    phase,
    type: 'continuous',
    label: `Test ${id}`,
    description: `Test node ${id}`,
    parents,
    cpt: [],
    defaultDistribution: { type: 'normal', params: [50, 10] },
    unit: 'units',
    min: 0,
    max: 100,
    source: { citation: 'Test', url: 'https://test.com', confidence: 'high' },
  };
}

describe('buildGraph', () => {
  it('builds a graph with correct topological sort', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('c', 1, ['a', 'b']),
      makeBinaryNode('a', 1),
      makeBinaryNode('b', 1, ['a']),
    ];
    const graph = buildGraph(nodes);

    const idxA = graph.sortedIds.indexOf('a');
    const idxB = graph.sortedIds.indexOf('b');
    const idxC = graph.sortedIds.indexOf('c');
    expect(idxA).toBeLessThan(idxB);
    expect(idxB).toBeLessThan(idxC);
  });

  it('creates correct phaseNodes mapping', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1),
      makeBinaryNode('b', 1),
      makeBinaryNode('c', 2, ['a']),
    ];
    const graph = buildGraph(nodes);

    expect(graph.phaseNodes.get(1)).toEqual(expect.arrayContaining(['a', 'b']));
    expect(graph.phaseNodes.get(2)).toEqual(['c']);
  });

  it('stores all nodes in the nodes map', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1),
      makeBinaryNode('b', 1),
    ];
    const graph = buildGraph(nodes);
    expect(graph.nodes.size).toBe(2);
    expect(graph.nodes.get('a')?.id).toBe('a');
  });
});

describe('validateGraph', () => {
  it('returns no errors for a valid DAG', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1),
      makeBinaryNode('b', 1, ['a']),
    ];
    const graph = buildGraph(nodes);
    const errors = validateGraph(graph);
    expect(errors).toEqual([]);
  });

  it('detects missing parent references', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, ['nonexistent']),
    ];
    const graph = buildGraph(nodes);
    const errors = validateGraph(graph);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('nonexistent');
  });

  it('detects forward phase references (later phase as parent of earlier)', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 2),
      makeBinaryNode('b', 1, ['a']),
    ];
    const graph = buildGraph(nodes);
    const errors = validateGraph(graph);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('phase');
  });

  it('detects cycles', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, ['b']),
      makeBinaryNode('b', 1, ['a']),
    ];
    expect(() => buildGraph(nodes)).toThrow(/cycle/i);
  });

  it('detects duplicate node IDs', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1),
      makeBinaryNode('a', 1),
    ];
    expect(() => buildGraph(nodes)).toThrow(/duplicate/i);
  });

  it('detects continuous nodes with zero or negative range', () => {
    const zero = makeContinuousNode('zero', 1);
    zero.min = 5;
    zero.max = 5;
    const inverted = makeContinuousNode('inverted', 1);
    inverted.min = 10;
    inverted.max = 0;

    const errorsZero = validateGraph(buildGraph([zero]));
    expect(errorsZero.some((e) => e.includes('zero') && e.includes('range'))).toBe(true);

    const errorsInverted = validateGraph(buildGraph([inverted]));
    expect(errorsInverted.some((e) => e.includes('inverted') && e.includes('range'))).toBe(true);
  });

  it('detects CPT rows referencing parents not declared on the node', () => {
    const a = makeBinaryNode('a', 1);
    const b = makeBinaryNode('b', 1, ['a']);
    // CPT row references "ghost" — a parent that's not in node.parents.
    b.cpt = [{ parentValues: { a: 'true', ghost: 'true' }, pTrue: 0.9 }];

    const errors = validateGraph(buildGraph([a, b]));
    expect(errors.some((e) => e.includes('ghost'))).toBe(true);
  });

  it('accepts CPT rows with a subset of parents (partial-match for interpolation)', () => {
    // The interpolation design intentionally allows partial parentValues —
    // so a row with fewer keys than node.parents must NOT error.
    const a = makeBinaryNode('a', 1);
    const b = makeBinaryNode('b', 1);
    const c = makeBinaryNode('c', 1, ['a', 'b']);
    c.cpt = [
      { parentValues: { a: 'true' }, pTrue: 0.7 },
      { parentValues: { a: 'true', b: 'true' }, pTrue: 0.9 },
    ];

    const errors = validateGraph(buildGraph([a, b, c]));
    expect(errors).toEqual([]);
  });
});
