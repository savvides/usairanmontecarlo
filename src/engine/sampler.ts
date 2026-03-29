import seedrandom from 'seedrandom';
import type {
  SimGraph, SimNode, RunResult, SimulationResult, CptRow,
  MatchQuality, NodeDiagnostics, SimulationDiagnostics,
} from './types';
import { sampleBinary, sampleContinuous, sampleCategorical } from './distributions';

function discretizeValue(node: SimNode, value: number): string {
  switch (node.type) {
    case 'binary':
      return value === 1 ? 'true' : 'false';
    case 'categorical':
      return node.categories[value] ?? 'unknown';
    case 'continuous': {
      const range = node.max - node.min;
      const normalized = (value - node.min) / range;
      if (normalized < 0.33) return 'low';
      if (normalized < 0.67) return 'medium';
      return 'high';
    }
  }
}

function countMatches(row: CptRow, parentValues: Record<string, string>): number {
  let matches = 0;
  for (const [parentId, expectedValue] of Object.entries(row.parentValues)) {
    if (parentValues[parentId] === expectedValue) matches++;
  }
  return matches;
}

function interpolateCpt(
  cpt: CptRow[],
  parentValues: Record<string, string>,
  totalParents: number
): { row: CptRow | undefined; quality: MatchQuality } {
  if (cpt.length === 0) {
    return { row: undefined, quality: 'default' };
  }

  const scored: { row: CptRow; matches: number }[] = [];
  for (const row of cpt) {
    const matches = countMatches(row, parentValues);
    const totalKeys = Object.keys(row.parentValues).length;
    if (matches === totalKeys && totalKeys === totalParents) {
      return { row, quality: 'exact' };
    }
    if (matches > 0) {
      scored.push({ row, matches });
    }
  }

  if (scored.length === 0) {
    return { row: undefined, quality: 'default' };
  }

  const totalWeight = scored.reduce((sum, s) => sum + s.matches / totalParents, 0);
  const firstRow = scored[0].row;

  if (firstRow.pTrue !== undefined) {
    let blendedPTrue = 0;
    for (const s of scored) {
      const weight = (s.matches / totalParents) / totalWeight;
      blendedPTrue += (s.row.pTrue ?? 0) * weight;
    }
    return { row: { parentValues: {}, pTrue: blendedPTrue }, quality: 'interpolated' };
  }

  if (firstRow.categoryProbabilities !== undefined) {
    const blended: Record<string, number> = {};
    for (const key of Object.keys(firstRow.categoryProbabilities)) {
      blended[key] = 0;
    }
    for (const s of scored) {
      const weight = (s.matches / totalParents) / totalWeight;
      const probs = s.row.categoryProbabilities!;
      for (const key of Object.keys(blended)) {
        blended[key] += (probs[key] ?? 0) * weight;
      }
    }
    return { row: { parentValues: {}, categoryProbabilities: blended }, quality: 'interpolated' };
  }

  if (firstRow.distribution !== undefined) {
    let blendedMean = 0;
    let blendedStddev = 0;
    for (const s of scored) {
      const weight = (s.matches / totalParents) / totalWeight;
      const dist = s.row.distribution!;
      let mean: number;
      let stddev: number;
      switch (dist.type) {
        case 'normal':
          mean = dist.params[0]; stddev = dist.params[1]; break;
        case 'uniform':
          mean = (dist.params[0] + dist.params[1]) / 2; stddev = (dist.params[1] - dist.params[0]) / 3.46; break;
        case 'triangular':
          mean = dist.params[1]; stddev = (dist.params[2] - dist.params[0]) / 4.9; break;
      }
      blendedMean += mean * weight;
      blendedStddev += stddev * weight;
    }
    return { row: { parentValues: {}, distribution: { type: 'normal', params: [blendedMean, blendedStddev] } }, quality: 'interpolated' };
  }

  return { row: undefined, quality: 'default' };
}

function sampleNode(
  rng: seedrandom.PRNG,
  node: SimNode,
  parentValues: Record<string, string>
): { value: number; quality: MatchQuality } {
  if (node.parents.length === 0) {
    switch (node.type) {
      case 'binary':
        return { value: sampleBinary(rng, node.defaultPTrue) ? 1 : 0, quality: 'exact' };
      case 'continuous':
        return { value: sampleContinuous(rng, node.defaultDistribution, node.min, node.max), quality: 'exact' };
      case 'categorical': {
        const cat = sampleCategorical(rng, node.defaultProbabilities);
        return { value: node.categories.indexOf(cat), quality: 'exact' };
      }
    }
  }

  const { row: cptRow, quality } = interpolateCpt(node.cpt, parentValues, node.parents.length);

  switch (node.type) {
    case 'binary': {
      const pTrue = cptRow?.pTrue ?? node.defaultPTrue;
      return { value: sampleBinary(rng, pTrue) ? 1 : 0, quality };
    }
    case 'continuous': {
      const dist = cptRow?.distribution ?? node.defaultDistribution;
      return { value: sampleContinuous(rng, dist, node.min, node.max), quality };
    }
    case 'categorical': {
      const probs = cptRow?.categoryProbabilities ?? node.defaultProbabilities;
      const category = sampleCategorical(rng, probs);
      return { value: node.categories.indexOf(category), quality };
    }
  }
}

export function sampleOnce(
  graph: SimGraph,
  seed: string
): { result: RunResult; qualities: MatchQuality[] } {
  const rng = seedrandom(seed);
  const result = new Float32Array(graph.sortedIds.length);
  const qualities: MatchQuality[] = new Array(graph.sortedIds.length);

  for (let i = 0; i < graph.sortedIds.length; i++) {
    const nodeId = graph.sortedIds[i];
    const node = graph.nodes.get(nodeId)!;

    const parentValues: Record<string, string> = {};
    for (const parentId of node.parents) {
      const parentIdx = graph.sortedIds.indexOf(parentId);
      const parentNode = graph.nodes.get(parentId)!;
      parentValues[parentId] = discretizeValue(parentNode, result[parentIdx]);
    }

    const { value, quality } = sampleNode(rng, node, parentValues);
    result[i] = value;
    qualities[i] = quality;
  }

  return { result, qualities };
}

export function runSimulation(
  graph: SimGraph,
  runCount: number,
  seed: number
): SimulationResult {
  const runs: RunResult[] = [];
  const nodeIndexMap = new Map<string, number>();
  const diagNodes = new Map<string, NodeDiagnostics>();

  for (let i = 0; i < graph.sortedIds.length; i++) {
    nodeIndexMap.set(graph.sortedIds[i], i);
    diagNodes.set(graph.sortedIds[i], { exact: 0, interpolated: 0, default: 0 });
  }

  for (let i = 0; i < runCount; i++) {
    const { result, qualities } = sampleOnce(graph, `${seed}-${i}`);
    runs.push(result);
    for (let j = 0; j < graph.sortedIds.length; j++) {
      const diag = diagNodes.get(graph.sortedIds[j])!;
      diag[qualities[j]]++;
    }
  }

  return { runs, nodeIndexMap, runCount, diagnostics: { nodes: diagNodes } };
}
