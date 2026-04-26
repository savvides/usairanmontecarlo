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
 * Client-side wrapper for the simulation Web Worker.
 * Tracks each request by ID so callers can discard stale results
 * when scenarios change faster than the worker can respond.
 */
export class SimulationWorker {
  private worker: Worker | null = null;
  private nextId = 0;
  private pending = new Map<number, (result: SimulationResult) => void>();

  /**
   * Attach a pre-constructed Worker. Constructing the Worker outside this
   * class lets the bundler statically detect `new Worker(new URL(...))` and
   * transpile the worker entrypoint correctly (Turbopack/webpack pattern).
   */
  attach(worker: Worker, onError?: (err: ErrorEvent) => void): void {
    this.worker = worker;
    this.worker.onerror = (err) => {
      onError?.(err);
    };
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type !== 'result') return;
      const { id, runs: buffers, nodeIndexMap: entries, diagnosticsNodes } = event.data;
      const resolve = this.pending.get(id);
      if (!resolve) return;
      this.pending.delete(id);

      const runs: RunResult[] = buffers.map((buf) => new Float32Array(buf));
      resolve({
        runs,
        nodeIndexMap: new Map(entries),
        runCount: runs.length,
        diagnostics: { nodes: new Map(diagnosticsNodes) },
      });
    };
  }

  run(
    graph: SimGraph,
    overrides: NodeOverride[],
    runCount: number,
    seed: number
  ): Promise<SimulationResult> {
    if (!this.worker) {
      throw new Error('Worker not initialized. Call attach() first.');
    }

    const id = this.nextId++;
    return new Promise((resolve) => {
      this.pending.set(id, resolve);

      const nodes: SimNode[] = Array.from(graph.nodes.values());
      const request: WorkerRequest = {
        type: 'run',
        id,
        nodes,
        sortedIds: graph.sortedIds,
        overrides,
        runCount,
        seed,
      };

      this.worker!.postMessage(request);
    });
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
