import { describe, it, expect } from 'vitest';
import { buildGraph, runSimulation } from '@engine/index';
import type { SimNode } from '@engine/types';

import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase2Nodes from '@data/nodes/phase-2-escalation.json';
import phase3Nodes from '@data/nodes/phase-3-conflict.json';
import phase4Nodes from '@data/nodes/phase-4-economic.json';
import phase5Nodes from '@data/nodes/phase-5-geopolitical.json';
import phase6Nodes from '@data/nodes/phase-6-humanitarian.json';
import phase7Nodes from '@data/nodes/phase-7-resolution.json';
import phase8Nodes from '@data/nodes/phase-8-aftermath.json';

const allNodes = [
  ...phase1Nodes,
  ...phase2Nodes,
  ...phase3Nodes,
  ...phase4Nodes,
  ...phase5Nodes,
  ...phase6Nodes,
  ...phase7Nodes,
  ...phase8Nodes,
] as unknown as SimNode[];

describe('August 2026 default-run histograms (no scenario overrides)', () => {
  it('samples oil near $92 and ground escalation near 0.28, not March CPT cells', () => {
    const graph = buildGraph(allNodes);
    const result = runSimulation(graph, 1000, 42);

    const oilIdx = result.nodeIndexMap.get('oil_price_current');
    const groundIdx = result.nodeIndexMap.get('ground_escalation_probability');
    expect(oilIdx).toBeDefined();
    expect(groundIdx).toBeDefined();

    let oilSum = 0;
    let groundTrue = 0;
    for (let i = 0; i < result.runCount; i++) {
      oilSum += result.runs[i][oilIdx!];
      if (result.runs[i][groundIdx!] === 1) groundTrue++;
    }

    const oilMean = oilSum / result.runCount;
    const groundRate = groundTrue / result.runCount;

    expect(oilMean).toBeGreaterThanOrEqual(70);
    expect(oilMean).toBeLessThanOrEqual(110);
    expect(groundRate).toBeLessThan(0.45);
  });
});
