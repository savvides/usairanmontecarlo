# Methodology Red Team Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 3 critical methodology flaws (CPT sparsity, insufficient samples, no transparency) found by the red team analysis.

**Architecture:** Replace exact-match CPT lookup with weighted nearest-neighbor interpolation. Add diagnostics tracking to the simulation result. Build a confidence scoring system. Add a methodology page. Bump default run count to 5K.

**Tech Stack:** TypeScript, Vitest, Next.js, React, Tailwind CSS

---

## File Structure

```
src/
├── engine/
│   ├── types.ts              # Add SimulationDiagnostics type
│   ├── sampler.ts            # Replace findCptRow with interpolation engine
│   └── index.ts              # Export new types
├── lib/
│   └── confidence.ts         # Confidence scoring functions (new)
├── hooks/
│   └── useSimulation.ts      # Add confidence data to PhaseResults
├── components/
│   └── simulation/
│       ├── ResultsPanel.tsx   # Replace source badge with confidence badge
│       ├── SimulationShell.tsx # Bump run count 1K→5K
│       └── PhaseProgress.tsx  # Add methodology "?" link
├── app/
│   ├── page.tsx              # Add methodology link to footer
│   └── methodology/
│       └── page.tsx          # New methodology page
└── __tests__/
    └── engine/
        ├── interpolation.test.ts  # New: interpolation engine tests
        └── confidence.test.ts     # New: confidence scoring tests
```

---

### Task 1: Add Diagnostics Types

**Files:**
- Modify: `src/engine/types.ts`

- [ ] **Step 1: Add SimulationDiagnostics type to types.ts**

Add the following after the `SimulationResult` interface (after line 83) in `src/engine/types.ts`:

```typescript
// --- Diagnostics ---

export type MatchQuality = 'exact' | 'interpolated' | 'default';

export interface NodeDiagnostics {
  exact: number;
  interpolated: number;
  default: number;
}

export interface SimulationDiagnostics {
  /** Per-node CPT match quality counts across all runs */
  nodes: Map<string, NodeDiagnostics>;
}
```

Then update the `SimulationResult` interface to include diagnostics:

```typescript
export interface SimulationResult {
  runs: RunResult[];
  nodeIndexMap: Map<string, number>;
  runCount: number;
  diagnostics: SimulationDiagnostics;
}
```

- [ ] **Step 2: Update exports in index.ts**

Add to the type exports in `src/engine/index.ts`:

```typescript
export type {
  // ... existing exports ...
  MatchQuality,
  NodeDiagnostics,
  SimulationDiagnostics,
} from './types';
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: Errors in `sampler.ts` because `runSimulation` doesn't return `diagnostics` yet. That's expected — we fix it in Task 2.

- [ ] **Step 4: Commit**

```bash
git add src/engine/types.ts src/engine/index.ts
git commit -m "feat: add SimulationDiagnostics type for CPT match tracking"
```

---

### Task 2: CPT Interpolation Engine

**Files:**
- Modify: `src/engine/sampler.ts`
- Create: `src/__tests__/engine/interpolation.test.ts`

- [ ] **Step 1: Write failing tests for interpolation**

Create `src/__tests__/engine/interpolation.test.ts`:

```typescript
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

    // a is always true, so b should use the exact match row (pTrue=0.9)
    const bIdx = result.nodeIndexMap.get('b')!;
    let trueCount = 0;
    for (let i = 0; i < 5000; i++) {
      if (result.runs[i][bIdx] === 1) trueCount++;
    }
    expect(trueCount / 5000).toBeCloseTo(0.9, 1);
  });

  it('interpolates when no exact CPT match exists', () => {
    // Node c depends on both a and b, but CPT only has rows for specific combos
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0), // always true
      makeBinaryNode('b', 1, [], 1.0), // always true
      {
        ...makeBinaryNode('c', 1, ['a', 'b'], 0.1), // default is 0.1
        cpt: [
          // Only has a row matching a=true (not both a=true AND b=true)
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

    // With interpolation: row1 matches a=true (1/2 parents), row2 matches b=true (1/2 parents)
    // Both have weight 0.5, normalized to 0.5 each
    // Blended pTrue = 0.5*0.8 + 0.5*0.7 = 0.75
    // Without interpolation (old behavior): would use default 0.1
    // So rate should be much closer to 0.75 than to 0.1
    expect(rate).toBeGreaterThan(0.5);
    expect(rate).toBeLessThan(0.95);
  });

  it('falls back to defaults when no CPT row matches any parent', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0), // always true
      {
        ...makeBinaryNode('b', 1, ['a'], 0.3), // default 0.3
        cpt: [
          // Only has a row for a=false, but a is always true
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
    // No CPT row matches a=true at all, so should fall back to default 0.3
    expect(trueCount / 5000).toBeCloseTo(0.3, 1);
  });

  it('interpolates categorical probability vectors', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 1.0), // always true
      makeBinaryNode('b', 1, [], 1.0), // always true
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
      if (result.runs[i][cIdx] === 0) lowCount++; // 0 = index of 'low'
    }
    const lowRate = lowCount / 5000;
    // Interpolated: 0.5*(0.2) + 0.5*(0.6) = 0.4 for 'low'
    expect(lowRate).toBeCloseTo(0.4, 1);
  });

  it('tracks diagnostics correctly', () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', 1, [], 0.5),
      {
        ...makeBinaryNode('b', 1, ['a'], 0.5),
        cpt: [
          { parentValues: { a: 'true' }, pTrue: 0.9 },
          // No row for a=false — will interpolate or default
        ],
      } as BinaryNode,
    ];
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 1000, 42);

    // Node 'a' has no parents — no CPT lookup needed, should be 'exact' (root node)
    const aDiag = result.diagnostics.nodes.get('a')!;
    expect(aDiag.exact).toBe(1000);
    expect(aDiag.interpolated).toBe(0);
    expect(aDiag.default).toBe(0);

    // Node 'b' — about half the time a=true (exact match), half a=false (default fallback)
    const bDiag = result.diagnostics.nodes.get('b')!;
    expect(bDiag.exact).toBeGreaterThan(300); // ~500 when a=true
    expect(bDiag.exact + bDiag.interpolated + bDiag.default).toBe(1000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/interpolation.test.ts
```
Expected: FAIL — `diagnostics` property doesn't exist on `SimulationResult`

- [ ] **Step 3: Implement the interpolation engine**

Replace the entire content of `src/engine/sampler.ts` with:

```typescript
import seedrandom from 'seedrandom';
import type {
  SimGraph, SimNode, RunResult, SimulationResult, CptRow,
  MatchQuality, NodeDiagnostics, SimulationDiagnostics,
} from './types';
import { sampleBinary, sampleContinuous, sampleCategorical } from './distributions';

/**
 * Discretize a sampled value for CPT lookup.
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
 * Count how many parent values in a CPT row match the current state.
 */
function countMatches(row: CptRow, parentValues: Record<string, string>): number {
  let matches = 0;
  for (const [parentId, expectedValue] of Object.entries(row.parentValues)) {
    if (parentValues[parentId] === expectedValue) matches++;
  }
  return matches;
}

/**
 * Interpolate CPT rows using weighted nearest-neighbor matching.
 * Returns the blended result and match quality.
 */
function interpolateCpt(
  cpt: CptRow[],
  parentValues: Record<string, string>,
  totalParents: number
): { row: CptRow | undefined; quality: MatchQuality } {
  if (cpt.length === 0) {
    return { row: undefined, quality: 'default' };
  }

  // Score each row
  const scored: { row: CptRow; matches: number }[] = [];
  for (const row of cpt) {
    const matches = countMatches(row, parentValues);
    const totalKeys = Object.keys(row.parentValues).length;
    if (matches === totalKeys && totalKeys === totalParents) {
      // Exact match — all parents match
      return { row, quality: 'exact' };
    }
    if (matches > 0) {
      scored.push({ row, matches });
    }
  }

  if (scored.length === 0) {
    return { row: undefined, quality: 'default' };
  }

  // Compute weights
  const totalWeight = scored.reduce((sum, s) => sum + s.matches / totalParents, 0);

  // Blend based on the first row's available fields to determine node type
  const firstRow = scored[0].row;

  if (firstRow.pTrue !== undefined) {
    // Binary node — blend pTrue values
    let blendedPTrue = 0;
    for (const s of scored) {
      const weight = (s.matches / totalParents) / totalWeight;
      blendedPTrue += (s.row.pTrue ?? 0) * weight;
    }
    return {
      row: { parentValues: {}, pTrue: blendedPTrue },
      quality: 'interpolated',
    };
  }

  if (firstRow.categoryProbabilities !== undefined) {
    // Categorical node — blend probability vectors element-wise
    const blended: Record<string, number> = {};
    // Initialize all keys from first row
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
    return {
      row: { parentValues: {}, categoryProbabilities: blended },
      quality: 'interpolated',
    };
  }

  if (firstRow.distribution !== undefined) {
    // Continuous node — convert all to normal, blend mean and stddev
    let blendedMean = 0;
    let blendedStddev = 0;
    for (const s of scored) {
      const weight = (s.matches / totalParents) / totalWeight;
      const dist = s.row.distribution!;
      let mean: number;
      let stddev: number;
      switch (dist.type) {
        case 'normal':
          mean = dist.params[0];
          stddev = dist.params[1];
          break;
        case 'uniform':
          mean = (dist.params[0] + dist.params[1]) / 2;
          stddev = (dist.params[1] - dist.params[0]) / 3.46;
          break;
        case 'triangular':
          mean = dist.params[1]; // mode
          stddev = (dist.params[2] - dist.params[0]) / 4.9;
          break;
      }
      blendedMean += mean * weight;
      blendedStddev += stddev * weight;
    }
    return {
      row: { parentValues: {}, distribution: { type: 'normal', params: [blendedMean, blendedStddev] } },
      quality: 'interpolated',
    };
  }

  return { row: undefined, quality: 'default' };
}

/**
 * Sample a single node given its parent values.
 * Returns the sampled value and the CPT match quality.
 */
function sampleNode(
  rng: seedrandom.PRNG,
  node: SimNode,
  parentValues: Record<string, string>
): { value: number; quality: MatchQuality } {
  if (node.parents.length === 0) {
    // Root node — no CPT lookup needed
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

/**
 * Run a single simulation pass through the entire graph.
 * Returns a Float32Array with one value per node and per-node match quality.
 */
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

/**
 * Run multiple Monte Carlo simulations with diagnostics tracking.
 */
export function runSimulation(
  graph: SimGraph,
  runCount: number,
  seed: number
): SimulationResult {
  const runs: RunResult[] = [];
  const nodeIndexMap = new Map<string, number>();

  // Initialize diagnostics
  const diagNodes = new Map<string, NodeDiagnostics>();
  for (let i = 0; i < graph.sortedIds.length; i++) {
    nodeIndexMap.set(graph.sortedIds[i], i);
    diagNodes.set(graph.sortedIds[i], { exact: 0, interpolated: 0, default: 0 });
  }

  for (let i = 0; i < runCount; i++) {
    const { result, qualities } = sampleOnce(graph, `${seed}-${i}`);
    runs.push(result);

    // Accumulate diagnostics
    for (let j = 0; j < graph.sortedIds.length; j++) {
      const diag = diagNodes.get(graph.sortedIds[j])!;
      diag[qualities[j]]++;
    }
  }

  return {
    runs,
    nodeIndexMap,
    runCount,
    diagnostics: { nodes: diagNodes },
  };
}
```

- [ ] **Step 4: Run interpolation tests**

Run:
```bash
npx vitest run src/__tests__/engine/interpolation.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Run full test suite to check backwards compatibility**

Run:
```bash
npx vitest run
```
Expected: All tests PASS (existing tests may need minor updates if they check `sampleOnce` return type)

Note: If existing sampler tests fail because `sampleOnce` now returns `{ result, qualities }` instead of `RunResult`, update `src/__tests__/engine/sampler.test.ts`:
- Change `sampleOnce(graph, seed)` to `sampleOnce(graph, seed).result` in tests that directly use the return value
- The `runSimulation` tests should pass unchanged since it still returns `SimulationResult` (now with `diagnostics` added)

- [ ] **Step 6: Fix any failing tests**

In `src/__tests__/engine/sampler.test.ts`, update the two `sampleOnce` calls:

Line ~44 (test "samples root binary nodes"):
```typescript
const result = sampleOnce(graph, 'test-seed').result;
```

Line ~57 (test "propagates through a simple chain"):
```typescript
const result = sampleOnce(graph, `seed-${i}`).result;
```

In `src/__tests__/engine/integration.test.ts`, if it uses `sampleOnce`, apply the same `.result` fix.

- [ ] **Step 7: Run full test suite again**

Run:
```bash
npx vitest run
```
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/engine/sampler.ts src/__tests__/engine/interpolation.test.ts src/__tests__/engine/sampler.test.ts src/__tests__/engine/integration.test.ts
git commit -m "feat: replace exact-match CPT lookup with weighted interpolation engine"
```

---

### Task 3: Confidence Scoring

**Files:**
- Create: `src/lib/confidence.ts`
- Create: `src/__tests__/engine/confidence.test.ts`

- [ ] **Step 1: Write failing tests for confidence scoring**

Create `src/__tests__/engine/confidence.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { computeNodeConfidence, getConfidenceTier } from '@/lib/confidence';
import type { NodeDiagnostics, SourceCitation } from '@engine/types';

describe('computeNodeConfidence', () => {
  it('returns high confidence for all-exact matches with high source', () => {
    const diag: NodeDiagnostics = { exact: 5000, interpolated: 0, default: 0 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'high' };
    const score = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('returns low confidence for all-default with low source', () => {
    const diag: NodeDiagnostics = { exact: 0, interpolated: 0, default: 5000 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'low' };
    const score = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    expect(score).toBeLessThan(0.4);
  });

  it('penalizes extreme binary probabilities (low effective sample)', () => {
    const diag: NodeDiagnostics = { exact: 5000, interpolated: 0, default: 0 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'high' };
    // p=0.5 gives best sample adequacy
    const score50 = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    // p=0.02 gives poor sample adequacy
    const score02 = computeNodeConfidence(diag, 5000, 'binary', 0.02, source);
    expect(score50).toBeGreaterThan(score02);
  });

  it('interpolated matches score between exact and default', () => {
    const source: SourceCitation = { citation: '', url: '', confidence: 'medium' };
    const allExact = computeNodeConfidence({ exact: 5000, interpolated: 0, default: 0 }, 5000, 'binary', 0.5, source);
    const allInterp = computeNodeConfidence({ exact: 0, interpolated: 5000, default: 0 }, 5000, 'binary', 0.5, source);
    const allDefault = computeNodeConfidence({ exact: 0, interpolated: 0, default: 5000 }, 5000, 'binary', 0.5, source);
    expect(allExact).toBeGreaterThan(allInterp);
    expect(allInterp).toBeGreaterThan(allDefault);
  });
});

describe('getConfidenceTier', () => {
  it('returns "high" for scores >= 0.7', () => {
    expect(getConfidenceTier(0.7)).toBe('high');
    expect(getConfidenceTier(1.0)).toBe('high');
  });

  it('returns "medium" for scores 0.4-0.69', () => {
    expect(getConfidenceTier(0.4)).toBe('medium');
    expect(getConfidenceTier(0.69)).toBe('medium');
  });

  it('returns "low" for scores < 0.4', () => {
    expect(getConfidenceTier(0.39)).toBe('low');
    expect(getConfidenceTier(0.0)).toBe('low');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/confidence.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement confidence scoring**

Create `src/lib/confidence.ts`:

```typescript
import type { NodeDiagnostics, NodeType, SourceCitation } from '@engine/types';

/**
 * Compute a composite confidence score (0-1) for a node's simulation results.
 *
 * Three factors:
 * - CPT coverage (40%): How often the sampler found exact/interpolated/default matches
 * - Sample adequacy (30%): Effective sample size for the observed distribution
 * - Source confidence (30%): Quality of the underlying data sources
 */
export function computeNodeConfidence(
  diagnostics: NodeDiagnostics,
  runCount: number,
  nodeType: NodeType,
  observedMeanOrProportion: number,
  source: SourceCitation,
  minCategoryCount?: number
): number {
  const total = diagnostics.exact + diagnostics.interpolated + diagnostics.default;
  if (total === 0) return 0;

  // 1. CPT Coverage Score (40% weight)
  const cptScore =
    (diagnostics.exact * 1.0 + diagnostics.interpolated * 0.6 + diagnostics.default * 0.2) / total;

  // 2. Sample Adequacy Score (30% weight)
  let sampleScore: number;
  switch (nodeType) {
    case 'binary': {
      const p = observedMeanOrProportion;
      // n * p * (1-p) is the variance denominator; we want at least 25
      sampleScore = Math.min(1, (runCount * p * (1 - p)) / 25);
      break;
    }
    case 'categorical': {
      // Smallest category count drives the score
      const minCount = minCategoryCount ?? 0;
      sampleScore = Math.min(1, minCount / 30);
      break;
    }
    case 'continuous':
      // Normal distributions converge well at 5K runs
      sampleScore = 1.0;
      break;
  }

  // 3. Source Confidence Score (30% weight)
  const sourceScore = source.confidence === 'high' ? 1.0 : source.confidence === 'medium' ? 0.6 : 0.3;

  return cptScore * 0.4 + sampleScore * 0.3 + sourceScore * 0.3;
}

export type ConfidenceTier = 'high' | 'medium' | 'low';

/**
 * Map a confidence score to a display tier.
 */
export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}
```

- [ ] **Step 4: Run confidence tests**

Run:
```bash
npx vitest run src/__tests__/engine/confidence.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/confidence.ts src/__tests__/engine/confidence.test.ts
git commit -m "feat: add confidence scoring system for simulation results"
```

---

### Task 4: Wire Confidence Into UI

**Files:**
- Modify: `src/hooks/useSimulation.ts`
- Modify: `src/components/simulation/ResultsPanel.tsx`

- [ ] **Step 1: Add confidence data to PhaseResults**

In `src/hooks/useSimulation.ts`, add imports and update the `PhaseResults` interface and `extractPhaseResults` function.

Add import at top:
```typescript
import { computeNodeConfidence, getConfidenceTier, type ConfidenceTier } from '@/lib/confidence';
```

Update `PhaseResults` interface:
```typescript
export interface PhaseResults {
  distributions: Map<string, number[]>;
  stats: Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>;
  confidence: Map<string, { score: number; tier: ConfidenceTier }>;
}
```

Update `extractPhaseResults` to compute confidence:
```typescript
function extractPhaseResults(
  result: SimulationResult,
  graph: SimGraph,
  phase: number
): PhaseResults {
  const phaseNodeIds = graph.phaseNodes.get(phase) ?? [];
  const distributions = new Map<string, number[]>();
  const stats = new Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>();
  const confidence = new Map<string, { score: number; tier: ConfidenceTier }>();

  for (const nodeId of phaseNodeIds) {
    const idx = result.nodeIndexMap.get(nodeId)!;
    const node = graph.nodes.get(nodeId)!;
    const values: number[] = [];
    for (let i = 0; i < result.runCount; i++) {
      values.push(result.runs[i][idx]);
    }
    distributions.set(nodeId, values);
    const nodeStats = computeStats(values);
    stats.set(nodeId, nodeStats);

    // Compute confidence
    const diag = result.diagnostics.nodes.get(nodeId);
    if (diag) {
      let minCategoryCount: number | undefined;
      if (node.type === 'categorical') {
        const catCounts = node.categories.map((_, catIdx) =>
          values.filter((v) => v === catIdx).length
        );
        minCategoryCount = Math.min(...catCounts);
      }
      const score = computeNodeConfidence(
        diag,
        result.runCount,
        node.type,
        nodeStats.mean,
        node.source,
        minCategoryCount
      );
      confidence.set(nodeId, { score, tier: getConfidenceTier(score) });
    }
  }

  return { distributions, stats, confidence };
}
```

- [ ] **Step 2: Update ResultsPanel to show confidence badges**

In `src/components/simulation/ResultsPanel.tsx`, replace the source confidence badge with the composite confidence badge.

Add to imports:
```typescript
import type { ConfidenceTier } from '@/lib/confidence';
```

Update the `ResultsPanelProps` — no change needed since `PhaseResults` already flows through.

Replace the badge `<span>` (lines 67-75) with:

```tsx
{(() => {
  const conf = phaseResults.confidence.get(node.id);
  const tier = conf?.tier ?? 'low';
  return (
    <span
      className={`text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap ${
        tier === 'high'
          ? 'bg-success/10 text-success'
          : tier === 'medium'
          ? 'bg-warning/10 text-warning'
          : 'bg-danger/10 text-danger'
      }`}
      title={conf ? `Confidence: ${(conf.score * 100).toFixed(0)}%` : ''}
    >
      {tier} conf.
    </span>
  );
})()}
```

- [ ] **Step 3: Verify build**

Run:
```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSimulation.ts src/components/simulation/ResultsPanel.tsx
git commit -m "feat: wire confidence scoring into simulation UI"
```

---

### Task 5: Sample Size Bump

**Files:**
- Modify: `src/components/simulation/SimulationShell.tsx`

- [ ] **Step 1: Update run count from 1000 to 5000**

In `src/components/simulation/SimulationShell.tsx`, change both occurrences of `simulation.run(1000)` to `simulation.run(5000)`:

Line 26 (useEffect):
```typescript
simulation.run(5000);
```

Line 52 (handleSelectScenario setTimeout):
```typescript
setTimeout(() => simulation.run(5000), 0);
```

- [ ] **Step 2: Verify build**

Run:
```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/simulation/SimulationShell.tsx
git commit -m "feat: bump default Monte Carlo runs from 1K to 5K"
```

---

### Task 6: Methodology Page

**Files:**
- Create: `src/app/methodology/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/simulation/PhaseProgress.tsx`

- [ ] **Step 1: Create the methodology page**

Create `src/app/methodology/page.tsx`:

```tsx
import Link from 'next/link';

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to simulation
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-text-primary">Methodology</h1>
        <p className="mt-2 text-sm text-text-secondary">
          How this simulation works, what the confidence badges mean, and what the known limitations are.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">What This Is</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              This is a Monte Carlo simulation — a technique that runs thousands of randomized
              scenarios through a mathematical model and shows you the distribution of outcomes.
              Instead of predicting a single future, it shows you the range of possibilities and
              how likely each one is.
            </p>
            <p>
              The model behind this simulation is a Bayesian network: a directed graph of 104
              interconnected variables spanning 8 phases of a potential US-Iran military conflict.
              Each variable has a probability distribution that depends on its parent variables.
              When you change an input — like selecting a crisis trigger scenario — the effects
              cascade through every connected variable in the network.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">How the Model Works</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Each variable in the network (called a &ldquo;node&rdquo;) has a conditional probability table
              (CPT) that defines how its probability distribution changes based on the state of its
              parent nodes. For example: if Iran&apos;s nuclear program is at breakout threshold AND
              IRGC military readiness is high, the probability of an escalation trigger event rises
              from a baseline of 15% to approximately 45%.
            </p>
            <p>
              When the CPT doesn&apos;t have an exact match for the current combination of parent states
              (which happens frequently with sparse data), the engine uses weighted interpolation —
              blending the closest matching CPT entries proportional to how many parent values they
              match. This ensures that parent-child relationships always influence outcomes, even
              when the data is incomplete.
            </p>
            <p>
              Each simulation run samples values for every node in topological order (parents before
              children), building one complete scenario from tensions through aftermath. The default
              configuration runs 5,000 independent scenarios to produce the probability distributions
              you see in the results panel.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">What the Confidence Badges Mean</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Each result card shows a confidence badge — <span className="font-mono text-success">high</span>,{' '}
              <span className="font-mono text-warning">medium</span>, or{' '}
              <span className="font-mono text-danger">low</span> — computed from three factors:
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                <strong className="text-text-primary">CPT Coverage (40%):</strong> How often the
                simulation engine found a matching or partially-matching CPT entry versus falling
                back to default probabilities. Higher coverage means the variable is actually
                responding to its parent states, not just producing generic outputs.
              </li>
              <li>
                <strong className="text-text-primary">Sample Adequacy (30%):</strong> Whether there
                are enough simulation runs to produce statistically meaningful results for this
                variable. Rare events (like nuclear escalation at 5% probability) need more samples
                to measure precisely than common outcomes.
              </li>
              <li>
                <strong className="text-text-primary">Source Quality (30%):</strong> The quality of
                the underlying data sources used to calibrate this variable — from peer-reviewed
                defense research (high) to informed estimates based on historical analogues (low).
              </li>
            </ul>
            <p>
              <strong className="text-text-primary">High confidence</strong> means solid data, good
              model coverage, and sufficient samples. Trust the distribution shape and approximate values.
            </p>
            <p>
              <strong className="text-text-primary">Medium confidence</strong> means a directional
              estimate — trust the trend (e.g., &ldquo;more likely than not&rdquo;) but not the exact percentages.
            </p>
            <p>
              <strong className="text-text-primary">Low confidence</strong> means speculative — the model
              is making educated guesses based on limited data. Treat as hypothesis generation, not forecasting.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">Known Limitations</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary list-disc pl-5">
            <li>
              <strong className="text-text-primary">Sparse conditional probability tables</strong> mean
              some parent-child relationships are weaker than the model structure implies. The
              interpolation engine mitigates this but cannot substitute for comprehensive data.
            </li>
            <li>
              <strong className="text-text-primary">Historical base rates</strong> from analogous
              conflicts (Gulf War, Iraq War, 2019-2020 US-Iran crisis) are imperfect proxies for a
              conflict that hasn&apos;t happened.
            </li>
            <li>
              <strong className="text-text-primary">Truly novel scenarios</strong> — such as a
              technology or tactic that didn&apos;t exist in prior conflicts — cannot be captured by a
              model calibrated on historical data.
            </li>
            <li>
              <strong className="text-text-primary">Feedback loops</strong> are approximated as
              unrolled time steps within the directed acyclic graph. Real conflicts have recursive
              dynamics that this structure can only approximate.
            </li>
            <li>
              <strong className="text-text-primary">Subjective probability estimates</strong>, even
              when sourced from respected institutions, carry expert disagreement. Different analysts
              would calibrate the same node differently.
            </li>
            <li>
              <strong className="text-text-primary">Snapshot-in-time model</strong> — parameters
              reflect conditions as of March 2026 and do not update automatically.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-text-primary">Sources</h2>
          <div className="mt-3 space-y-2 text-sm text-text-secondary">
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Primary</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>CSIS — Center for Strategic and International Studies</li>
              <li>RAND Corporation</li>
              <li>IISS — International Institute for Strategic Studies (Military Balance)</li>
              <li>SIPRI — Stockholm International Peace Research Institute</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Military</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>Congressional Research Service (CRS)</li>
              <li>GlobalFirepower / Jane&apos;s Defence</li>
              <li>DoD Annual Reports</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Economic</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>World Bank / IMF</li>
              <li>EIA — Energy Information Administration</li>
              <li>BP Statistical Review</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Geopolitical</p>
            <ul className="space-y-1 pl-4">
              <li>Council on Foreign Relations</li>
              <li>Chatham House</li>
              <li>International Crisis Group</li>
            </ul>
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Back to Simulation
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add methodology link to landing page footer**

In `src/app/page.tsx`, add a methodology link after the existing footer `<div>` (after the "Open source" span, before the closing `</div>` of the footer):

Replace the footer div (lines 40-46):
```tsx
<div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-mono text-text-muted">
  <span>As of March 2026</span>
  <span className="h-3 w-px bg-border" />
  <span>Research-backed parameters</span>
  <span className="h-3 w-px bg-border" />
  <span>Open source</span>
  <span className="h-3 w-px bg-border" />
  <Link href="/methodology" className="hover:text-text-secondary transition-colors">
    Methodology
  </Link>
</div>
```

- [ ] **Step 3: Add "?" link to PhaseProgress header**

In `src/components/simulation/PhaseProgress.tsx`, add a Link import and a methodology button at the end of the progress bar.

Add import:
```typescript
import Link from 'next/link';
```

After the closing of the `Array.from(...)` map (before the closing `</div>` of the container), add:

```tsx
<div className="ml-auto">
  <Link
    href="/methodology"
    className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-text-muted text-[10px] font-mono hover:text-text-secondary transition-colors"
    title="Methodology"
  >
    ?
  </Link>
</div>
```

- [ ] **Step 4: Verify build**

Run:
```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds with `/methodology` route added

- [ ] **Step 5: Run full test suite**

Run:
```bash
npx vitest run
```
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/methodology/ src/app/page.tsx src/components/simulation/PhaseProgress.tsx
git commit -m "feat: add methodology page with confidence explanation and known limitations"
```

---

## Summary

After completing all 6 tasks:

- **CPT interpolation engine** replaces silent 90% fallback with weighted nearest-neighbor blending
- **Diagnostics tracking** records exact/interpolated/default counts per node per simulation
- **Confidence scoring** combines CPT coverage (40%), sample adequacy (30%), source quality (30%) into High/Medium/Low badges
- **Methodology page** at `/methodology` with plain-English explanation of how the model works and what it can't do
- **5,000 default runs** (up from 1,000) for ±11% confidence on rare events
- **All existing tests still passing** + new tests for interpolation and confidence
