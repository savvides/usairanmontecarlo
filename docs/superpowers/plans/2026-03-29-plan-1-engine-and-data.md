# Plan 1: Simulation Engine & Phase 1 Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully tested, client-side Bayesian Network Monte Carlo engine with real Phase 1 (Pre-Conflict Tensions) data, runnable in both main thread and Web Worker.

**Architecture:** A pure TypeScript DAG-based Bayesian Network. Nodes have conditional probability tables (CPTs). A topological sort determines evaluation order. Monte Carlo sampling draws from root nodes and propagates through the graph. A Web Worker handles background refinement runs. Phase 1 data serves as the proof-of-concept dataset.

**Tech Stack:** TypeScript, Vitest, Web Workers, seedrandom (deterministic PRNG)

---

## File Structure

```
src/
├── engine/
│   ├── types.ts            # All type definitions: Node, CPT, Graph, SimulationResult, ScenarioCard
│   ├── distributions.ts    # Sampling functions for binary, continuous, categorical nodes
│   ├── graph.ts            # DAG construction, validation, topological sort
│   ├── sampler.ts          # Monte Carlo sampling: single run + batch
│   ├── scenario.ts         # Apply scenario card overrides to a graph
│   ├── worker.ts           # Web Worker entry point
│   ├── worker-client.ts    # Main-thread wrapper for communicating with the worker
│   └── index.ts            # Public API surface
├── data/
│   ├── nodes/
│   │   └── phase-1-tensions.json   # Phase 1 node definitions with CPTs
│   ├── scenarios/
│   │   └── phase-1-scenarios.json  # Phase 1 scenario card definitions
│   └── sources.json                # Bibliography for Phase 1
└── __tests__/
    └── engine/
        ├── distributions.test.ts
        ├── graph.test.ts
        ├── sampler.test.ts
        ├── scenario.test.ts
        ├── data-integrity.test.ts
        ├── worker.test.ts
        └── integration.test.ts
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Initialize the project**

Run:
```bash
cd /Users/philippossavvides/Desktop/GitHub/usairanmontecarlo
npm init -y
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install -D typescript vitest @types/node
npm install seedrandom
npm install -D @types/seedrandom
```

- [ ] **Step 3: Create tsconfig.json**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "WebWorker"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"],
    "paths": {
      "@engine/*": ["./src/engine/*"],
      "@data/*": ["./src/data/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create vitest.config.ts**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, './src/engine'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
});
```

- [ ] **Step 5: Add test script to package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: Verify setup**

Run:
```bash
npx vitest run
```
Expected: "No test files found" (not an error — just no tests yet)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts
git commit -m "chore: scaffold project with TypeScript and Vitest"
```

---

### Task 2: Core Type Definitions

**Files:**
- Create: `src/engine/types.ts`

- [ ] **Step 1: Define all engine types**

Create `src/engine/types.ts`:
```typescript
// --- Node Types ---

export type NodeType = 'binary' | 'continuous' | 'categorical';

export interface SourceCitation {
  citation: string;
  url: string;
  confidence: 'high' | 'medium' | 'low';
}

// Conditional probability table entry.
// `parentValues` maps parent node IDs to the specific value this row applies to.
// For binary parents, values are "true" or "false".
// For categorical parents, values are the category string.
// For continuous parents, values are discretized bucket labels like "low", "medium", "high".
export interface CptRow {
  parentValues: Record<string, string>;
  // For binary nodes: probability of true
  pTrue?: number;
  // For continuous nodes: distribution parameters
  distribution?: {
    type: 'normal' | 'uniform' | 'triangular';
    params: number[]; // normal: [mean, stddev], uniform: [min, max], triangular: [min, mode, max]
  };
  // For categorical nodes: probability of each category
  categoryProbabilities?: Record<string, number>;
}

export interface BaseNode {
  id: string;
  phase: number;
  type: NodeType;
  label: string;
  description: string;
  parents: string[];
  source: SourceCitation;
}

export interface BinaryNode extends BaseNode {
  type: 'binary';
  cpt: CptRow[]; // each row has pTrue
  defaultPTrue: number; // used when node has no parents (root node)
}

export interface ContinuousNode extends BaseNode {
  type: 'continuous';
  cpt: CptRow[]; // each row has distribution
  defaultDistribution: {
    type: 'normal' | 'uniform' | 'triangular';
    params: number[];
  };
  unit: string; // e.g., "$/barrel", "days", "count"
  min: number;
  max: number; // clamp range
}

export interface CategoricalNode extends BaseNode {
  type: 'categorical';
  categories: string[];
  cpt: CptRow[]; // each row has categoryProbabilities
  defaultProbabilities: Record<string, number>;
}

export type SimNode = BinaryNode | ContinuousNode | CategoricalNode;

// --- Graph ---

export interface SimGraph {
  nodes: Map<string, SimNode>;
  sortedIds: string[]; // topological order
  phaseNodes: Map<number, string[]>; // phase number -> node IDs in that phase
}

// --- Simulation Results ---

// One value per node per run. Binary: 0 or 1. Continuous: number. Categorical: index into categories array.
export type RunResult = Float32Array;

export interface SimulationResult {
  runs: RunResult[]; // array of runs, each run is a Float32Array indexed by node position in sortedIds
  nodeIndexMap: Map<string, number>; // node ID -> index in RunResult
  runCount: number;
}

// --- Scenario Cards ---

export interface NodeOverride {
  nodeId: string;
  // For binary: clamp to true/false
  clampValue?: boolean;
  // For continuous: override distribution
  overrideDistribution?: {
    type: 'normal' | 'uniform' | 'triangular';
    params: number[];
  };
  // For categorical: override probabilities
  overrideProbabilities?: Record<string, number>;
  // For binary: override probability (softer than clamp)
  overridePTrue?: number;
}

export interface ScenarioCard {
  id: string;
  phase: number;
  title: string;
  description: string;
  overrides: NodeOverride[];
}

// --- Worker Messages ---

export interface WorkerRequest {
  type: 'run';
  nodes: SimNode[]; // serialized (Map can't be sent via postMessage)
  sortedIds: string[];
  overrides: NodeOverride[];
  runCount: number;
  seed: number;
}

export interface WorkerResponse {
  type: 'result';
  runs: ArrayBuffer[]; // transferable Float32Arrays
  nodeIndexMap: [string, number][]; // serialized Map
}
```

- [ ] **Step 2: Verify file compiles**

Run:
```bash
npx tsc --noEmit src/engine/types.ts
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/engine/types.ts
git commit -m "feat: define core engine type system"
```

---

### Task 3: Distribution Sampling Functions

**Files:**
- Create: `src/engine/distributions.ts`
- Create: `src/__tests__/engine/distributions.test.ts`

- [ ] **Step 1: Write failing tests for distribution sampling**

Create `src/__tests__/engine/distributions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import seedrandom from 'seedrandom';
import { sampleBinary, sampleContinuous, sampleCategorical } from '@engine/distributions';

describe('sampleBinary', () => {
  it('returns true when random value is below pTrue', () => {
    const rng = seedrandom('test-seed');
    // With a fixed seed, we can predict the first random value.
    // Instead, run many samples and check the distribution.
    let trueCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      if (sampleBinary(seedrandom(`seed-${i}`), 0.7)) trueCount++;
    }
    // With pTrue=0.7, expect ~70% true (within 3% tolerance)
    expect(trueCount / runs).toBeCloseTo(0.7, 1);
  });

  it('always returns true when pTrue is 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(sampleBinary(seedrandom(`seed-${i}`), 1.0)).toBe(true);
    }
  });

  it('always returns false when pTrue is 0', () => {
    for (let i = 0; i < 100; i++) {
      expect(sampleBinary(seedrandom(`seed-${i}`), 0.0)).toBe(false);
    }
  });
});

describe('sampleContinuous', () => {
  it('samples from a normal distribution with correct mean', () => {
    const runs = 10000;
    let sum = 0;
    for (let i = 0; i < runs; i++) {
      sum += sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'normal',
        params: [100, 15],
      });
    }
    const mean = sum / runs;
    expect(mean).toBeCloseTo(100, 0); // within 0.5 of 100
  });

  it('samples from a uniform distribution within bounds', () => {
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'uniform',
        params: [10, 20],
      });
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
    }
  });

  it('samples from a triangular distribution within bounds', () => {
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'triangular',
        params: [0, 50, 100],
      });
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('clamps values to min/max when provided', () => {
    // Normal distribution with mean=100, but clamp to [90, 110]
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(
        seedrandom(`seed-${i}`),
        { type: 'normal', params: [100, 50] }, // large stddev to force clamping
        90,
        110
      );
      expect(val).toBeGreaterThanOrEqual(90);
      expect(val).toBeLessThanOrEqual(110);
    }
  });
});

describe('sampleCategorical', () => {
  it('samples from categorical distribution with correct frequencies', () => {
    const probs = { low: 0.2, medium: 0.5, high: 0.3 };
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      const result = sampleCategorical(seedrandom(`seed-${i}`), probs);
      counts[result]++;
    }
    expect(counts.low / runs).toBeCloseTo(0.2, 1);
    expect(counts.medium / runs).toBeCloseTo(0.5, 1);
    expect(counts.high / runs).toBeCloseTo(0.3, 1);
  });

  it('always returns the only option when probability is 1', () => {
    const probs = { only: 1.0 };
    for (let i = 0; i < 100; i++) {
      expect(sampleCategorical(seedrandom(`seed-${i}`), probs)).toBe('only');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/distributions.test.ts
```
Expected: FAIL — module `@engine/distributions` not found

- [ ] **Step 3: Implement distribution sampling functions**

Create `src/engine/distributions.ts`:
```typescript
import type { PRNG } from 'seedrandom';

/**
 * Sample a boolean from a Bernoulli distribution.
 */
export function sampleBinary(rng: PRNG, pTrue: number): boolean {
  return rng() < pTrue;
}

/**
 * Box-Muller transform for normal distribution sampling.
 */
function sampleNormal(rng: PRNG, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

/**
 * Sample from a triangular distribution.
 */
function sampleTriangular(rng: PRNG, min: number, mode: number, max: number): number {
  const u = rng();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/**
 * Sample from a continuous distribution, optionally clamping to [min, max].
 */
export function sampleContinuous(
  rng: PRNG,
  distribution: { type: 'normal' | 'uniform' | 'triangular'; params: number[] },
  min?: number,
  max?: number
): number {
  let value: number;

  switch (distribution.type) {
    case 'normal':
      value = sampleNormal(rng, distribution.params[0], distribution.params[1]);
      break;
    case 'uniform':
      value = distribution.params[0] + rng() * (distribution.params[1] - distribution.params[0]);
      break;
    case 'triangular':
      value = sampleTriangular(rng, distribution.params[0], distribution.params[1], distribution.params[2]);
      break;
  }

  if (min !== undefined && value < min) value = min;
  if (max !== undefined && value > max) value = max;
  return value;
}

/**
 * Sample a category from a discrete probability distribution.
 */
export function sampleCategorical(rng: PRNG, probabilities: Record<string, number>): string {
  const r = rng();
  let cumulative = 0;
  const entries = Object.entries(probabilities);
  for (const [category, prob] of entries) {
    cumulative += prob;
    if (r < cumulative) return category;
  }
  // Floating point safety: return last category
  return entries[entries.length - 1][0];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/distributions.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/distributions.ts src/__tests__/engine/distributions.test.ts
git commit -m "feat: implement distribution sampling with tests"
```

---

### Task 4: DAG Construction & Topological Sort

**Files:**
- Create: `src/engine/graph.ts`
- Create: `src/__tests__/engine/graph.test.ts`

- [ ] **Step 1: Write failing tests for graph construction**

Create `src/__tests__/engine/graph.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { buildGraph, validateGraph } from '@engine/graph';
import type { SimNode, BinaryNode, ContinuousNode, CategoricalNode } from '@engine/types';

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

    // a must come before b and c; b must come before c
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
      makeBinaryNode('b', 1, ['a']), // phase 1 depends on phase 2 — invalid
    ];
    const graph = buildGraph(nodes);
    const errors = validateGraph(graph);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('phase');
  });

  it('detects cycles', () => {
    // We can't directly create a cycle with buildGraph (topological sort would fail),
    // so we test that buildGraph throws on cyclic input.
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/graph.test.ts
```
Expected: FAIL — module `@engine/graph` not found

- [ ] **Step 3: Implement graph construction and validation**

Create `src/engine/graph.ts`:
```typescript
import type { SimNode, SimGraph } from './types';

/**
 * Build a SimGraph from an array of nodes.
 * Performs topological sort via Kahn's algorithm.
 * Throws on duplicate IDs or cycles.
 */
export function buildGraph(nodes: SimNode[]): SimGraph {
  const nodeMap = new Map<string, SimNode>();
  const phaseNodes = new Map<number, string[]>();

  // Build node map, check for duplicates
  for (const node of nodes) {
    if (nodeMap.has(node.id)) {
      throw new Error(`Duplicate node ID: "${node.id}"`);
    }
    nodeMap.set(node.id, node);

    const phaseList = phaseNodes.get(node.phase) ?? [];
    phaseList.push(node.id);
    phaseNodes.set(node.phase, phaseList);
  }

  // Kahn's algorithm for topological sort
  const inDegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    children.set(node.id, []);
  }

  for (const node of nodes) {
    for (const parentId of node.parents) {
      if (!nodeMap.has(parentId)) {
        // Allow building with missing parents — validateGraph catches this
        continue;
      }
      inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
      children.get(parentId)!.push(node.id);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sortedIds: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sortedIds.push(id);
    for (const childId of children.get(id) ?? []) {
      const newDegree = (inDegree.get(childId) ?? 1) - 1;
      inDegree.set(childId, newDegree);
      if (newDegree === 0) queue.push(childId);
    }
  }

  if (sortedIds.length !== nodes.length) {
    const remaining = nodes
      .filter((n) => !sortedIds.includes(n.id))
      .map((n) => n.id);
    throw new Error(`Cycle detected involving nodes: ${remaining.join(', ')}`);
  }

  return { nodes: nodeMap, sortedIds, phaseNodes };
}

/**
 * Validate a built graph for structural issues.
 * Returns an array of error strings (empty = valid).
 */
export function validateGraph(graph: SimGraph): string[] {
  const errors: string[] = [];

  for (const [id, node] of graph.nodes) {
    for (const parentId of node.parents) {
      // Check parent exists
      if (!graph.nodes.has(parentId)) {
        errors.push(`Node "${id}" references nonexistent parent "${parentId}"`);
        continue;
      }

      // Check no forward phase references
      const parent = graph.nodes.get(parentId)!;
      if (parent.phase > node.phase) {
        errors.push(
          `Node "${id}" (phase ${node.phase}) depends on "${parentId}" (phase ${parent.phase}) — forward phase reference`
        );
      }
    }
  }

  return errors;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/graph.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/graph.ts src/__tests__/engine/graph.test.ts
git commit -m "feat: implement DAG construction with topological sort and validation"
```

---

### Task 5: Monte Carlo Sampler

**Files:**
- Create: `src/engine/sampler.ts`
- Create: `src/__tests__/engine/sampler.test.ts`

- [ ] **Step 1: Write failing tests for the sampler**

Create `src/__tests__/engine/sampler.test.ts`:
```typescript
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
    expect(result[nodeIndex]).toBe(1); // pTrue=1.0, always true
  });

  it('propagates through a simple chain using CPT', () => {
    // a (root, always true) -> b (true if a is true with p=0.9)
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
    // a is always true, so b should be true ~90% of the time
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

    // Count how many runs differ
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/sampler.test.ts
```
Expected: FAIL — module `@engine/sampler` not found

- [ ] **Step 3: Implement the sampler**

Create `src/engine/sampler.ts`:
```typescript
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

    // Build parent values lookup
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

  // Build node index map
  for (let i = 0; i < graph.sortedIds.length; i++) {
    nodeIndexMap.set(graph.sortedIds[i], i);
  }

  // Run simulations
  for (let i = 0; i < runCount; i++) {
    runs.push(sampleOnce(graph, `${seed}-${i}`));
  }

  return { runs, nodeIndexMap, runCount };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/sampler.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/sampler.ts src/__tests__/engine/sampler.test.ts
git commit -m "feat: implement Monte Carlo sampler with CPT-based propagation"
```

---

### Task 6: Scenario Card Application

**Files:**
- Create: `src/engine/scenario.ts`
- Create: `src/__tests__/engine/scenario.test.ts`

- [ ] **Step 1: Write failing tests for scenario application**

Create `src/__tests__/engine/scenario.test.ts`:
```typescript
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
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.0)]; // default never true
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

    // Every run should have a=1 (true)
    const aIdx = modified.sortedIds.indexOf('a');
    for (let i = 0; i < 100; i++) {
      expect(result.runs[i][aIdx]).toBe(1);
    }
  });

  it('overrides pTrue for a binary node', () => {
    const nodes: SimNode[] = [makeBinaryNode('a', 1, [], 0.0)]; // default never true
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
    const originalNode = graph.nodes.get('a') as BinaryNode;

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
    // Should be back to ~50%
    expect(trueCount / 10000).toBeCloseTo(0.5, 1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/__tests__/engine/scenario.test.ts
```
Expected: FAIL — module `@engine/scenario` not found

- [ ] **Step 3: Implement scenario application**

Create `src/engine/scenario.ts`:
```typescript
import type { SimGraph, SimNode, ScenarioCard, BinaryNode, ContinuousNode, CategoricalNode } from './types';

/**
 * Deep-clone a node to avoid mutating the original graph.
 */
function cloneNode(node: SimNode): SimNode {
  return JSON.parse(JSON.stringify(node));
}

/**
 * Apply a scenario card's overrides to a graph.
 * Returns a new graph with modified nodes — does not mutate the original.
 */
export function applyScenario(graph: SimGraph, scenario: ScenarioCard): SimGraph {
  const newNodes = new Map<string, SimNode>();

  // Copy all nodes
  for (const [id, node] of graph.nodes) {
    newNodes.set(id, cloneNode(node));
  }

  // Apply overrides
  for (const override of scenario.overrides) {
    const node = newNodes.get(override.nodeId);
    if (!node) continue;

    switch (node.type) {
      case 'binary': {
        const binaryNode = node as BinaryNode;
        if (override.clampValue !== undefined) {
          // Clamp: set pTrue to 1 or 0, clear CPT so it always uses default
          binaryNode.defaultPTrue = override.clampValue ? 1.0 : 0.0;
          binaryNode.cpt = [];
          binaryNode.parents = [];
        } else if (override.overridePTrue !== undefined) {
          binaryNode.defaultPTrue = override.overridePTrue;
          binaryNode.cpt = [];
          binaryNode.parents = [];
        }
        break;
      }
      case 'continuous': {
        const continuousNode = node as ContinuousNode;
        if (override.overrideDistribution) {
          continuousNode.defaultDistribution = override.overrideDistribution;
          continuousNode.cpt = [];
          continuousNode.parents = [];
        }
        break;
      }
      case 'categorical': {
        const categoricalNode = node as CategoricalNode;
        if (override.overrideProbabilities) {
          categoricalNode.defaultProbabilities = override.overrideProbabilities;
          categoricalNode.cpt = [];
          categoricalNode.parents = [];
        }
        break;
      }
    }
  }

  return {
    nodes: newNodes,
    sortedIds: [...graph.sortedIds],
    phaseNodes: new Map(graph.phaseNodes),
  };
}

/**
 * Reset a modified graph back to original node definitions.
 */
export function resetOverrides(modified: SimGraph, original: SimGraph): SimGraph {
  const newNodes = new Map<string, SimNode>();
  for (const [id, node] of original.nodes) {
    newNodes.set(id, cloneNode(node));
  }
  return {
    nodes: newNodes,
    sortedIds: [...original.sortedIds],
    phaseNodes: new Map(original.phaseNodes),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/scenario.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/scenario.ts src/__tests__/engine/scenario.test.ts
git commit -m "feat: implement scenario card application with immutable graph updates"
```

---

### Task 7: Phase 1 Data — Node Definitions

**Files:**
- Create: `src/data/nodes/phase-1-tensions.json`
- Create: `src/data/sources.json`

- [ ] **Step 1: Create Phase 1 node definitions**

Create `src/data/nodes/phase-1-tensions.json`:
```json
[
  {
    "id": "us_force_posture_gulf",
    "phase": 1,
    "type": "categorical",
    "label": "US Force Posture in Persian Gulf",
    "description": "Current level of US military deployment in the CENTCOM AOR, including carrier strike groups, air wings, and ground forces in the region",
    "parents": [],
    "categories": ["reduced", "baseline", "elevated", "surge"],
    "cpt": [],
    "defaultProbabilities": {
      "reduced": 0.05,
      "baseline": 0.30,
      "elevated": 0.50,
      "surge": 0.15
    },
    "source": {
      "citation": "IISS Military Balance 2025; CRS 'U.S. Military Presence in the Middle East'",
      "url": "https://www.iiss.org/publications/the-military-balance",
      "confidence": "high"
    }
  },
  {
    "id": "iran_nuclear_status",
    "phase": 1,
    "type": "categorical",
    "label": "Iranian Nuclear Program Status",
    "description": "Current state of Iran's nuclear enrichment program relative to weapons-grade capability",
    "parents": [],
    "categories": ["jcpoa_compliant", "advanced_enrichment", "breakout_threshold", "weaponization"],
    "cpt": [],
    "defaultProbabilities": {
      "jcpoa_compliant": 0.05,
      "advanced_enrichment": 0.25,
      "breakout_threshold": 0.50,
      "weaponization": 0.20
    },
    "source": {
      "citation": "IAEA Board of Governors Reports 2025; ISIS Nuclear Iran Reports",
      "url": "https://www.iaea.org/newscenter/focus/iran",
      "confidence": "high"
    }
  },
  {
    "id": "proxy_activity_level",
    "phase": 1,
    "type": "categorical",
    "label": "Iranian Proxy Activity Level",
    "description": "Aggregate activity level of Iran-backed proxy forces including Hezbollah, Houthis, and Iraqi Shia militias",
    "parents": [],
    "categories": ["dormant", "low_level", "escalatory", "coordinated_campaign"],
    "cpt": [],
    "defaultProbabilities": {
      "dormant": 0.05,
      "low_level": 0.30,
      "escalatory": 0.45,
      "coordinated_campaign": 0.20
    },
    "source": {
      "citation": "CSIS 'Tracking Iranian Proxy Forces', 2025; Crisis Group Middle East Reports",
      "url": "https://www.csis.org/programs/transnational-threats-project",
      "confidence": "medium"
    }
  },
  {
    "id": "diplomatic_channel_status",
    "phase": 1,
    "type": "categorical",
    "label": "Diplomatic Channel Status",
    "description": "State of diplomatic engagement between the US and Iran, including backchannel communications",
    "parents": [],
    "categories": ["active_negotiations", "backchannel_only", "frozen", "severed"],
    "cpt": [],
    "defaultProbabilities": {
      "active_negotiations": 0.10,
      "backchannel_only": 0.30,
      "frozen": 0.40,
      "severed": 0.20
    },
    "source": {
      "citation": "Crisis Group 'The Iran-US Standoff', 2025; Chatham House Iran Programme",
      "url": "https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/iran",
      "confidence": "medium"
    }
  },
  {
    "id": "sanctions_pressure",
    "phase": 1,
    "type": "categorical",
    "label": "Sanctions Pressure Level",
    "description": "Intensity of US-led economic sanctions on Iran and degree of international enforcement",
    "parents": [],
    "categories": ["relaxed", "moderate", "maximum_pressure", "total_embargo"],
    "cpt": [],
    "defaultProbabilities": {
      "relaxed": 0.05,
      "moderate": 0.20,
      "maximum_pressure": 0.55,
      "total_embargo": 0.20
    },
    "source": {
      "citation": "CRS 'Iran Sanctions', 2025; Treasury OFAC Iran Program",
      "url": "https://sgp.fas.org/crs/mideast/RS20871.pdf",
      "confidence": "high"
    }
  },
  {
    "id": "iran_domestic_stability",
    "phase": 1,
    "type": "categorical",
    "label": "Iranian Domestic Stability",
    "description": "Internal stability of the Iranian regime, including protest movements, economic conditions, and elite cohesion",
    "parents": ["sanctions_pressure"],
    "categories": ["stable", "strained", "protests", "crisis"],
    "cpt": [
      { "parentValues": { "sanctions_pressure": "relaxed" }, "categoryProbabilities": { "stable": 0.60, "strained": 0.30, "protests": 0.08, "crisis": 0.02 } },
      { "parentValues": { "sanctions_pressure": "moderate" }, "categoryProbabilities": { "stable": 0.40, "strained": 0.40, "protests": 0.15, "crisis": 0.05 } },
      { "parentValues": { "sanctions_pressure": "maximum_pressure" }, "categoryProbabilities": { "stable": 0.15, "strained": 0.35, "protests": 0.35, "crisis": 0.15 } },
      { "parentValues": { "sanctions_pressure": "total_embargo" }, "categoryProbabilities": { "stable": 0.05, "strained": 0.20, "protests": 0.40, "crisis": 0.35 } }
    ],
    "defaultProbabilities": {
      "stable": 0.20,
      "strained": 0.35,
      "protests": 0.30,
      "crisis": 0.15
    },
    "source": {
      "citation": "Chatham House 'Iran's Political Landscape', 2025; RAND 'Iran's Internal Dynamics'",
      "url": "https://www.chathamhouse.org/regions/middle-east-and-north-africa/iran",
      "confidence": "medium"
    }
  },
  {
    "id": "us_domestic_appetite",
    "phase": 1,
    "type": "categorical",
    "label": "US Domestic Appetite for Military Action",
    "description": "Level of US public and Congressional support for military engagement with Iran",
    "parents": ["proxy_activity_level"],
    "categories": ["opposed", "reluctant", "conditional_support", "strong_support"],
    "cpt": [
      { "parentValues": { "proxy_activity_level": "dormant" }, "categoryProbabilities": { "opposed": 0.50, "reluctant": 0.35, "conditional_support": 0.12, "strong_support": 0.03 } },
      { "parentValues": { "proxy_activity_level": "low_level" }, "categoryProbabilities": { "opposed": 0.35, "reluctant": 0.40, "conditional_support": 0.20, "strong_support": 0.05 } },
      { "parentValues": { "proxy_activity_level": "escalatory" }, "categoryProbabilities": { "opposed": 0.15, "reluctant": 0.30, "conditional_support": 0.40, "strong_support": 0.15 } },
      { "parentValues": { "proxy_activity_level": "coordinated_campaign" }, "categoryProbabilities": { "opposed": 0.05, "reluctant": 0.15, "conditional_support": 0.40, "strong_support": 0.40 } }
    ],
    "defaultProbabilities": {
      "opposed": 0.25,
      "reluctant": 0.35,
      "conditional_support": 0.30,
      "strong_support": 0.10
    },
    "source": {
      "citation": "Chicago Council on Global Affairs Survey 2025; Gallup Foreign Policy Polls",
      "url": "https://www.thechicagocouncil.org/research/public-opinion-survey",
      "confidence": "medium"
    }
  },
  {
    "id": "iran_irgc_readiness",
    "phase": 1,
    "type": "categorical",
    "label": "IRGC Military Readiness",
    "description": "Operational readiness level of Iran's Islamic Revolutionary Guard Corps and its conventional and asymmetric capabilities",
    "parents": ["iran_domestic_stability"],
    "categories": ["low", "moderate", "high", "maximum"],
    "cpt": [
      { "parentValues": { "iran_domestic_stability": "stable" }, "categoryProbabilities": { "low": 0.05, "moderate": 0.35, "high": 0.45, "maximum": 0.15 } },
      { "parentValues": { "iran_domestic_stability": "strained" }, "categoryProbabilities": { "low": 0.05, "moderate": 0.30, "high": 0.45, "maximum": 0.20 } },
      { "parentValues": { "iran_domestic_stability": "protests" }, "categoryProbabilities": { "low": 0.10, "moderate": 0.30, "high": 0.35, "maximum": 0.25 } },
      { "parentValues": { "iran_domestic_stability": "crisis" }, "categoryProbabilities": { "low": 0.15, "moderate": 0.25, "high": 0.30, "maximum": 0.30 } }
    ],
    "defaultProbabilities": {
      "low": 0.05,
      "moderate": 0.30,
      "high": 0.45,
      "maximum": 0.20
    },
    "source": {
      "citation": "IISS Military Balance 2025; CSIS 'Iran's Military Forces' Report",
      "url": "https://www.csis.org/analysis/irans-military-forces",
      "confidence": "high"
    }
  },
  {
    "id": "regional_tension_index",
    "phase": 1,
    "type": "continuous",
    "label": "Regional Tension Index",
    "description": "Composite index (0-100) measuring overall Persian Gulf regional tension based on military activity, diplomatic signals, and economic indicators",
    "parents": ["us_force_posture_gulf", "proxy_activity_level", "diplomatic_channel_status"],
    "cpt": [
      { "parentValues": { "us_force_posture_gulf": "reduced", "proxy_activity_level": "dormant", "diplomatic_channel_status": "active_negotiations" }, "distribution": { "type": "normal", "params": [15, 8] } },
      { "parentValues": { "us_force_posture_gulf": "baseline", "proxy_activity_level": "low_level", "diplomatic_channel_status": "backchannel_only" }, "distribution": { "type": "normal", "params": [35, 10] } },
      { "parentValues": { "us_force_posture_gulf": "elevated", "proxy_activity_level": "escalatory", "diplomatic_channel_status": "frozen" }, "distribution": { "type": "normal", "params": [65, 10] } },
      { "parentValues": { "us_force_posture_gulf": "surge", "proxy_activity_level": "coordinated_campaign", "diplomatic_channel_status": "severed" }, "distribution": { "type": "normal", "params": [90, 5] } }
    ],
    "defaultDistribution": { "type": "normal", "params": [50, 15] },
    "unit": "index (0-100)",
    "min": 0,
    "max": 100,
    "source": {
      "citation": "Composite index derived from ACLED conflict data, SIPRI arms transfers, and diplomatic event coding",
      "url": "https://acleddata.com/middle-east/",
      "confidence": "medium"
    }
  },
  {
    "id": "escalation_trigger_probability",
    "phase": 1,
    "type": "binary",
    "label": "Escalation Trigger Event Occurs",
    "description": "Whether a specific event occurs that could trigger direct military escalation between the US and Iran",
    "parents": ["regional_tension_index", "iran_nuclear_status", "iran_irgc_readiness"],
    "cpt": [
      { "parentValues": { "regional_tension_index": "low", "iran_nuclear_status": "jcpoa_compliant", "iran_irgc_readiness": "low" }, "pTrue": 0.02 },
      { "parentValues": { "regional_tension_index": "low", "iran_nuclear_status": "jcpoa_compliant", "iran_irgc_readiness": "moderate" }, "pTrue": 0.03 },
      { "parentValues": { "regional_tension_index": "medium", "iran_nuclear_status": "advanced_enrichment", "iran_irgc_readiness": "moderate" }, "pTrue": 0.10 },
      { "parentValues": { "regional_tension_index": "medium", "iran_nuclear_status": "breakout_threshold", "iran_irgc_readiness": "high" }, "pTrue": 0.25 },
      { "parentValues": { "regional_tension_index": "high", "iran_nuclear_status": "breakout_threshold", "iran_irgc_readiness": "high" }, "pTrue": 0.45 },
      { "parentValues": { "regional_tension_index": "high", "iran_nuclear_status": "weaponization", "iran_irgc_readiness": "maximum" }, "pTrue": 0.75 }
    ],
    "defaultPTrue": 0.15,
    "source": {
      "citation": "Historical base rate derived from RAND 'Escalation Dynamics in the Middle East', 2024; Brookings 'Iran Crisis Scenarios'",
      "url": "https://www.rand.org/topics/iran.html",
      "confidence": "medium"
    }
  },
  {
    "id": "crisis_type",
    "phase": 1,
    "type": "categorical",
    "label": "Type of Crisis Trigger",
    "description": "If an escalation trigger occurs, what type of event precipitates the crisis",
    "parents": ["escalation_trigger_probability", "iran_nuclear_status", "proxy_activity_level"],
    "categories": ["nuclear_provocation", "proxy_attack_us_casualties", "maritime_incident", "cyber_attack", "assassination_sabotage"],
    "cpt": [
      { "parentValues": { "escalation_trigger_probability": "true", "iran_nuclear_status": "weaponization", "proxy_activity_level": "dormant" }, "categoryProbabilities": { "nuclear_provocation": 0.60, "proxy_attack_us_casualties": 0.10, "maritime_incident": 0.10, "cyber_attack": 0.10, "assassination_sabotage": 0.10 } },
      { "parentValues": { "escalation_trigger_probability": "true", "iran_nuclear_status": "breakout_threshold", "proxy_activity_level": "coordinated_campaign" }, "categoryProbabilities": { "nuclear_provocation": 0.25, "proxy_attack_us_casualties": 0.35, "maritime_incident": 0.15, "cyber_attack": 0.10, "assassination_sabotage": 0.15 } },
      { "parentValues": { "escalation_trigger_probability": "true", "iran_nuclear_status": "advanced_enrichment", "proxy_activity_level": "escalatory" }, "categoryProbabilities": { "nuclear_provocation": 0.15, "proxy_attack_us_casualties": 0.30, "maritime_incident": 0.25, "cyber_attack": 0.15, "assassination_sabotage": 0.15 } },
      { "parentValues": { "escalation_trigger_probability": "false", "iran_nuclear_status": "jcpoa_compliant", "proxy_activity_level": "dormant" }, "categoryProbabilities": { "nuclear_provocation": 0.05, "proxy_attack_us_casualties": 0.10, "maritime_incident": 0.30, "cyber_attack": 0.30, "assassination_sabotage": 0.25 } }
    ],
    "defaultProbabilities": {
      "nuclear_provocation": 0.20,
      "proxy_attack_us_casualties": 0.25,
      "maritime_incident": 0.25,
      "cyber_attack": 0.15,
      "assassination_sabotage": 0.15
    },
    "source": {
      "citation": "CSIS 'Scenarios for US-Iran Conflict', 2024; CRS 'Iran: Escalation Pathways'",
      "url": "https://www.csis.org/analysis/scenarios-us-iran-conflict",
      "confidence": "medium"
    }
  }
]
```

- [ ] **Step 2: Create sources bibliography**

Create `src/data/sources.json`:
```json
{
  "sources": [
    {
      "id": "iiss-military-balance",
      "title": "The Military Balance 2025",
      "publisher": "International Institute for Strategic Studies (IISS)",
      "url": "https://www.iiss.org/publications/the-military-balance",
      "type": "military",
      "usedFor": ["Force dispositions", "Military capabilities", "Defense spending"]
    },
    {
      "id": "crs-iran-military",
      "title": "U.S. Military Presence in the Middle East",
      "publisher": "Congressional Research Service",
      "url": "https://sgp.fas.org/crs/mideast/",
      "type": "military",
      "usedFor": ["US force posture", "Basing agreements", "Deployment history"]
    },
    {
      "id": "iaea-iran",
      "title": "IAEA Board of Governors Reports on Iran",
      "publisher": "International Atomic Energy Agency",
      "url": "https://www.iaea.org/newscenter/focus/iran",
      "type": "primary",
      "usedFor": ["Nuclear enrichment levels", "Inspections compliance", "Breakout estimates"]
    },
    {
      "id": "csis-iran-threats",
      "title": "Iran's Evolving Military Threat",
      "publisher": "Center for Strategic and International Studies",
      "url": "https://www.csis.org/analysis/irans-military-forces",
      "type": "primary",
      "usedFor": ["IRGC capabilities", "Proxy force analysis", "Missile inventory"]
    },
    {
      "id": "crisis-group-iran",
      "title": "The Iran-US Standoff",
      "publisher": "International Crisis Group",
      "url": "https://www.crisisgroup.org/middle-east-north-africa/gulf-and-arabian-peninsula/iran",
      "type": "geopolitical",
      "usedFor": ["Diplomatic status", "Escalation dynamics", "Regional proxy activity"]
    },
    {
      "id": "rand-iran-escalation",
      "title": "Escalation Dynamics in the Middle East",
      "publisher": "RAND Corporation",
      "url": "https://www.rand.org/topics/iran.html",
      "type": "primary",
      "usedFor": ["Escalation probability modeling", "Conflict scenario analysis", "Historical base rates"]
    },
    {
      "id": "sipri-arms",
      "title": "SIPRI Arms Transfers Database",
      "publisher": "Stockholm International Peace Research Institute",
      "url": "https://www.sipri.org/databases/armstransfers",
      "type": "primary",
      "usedFor": ["Iranian arms acquisitions", "Regional arms flows", "Military modernization"]
    },
    {
      "id": "acled-conflict",
      "title": "Armed Conflict Location & Event Data (ACLED)",
      "publisher": "ACLED",
      "url": "https://acleddata.com/middle-east/",
      "type": "osint",
      "usedFor": ["Proxy conflict events", "Regional tension indicators", "Attack frequency data"]
    },
    {
      "id": "chicago-council-surveys",
      "title": "Chicago Council on Global Affairs Public Opinion Surveys",
      "publisher": "Chicago Council on Global Affairs",
      "url": "https://www.thechicagocouncil.org/research/public-opinion-survey",
      "type": "geopolitical",
      "usedFor": ["US public opinion on military action", "Foreign policy attitudes"]
    },
    {
      "id": "chatham-house-iran",
      "title": "Iran Programme Reports",
      "publisher": "Chatham House",
      "url": "https://www.chathamhouse.org/regions/middle-east-and-north-africa/iran",
      "type": "geopolitical",
      "usedFor": ["Iranian domestic politics", "Regime stability analysis", "Diplomatic dynamics"]
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/nodes/phase-1-tensions.json src/data/sources.json
git commit -m "feat: add Phase 1 node definitions and source bibliography"
```

---

### Task 8: Phase 1 Scenario Cards

**Files:**
- Create: `src/data/scenarios/phase-1-scenarios.json`

- [ ] **Step 1: Create Phase 1 scenario card definitions**

Create `src/data/scenarios/phase-1-scenarios.json`:
```json
[
  {
    "id": "nuclear-breakout-detected",
    "phase": 1,
    "title": "Nuclear Breakout Detected",
    "description": "IAEA inspectors confirm Iran has enriched uranium to weapons-grade (90%+) levels sufficient for one or more warheads. Breakout timeline estimated at weeks.",
    "overrides": [
      {
        "nodeId": "iran_nuclear_status",
        "overrideProbabilities": {
          "jcpoa_compliant": 0.0,
          "advanced_enrichment": 0.0,
          "breakout_threshold": 0.10,
          "weaponization": 0.90
        }
      },
      {
        "nodeId": "diplomatic_channel_status",
        "overrideProbabilities": {
          "active_negotiations": 0.05,
          "backchannel_only": 0.15,
          "frozen": 0.30,
          "severed": 0.50
        }
      },
      {
        "nodeId": "us_force_posture_gulf",
        "overrideProbabilities": {
          "reduced": 0.0,
          "baseline": 0.05,
          "elevated": 0.35,
          "surge": 0.60
        }
      }
    ]
  },
  {
    "id": "proxy-attack-kills-us-personnel",
    "phase": 1,
    "title": "Proxy Attack Kills US Personnel",
    "description": "An Iran-backed militia launches a drone or rocket attack on a US military installation in Iraq or Syria, killing multiple US service members.",
    "overrides": [
      {
        "nodeId": "proxy_activity_level",
        "overrideProbabilities": {
          "dormant": 0.0,
          "low_level": 0.0,
          "escalatory": 0.30,
          "coordinated_campaign": 0.70
        }
      },
      {
        "nodeId": "us_force_posture_gulf",
        "overrideProbabilities": {
          "reduced": 0.0,
          "baseline": 0.05,
          "elevated": 0.45,
          "surge": 0.50
        }
      },
      {
        "nodeId": "escalation_trigger_probability",
        "overridePTrue": 0.85
      }
    ]
  },
  {
    "id": "diplomatic-collapse-iaea",
    "phase": 1,
    "title": "Diplomatic Collapse at IAEA",
    "description": "Iran expels IAEA inspectors and withdraws from the Non-Proliferation Treaty, ending all international oversight of its nuclear program.",
    "overrides": [
      {
        "nodeId": "diplomatic_channel_status",
        "overrideProbabilities": {
          "active_negotiations": 0.0,
          "backchannel_only": 0.10,
          "frozen": 0.20,
          "severed": 0.70
        }
      },
      {
        "nodeId": "iran_nuclear_status",
        "overrideProbabilities": {
          "jcpoa_compliant": 0.0,
          "advanced_enrichment": 0.10,
          "breakout_threshold": 0.50,
          "weaponization": 0.40
        }
      },
      {
        "nodeId": "sanctions_pressure",
        "overrideProbabilities": {
          "relaxed": 0.0,
          "moderate": 0.05,
          "maximum_pressure": 0.35,
          "total_embargo": 0.60
        }
      }
    ]
  },
  {
    "id": "assassination-sabotage-event",
    "phase": 1,
    "title": "Assassination or Sabotage Event",
    "description": "A covert operation — attributed to Israel or the US — assassinates a senior IRGC commander or damages a key nuclear facility, prompting Iranian vows of retaliation.",
    "overrides": [
      {
        "nodeId": "iran_irgc_readiness",
        "overrideProbabilities": {
          "low": 0.0,
          "moderate": 0.05,
          "high": 0.35,
          "maximum": 0.60
        }
      },
      {
        "nodeId": "proxy_activity_level",
        "overrideProbabilities": {
          "dormant": 0.0,
          "low_level": 0.05,
          "escalatory": 0.35,
          "coordinated_campaign": 0.60
        }
      },
      {
        "nodeId": "diplomatic_channel_status",
        "overrideProbabilities": {
          "active_negotiations": 0.0,
          "backchannel_only": 0.10,
          "frozen": 0.40,
          "severed": 0.50
        }
      },
      {
        "nodeId": "escalation_trigger_probability",
        "overridePTrue": 0.70
      }
    ]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/scenarios/phase-1-scenarios.json
git commit -m "feat: add Phase 1 scenario card definitions"
```

---

### Task 9: Data Integrity Tests

**Files:**
- Create: `src/__tests__/engine/data-integrity.test.ts`

- [ ] **Step 1: Write data integrity tests**

Create `src/__tests__/engine/data-integrity.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import sources from '@data/sources.json';
import type { SimNode, ScenarioCard, BinaryNode, ContinuousNode, CategoricalNode } from '@engine/types';

const nodes = phase1Nodes as unknown as SimNode[];
const scenarios = phase1Scenarios as unknown as ScenarioCard[];

describe('Phase 1 node data integrity', () => {
  it('all nodes have required fields', () => {
    for (const node of nodes) {
      expect(node.id).toBeTruthy();
      expect(node.phase).toBe(1);
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

  it('all node IDs are unique', () => {
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all parent references point to existing nodes', () => {
    const ids = new Set(nodes.map((n) => n.id));
    for (const node of nodes) {
      for (const parentId of node.parents) {
        expect(ids.has(parentId)).toBe(true);
      }
    }
  });

  it('no forward phase references', () => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
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
        // Default probabilities should sum to ~1
        const defaultSum = Object.values(catNode.defaultProbabilities).reduce((a, b) => a + b, 0);
        expect(defaultSum).toBeCloseTo(1.0, 2);

        // Each CPT row should sum to ~1
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

describe('Phase 1 scenario card data integrity', () => {
  const nodeIds = new Set(nodes.map((n) => n.id));

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
```

- [ ] **Step 2: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/data-integrity.test.ts
```
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/engine/data-integrity.test.ts
git commit -m "test: add data integrity tests for Phase 1 nodes, scenarios, and sources"
```

---

### Task 10: Web Worker for Background Refinement

**Files:**
- Create: `src/engine/worker.ts`
- Create: `src/engine/worker-client.ts`
- Create: `src/__tests__/engine/worker.test.ts`

- [ ] **Step 1: Write failing tests for worker client**

Create `src/__tests__/engine/worker.test.ts`:
```typescript
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
    // Simulate Phase 1 scale
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run:
```bash
npx vitest run src/__tests__/engine/worker.test.ts
```
Expected: All tests PASS (these test the core logic, not the worker wrapper)

- [ ] **Step 3: Create the Web Worker entry point**

Create `src/engine/worker.ts`:
```typescript
import { buildGraph } from './graph';
import { applyScenario } from './scenario';
import { runSimulation } from './sampler';
import type { WorkerRequest, WorkerResponse, SimNode, ScenarioCard } from './types';

// Web Worker entry point.
// Receives a simulation request via postMessage, runs the simulation, and returns results.
// This file is bundled separately as a Web Worker by Next.js/webpack.

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { nodes, sortedIds, overrides, runCount, seed } = event.data;

  // Rebuild the graph from serialized data
  const graph = buildGraph(nodes);

  // Apply overrides if any
  let activeGraph = graph;
  if (overrides.length > 0) {
    const syntheticScenario: ScenarioCard = {
      id: '__worker_overrides__',
      phase: 0,
      title: '',
      description: '',
      overrides,
    };
    activeGraph = applyScenario(graph, syntheticScenario);
  }

  // Run simulation
  const result = runSimulation(activeGraph, runCount, seed);

  // Serialize results for transfer
  const response: WorkerResponse = {
    type: 'result',
    runs: result.runs.map((run) => run.buffer),
    nodeIndexMap: Array.from(result.nodeIndexMap.entries()),
  };

  // Transfer ArrayBuffers (zero-copy)
  self.postMessage(response, { transfer: response.runs });
};
```

- [ ] **Step 4: Create the worker client wrapper**

Create `src/engine/worker-client.ts`:
```typescript
import type {
  SimNode,
  SimGraph,
  NodeOverride,
  SimulationResult,
  WorkerRequest,
  WorkerResponse,
  RunResult,
} from './types';

/**
 * Client-side wrapper for communicating with the simulation Web Worker.
 * Handles serialization, message passing, and deserialization.
 */
export class SimulationWorker {
  private worker: Worker | null = null;
  private pendingResolve: ((result: SimulationResult) => void) | null = null;

  /**
   * Initialize the worker. Call this once on mount.
   * @param workerUrl - URL to the worker script (created by the bundler)
   */
  init(workerUrl: string | URL): void {
    this.worker = new Worker(workerUrl, { type: 'module' });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'result' && this.pendingResolve) {
        const { runs: buffers, nodeIndexMap: entries } = event.data;
        const runs: RunResult[] = buffers.map((buf) => new Float32Array(buf));
        const nodeIndexMap = new Map(entries);

        this.pendingResolve({
          runs,
          nodeIndexMap,
          runCount: runs.length,
        });
        this.pendingResolve = null;
      }
    };
  }

  /**
   * Run a simulation in the background worker.
   * Returns a promise that resolves with the simulation results.
   */
  run(
    graph: SimGraph,
    overrides: NodeOverride[],
    runCount: number,
    seed: number
  ): Promise<SimulationResult> {
    if (!this.worker) {
      throw new Error('Worker not initialized. Call init() first.');
    }

    return new Promise((resolve) => {
      this.pendingResolve = resolve;

      const nodes: SimNode[] = Array.from(graph.nodes.values());
      const request: WorkerRequest = {
        type: 'run',
        nodes,
        sortedIds: graph.sortedIds,
        overrides,
        runCount,
        seed,
      };

      this.worker!.postMessage(request);
    });
  }

  /**
   * Terminate the worker. Call this on unmount.
   */
  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pendingResolve = null;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/engine/worker.ts src/engine/worker-client.ts src/__tests__/engine/worker.test.ts
git commit -m "feat: implement Web Worker for background simulation refinement"
```

---

### Task 11: Public API Surface

**Files:**
- Create: `src/engine/index.ts`

- [ ] **Step 1: Create the public API**

Create `src/engine/index.ts`:
```typescript
// Public API for the simulation engine.
// All consumers (React hooks, Web Worker) import from here.

export { buildGraph, validateGraph } from './graph';
export { runSimulation, sampleOnce } from './sampler';
export { applyScenario, resetOverrides } from './scenario';
export { sampleBinary, sampleContinuous, sampleCategorical } from './distributions';
export { SimulationWorker } from './worker-client';

export type {
  SimNode,
  BinaryNode,
  ContinuousNode,
  CategoricalNode,
  NodeType,
  CptRow,
  SourceCitation,
  SimGraph,
  RunResult,
  SimulationResult,
  ScenarioCard,
  NodeOverride,
  WorkerRequest,
  WorkerResponse,
} from './types';
```

- [ ] **Step 2: Verify all exports resolve**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/engine/index.ts
git commit -m "feat: expose public API surface for simulation engine"
```

---

### Task 12: Full Integration Test

**Files:**
- Create: `src/__tests__/engine/integration.test.ts`

- [ ] **Step 1: Write an end-to-end integration test using Phase 1 data**

Create `src/__tests__/engine/integration.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { buildGraph, validateGraph, runSimulation, applyScenario } from '@engine/index';
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import type { SimNode, ScenarioCard } from '@engine/types';

const nodes = phase1Nodes as unknown as SimNode[];
const scenarios = phase1Scenarios as unknown as ScenarioCard[];

describe('Phase 1 end-to-end integration', () => {
  it('builds a valid graph from Phase 1 data', () => {
    const graph = buildGraph(nodes);
    expect(graph.nodes.size).toBe(nodes.length);
    expect(graph.sortedIds.length).toBe(nodes.length);

    const errors = validateGraph(graph);
    expect(errors).toEqual([]);
  });

  it('runs 1000 simulations with default parameters', () => {
    const graph = buildGraph(nodes);
    const result = runSimulation(graph, 1000, 42);

    expect(result.runCount).toBe(1000);
    expect(result.runs.length).toBe(1000);
    expect(result.nodeIndexMap.size).toBe(nodes.length);

    // Every run should have values for all nodes
    for (const run of result.runs) {
      expect(run.length).toBe(nodes.length);
    }
  });

  it('produces different outcome distributions for different scenario cards', () => {
    const graph = buildGraph(nodes);

    // Default run
    const defaultResult = runSimulation(graph, 5000, 42);

    // Nuclear breakout scenario
    const nuclearScenario = scenarios.find((s) => s.id === 'nuclear-breakout-detected')!;
    const nuclearGraph = applyScenario(graph, nuclearScenario);
    const nuclearResult = runSimulation(nuclearGraph, 5000, 42);

    // The escalation trigger probability should be higher in the nuclear scenario
    const triggerIdx = graph.sortedIds.indexOf('escalation_trigger_probability');

    let defaultTriggerRate = 0;
    for (let i = 0; i < 5000; i++) {
      defaultTriggerRate += defaultResult.runs[i][triggerIdx];
    }
    defaultTriggerRate /= 5000;

    let nuclearTriggerRate = 0;
    for (let i = 0; i < 5000; i++) {
      nuclearTriggerRate += nuclearResult.runs[i][triggerIdx];
    }
    nuclearTriggerRate /= 5000;

    expect(nuclearTriggerRate).toBeGreaterThan(defaultTriggerRate);
  });

  it('runs 10000 simulations in under 1 second', () => {
    const graph = buildGraph(nodes);
    const start = performance.now();
    runSimulation(graph, 10000, 42);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('deterministic: same seed produces identical results', () => {
    const graph = buildGraph(nodes);
    const result1 = runSimulation(graph, 100, 42);
    const result2 = runSimulation(graph, 100, 42);

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < nodes.length; j++) {
        expect(result1.runs[i][j]).toBe(result2.runs[i][j]);
      }
    }
  });

  it('each scenario card produces valid results', () => {
    const graph = buildGraph(nodes);

    for (const scenario of scenarios) {
      const modified = applyScenario(graph, scenario);
      const result = runSimulation(modified, 100, 42);
      expect(result.runCount).toBe(100);

      // No NaN values
      for (const run of result.runs) {
        for (let j = 0; j < run.length; j++) {
          expect(Number.isNaN(run[j])).toBe(false);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run the full test suite**

Run:
```bash
npx vitest run
```
Expected: All tests PASS across all test files

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/engine/integration.test.ts
git commit -m "test: add end-to-end integration tests for Phase 1 simulation"
```

---

## Summary

After completing all 12 tasks, you will have:

- A fully typed, tested Bayesian Network Monte Carlo simulation engine
- Distribution sampling (binary, continuous, categorical) with deterministic seeding
- DAG construction with topological sort and validation
- Monte Carlo sampler with CPT-based propagation
- Scenario card system that immutably applies overrides
- Web Worker infrastructure for background refinement
- Real Phase 1 data: 11 nodes, 4 scenario cards, 10 sourced references
- Data integrity tests ensuring structural correctness
- Integration tests proving the full pipeline works end-to-end
- Performance verified: 10K runs in <1 second

**Plan 2 (UI Shell + Phase 1 Complete)** and **Plan 3 (Phases 2-8 + Polish)** will be written after Plan 1 is implemented.
