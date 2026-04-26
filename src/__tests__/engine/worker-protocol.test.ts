import { describe, it, expect } from 'vitest';
import { buildGraph } from '@engine/graph';
import { runSimulation } from '@engine/sampler';
import { applyScenario } from '@engine/scenario';
import { SimulationWorker } from '@engine/worker-client';
import type {
  SimNode,
  BinaryNode,
  WorkerRequest,
  WorkerResponse,
  ScenarioCard,
} from '@engine/types';

function makeBinaryNode(id: string, parents: string[] = [], defaultPTrue = 0.5): BinaryNode {
  return {
    id,
    phase: 1,
    type: 'binary',
    label: id,
    description: id,
    parents,
    cpt: [],
    defaultPTrue,
    source: { citation: 't', url: 'https://t', confidence: 'high' },
  };
}

/**
 * Loopback Worker — runs the same logic as worker.ts in-process.
 * Lets us exercise the full message protocol (postMessage -> onmessage)
 * and the SimulationWorker wrapper without spawning a real Web Worker.
 */
function makeLoopbackWorker(): Worker {
  const fake = {
    onmessage: null as ((e: MessageEvent<WorkerResponse>) => void) | null,
    onerror: null as unknown,
    postMessage(req: WorkerRequest) {
      const graph = buildGraph(req.nodes);
      let active = graph;
      if (req.overrides.length > 0) {
        const synthetic: ScenarioCard = {
          id: '__loopback__',
          phase: 0,
          title: '',
          description: '',
          overrides: req.overrides,
        };
        active = applyScenario(graph, synthetic);
      }
      const result = runSimulation(active, req.runCount, req.seed);
      const response: WorkerResponse = {
        type: 'result',
        id: req.id,
        runs: result.runs.map((r) => r.buffer as ArrayBuffer),
        nodeIndexMap: Array.from(result.nodeIndexMap.entries()),
        diagnosticsNodes: Array.from(result.diagnostics.nodes.entries()),
      };
      // Schedule async to mirror real worker timing semantics.
      queueMicrotask(() => fake.onmessage?.({ data: response } as MessageEvent<WorkerResponse>));
    },
    terminate() {},
  };
  return fake as unknown as Worker;
}

describe('worker message protocol (loopback)', () => {
  it('round-trips runs, nodeIndexMap, and diagnostics', async () => {
    const nodes: SimNode[] = [
      makeBinaryNode('a', [], 0.7),
      makeBinaryNode('b', ['a'], 0.5),
    ];
    const graph = buildGraph(nodes);

    const wrapper = new SimulationWorker();
    wrapper.attach(makeLoopbackWorker());

    const result = await wrapper.run(graph, [], 100, 42);

    expect(result.runCount).toBe(100);
    expect(result.runs.length).toBe(100);
    expect(result.nodeIndexMap.get('a')).toBeDefined();
    expect(result.nodeIndexMap.get('b')).toBeDefined();

    // Diagnostics must be populated — the original worker dropped them silently.
    const diagA = result.diagnostics.nodes.get('a');
    const diagB = result.diagnostics.nodes.get('b');
    expect(diagA).toBeDefined();
    expect(diagB).toBeDefined();
    // Root node 'a' has no parents, so every run is an exact match.
    expect(diagA!.exact).toBe(100);
    // 'b' depends on 'a' but has no CPT rows, so every run falls to default.
    expect(diagB!.default).toBe(100);
  });

  it('routes concurrent requests to the correct promise by id', async () => {
    const nodes: SimNode[] = [makeBinaryNode('a', [], 0.5)];
    const graph = buildGraph(nodes);

    const wrapper = new SimulationWorker();
    wrapper.attach(makeLoopbackWorker());

    const [r1, r2, r3] = await Promise.all([
      wrapper.run(graph, [], 10, 1),
      wrapper.run(graph, [], 20, 2),
      wrapper.run(graph, [], 30, 3),
    ]);

    expect(r1.runCount).toBe(10);
    expect(r2.runCount).toBe(20);
    expect(r3.runCount).toBe(30);
  });

  it('terminate() clears pending so late results are dropped', async () => {
    const nodes: SimNode[] = [makeBinaryNode('a', [], 0.5)];
    const graph = buildGraph(nodes);

    let resolvedCount = 0;
    const wrapper = new SimulationWorker();
    wrapper.attach(makeLoopbackWorker());

    const p = wrapper.run(graph, [], 10, 1).then(() => {
      resolvedCount++;
    });

    wrapper.terminate();

    // Give microtasks a chance to flush.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(resolvedCount).toBe(0);

    // Mark the orphaned promise so the test runner doesn't flag it.
    void p;
  });
});
