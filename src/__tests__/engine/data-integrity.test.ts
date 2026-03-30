import { describe, it, expect } from 'vitest';
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase2Nodes from '@data/nodes/phase-2-escalation.json';
import phase3Nodes from '@data/nodes/phase-3-conflict.json';
import phase4Nodes from '@data/nodes/phase-4-economic.json';
import phase5Nodes from '@data/nodes/phase-5-geopolitical.json';
import phase6Nodes from '@data/nodes/phase-6-humanitarian.json';
import phase7Nodes from '@data/nodes/phase-7-resolution.json';
import phase8Nodes from '@data/nodes/phase-8-aftermath.json';
import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import sources from '@data/sources.json';
import type { SimNode, ScenarioCard, BinaryNode, ContinuousNode, CategoricalNode } from '@engine/types';

const allPhases: { phase: number; nodes: SimNode[] }[] = [
  { phase: 1, nodes: phase1Nodes as unknown as SimNode[] },
  { phase: 2, nodes: phase2Nodes as unknown as SimNode[] },
  { phase: 3, nodes: phase3Nodes as unknown as SimNode[] },
  { phase: 4, nodes: phase4Nodes as unknown as SimNode[] },
  { phase: 5, nodes: phase5Nodes as unknown as SimNode[] },
  { phase: 6, nodes: phase6Nodes as unknown as SimNode[] },
  { phase: 7, nodes: phase7Nodes as unknown as SimNode[] },
  { phase: 8, nodes: phase8Nodes as unknown as SimNode[] },
];

const allNodes = allPhases.flatMap((p) => p.nodes);
const allNodeIds = new Set(allNodes.map((n) => n.id));

describe.each(allPhases)('Phase $phase node data integrity', ({ phase, nodes }) => {
  it('all nodes have required fields', () => {
    for (const node of nodes) {
      expect(node.id).toBeTruthy();
      expect(node.phase).toBe(phase);
      expect(['binary', 'continuous', 'categorical']).toContain(node.type);
      expect(node.label).toBeTruthy();
      expect(node.description).toBeTruthy();
      expect(Array.isArray(node.parents)).toBe(true);
      expect(node.source).toBeTruthy();
      expect(node.source.citation).toBeTruthy();
      expect(node.source.url).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(node.source.confidence);
    }
  });

  it('all node IDs are unique within phase', () => {
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all parent references point to existing nodes across all phases', () => {
    for (const node of nodes) {
      for (const parentId of node.parents) {
        expect(allNodeIds.has(parentId)).toBe(true);
      }
    }
  });

  it('no forward phase references', () => {
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
    for (const node of nodes) {
      for (const parentId of node.parents) {
        const parent = nodeMap.get(parentId);
        if (parent) {
          expect(parent.phase).toBeLessThanOrEqual(node.phase);
        }
      }
    }
  });

  it('categorical nodes have valid probability distributions', () => {
    for (const node of nodes) {
      if (node.type === 'categorical') {
        const catNode = node as unknown as CategoricalNode;
        const defaultSum = Object.values(catNode.defaultProbabilities).reduce((a, b) => a + b, 0);
        expect(defaultSum).toBeCloseTo(1.0, 2);

        for (const row of catNode.cpt) {
          if (row.categoryProbabilities) {
            const rowSum = Object.values(row.categoryProbabilities).reduce((a, b) => a + b, 0);
            expect(rowSum).toBeCloseTo(1.0, 2);
          }
        }
      }
    }
  });

  it('binary nodes have valid pTrue values', () => {
    for (const node of nodes) {
      if (node.type === 'binary') {
        const binNode = node as unknown as BinaryNode;
        expect(binNode.defaultPTrue).toBeGreaterThanOrEqual(0);
        expect(binNode.defaultPTrue).toBeLessThanOrEqual(1);

        for (const row of binNode.cpt) {
          if (row.pTrue !== undefined) {
            expect(row.pTrue).toBeGreaterThanOrEqual(0);
            expect(row.pTrue).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it('continuous nodes have valid min/max ranges', () => {
    for (const node of nodes) {
      if (node.type === 'continuous') {
        const contNode = node as unknown as ContinuousNode;
        expect(contNode.min).toBeLessThan(contNode.max);
        expect(contNode.unit).toBeTruthy();
      }
    }
  });
});

describe('Cross-phase node ID uniqueness', () => {
  it('all node IDs are unique across all phases', () => {
    const ids = allNodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Phase 1 scenario card data integrity', () => {
  const scenarios = phase1Scenarios as unknown as ScenarioCard[];
  const nodeIds = new Set(allPhases[0].nodes.map((n) => n.id));

  it('all scenarios have required fields', () => {
    for (const scenario of scenarios) {
      expect(scenario.id).toBeTruthy();
      expect(scenario.phase).toBe(1);
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(Array.isArray(scenario.overrides)).toBe(true);
      expect(scenario.overrides.length).toBeGreaterThan(0);
    }
  });

  it('all scenario IDs are unique', () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all override nodeIds reference existing nodes', () => {
    for (const scenario of scenarios) {
      for (const override of scenario.overrides) {
        expect(nodeIds.has(override.nodeId)).toBe(true);
      }
    }
  });

  it('override probability distributions sum to ~1', () => {
    for (const scenario of scenarios) {
      for (const override of scenario.overrides) {
        if (override.overrideProbabilities) {
          const sum = Object.values(override.overrideProbabilities).reduce((a, b) => a + b, 0);
          expect(sum).toBeCloseTo(1.0, 2);
        }
      }
    }
  });
});

describe('Sources bibliography', () => {
  it('all sources have required fields', () => {
    for (const source of sources.sources) {
      expect(source.id).toBeTruthy();
      expect(source.title).toBeTruthy();
      expect(source.publisher).toBeTruthy();
      expect(source.url).toBeTruthy();
      expect(source.type).toBeTruthy();
      expect(Array.isArray(source.usedFor)).toBe(true);
      expect(source.usedFor.length).toBeGreaterThan(0);
    }
  });

  it('all source IDs are unique', () => {
    const ids = sources.sources.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
