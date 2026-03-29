import seedrandom from 'seedrandom';
import type { SimGraph, SimNode, RunResult, SimulationResult, CptRow } from './types';
import { sampleBinary, sampleContinuous, sampleCategorical } from './distributions';

/**
 * Discretize a sampled value for CPT lookup.
 * Binary: "true" / "false"
 * Categorical: the category string
 * Continuous: "low" / "medium" / "high" based on node's min/max range
 */
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

/**
 * Find the matching CPT row for a node given current parent values.
 * Returns undefined if no match (falls back to defaults).
 */
function findCptRow(cpt: CptRow[], parentValues: Record<string, string>): CptRow | undefined {
  return cpt.find((row) =>
    Object.entries(row.parentValues).every(
      ([parentId, expectedValue]) => parentValues[parentId] === expectedValue
    )
  );
}

/**
 * Sample a single node given its parent values.
 */
function sampleNode(
  rng: seedrandom.PRNG,
  node: SimNode,
  parentValues: Record<string, string>
): number {
  const hasParents = node.parents.length > 0;
  const cptRow = hasParents ? findCptRow(node.cpt, parentValues) : undefined;

  switch (node.type) {
    case 'binary': {
      const pTrue = cptRow?.pTrue ?? node.defaultPTrue;
      return sampleBinary(rng, pTrue) ? 1 : 0;
    }
    case 'continuous': {
      const dist = cptRow?.distribution ?? node.defaultDistribution;
      return sampleContinuous(rng, dist, node.min, node.max);
    }
    case 'categorical': {
      const probs = cptRow?.categoryProbabilities ?? node.defaultProbabilities;
      const category = sampleCategorical(rng, probs);
      return node.categories.indexOf(category);
    }
  }
}

/**
 * Run a single simulation pass through the entire graph.
 * Returns a Float32Array with one value per node (indexed by sortedIds position).
 */
export function sampleOnce(graph: SimGraph, seed: string): RunResult {
  const rng = seedrandom(seed);
  const result = new Float32Array(graph.sortedIds.length);

  for (let i = 0; i < graph.sortedIds.length; i++) {
    const nodeId = graph.sortedIds[i];
    const node = graph.nodes.get(nodeId)!;

    const parentValues: Record<string, string> = {};
    for (const parentId of node.parents) {
      const parentIdx = graph.sortedIds.indexOf(parentId);
      const parentNode = graph.nodes.get(parentId)!;
      parentValues[parentId] = discretizeValue(parentNode, result[parentIdx]);
    }

    result[i] = sampleNode(rng, node, parentValues);
  }

  return result;
}

/**
 * Run multiple Monte Carlo simulations.
 */
export function runSimulation(
  graph: SimGraph,
  runCount: number,
  seed: number
): SimulationResult {
  const runs: RunResult[] = [];
  const nodeIndexMap = new Map<string, number>();

  for (let i = 0; i < graph.sortedIds.length; i++) {
    nodeIndexMap.set(graph.sortedIds[i], i);
  }

  for (let i = 0; i < runCount; i++) {
    runs.push(sampleOnce(graph, `${seed}-${i}`));
  }

  return { runs, nodeIndexMap, runCount };
}
