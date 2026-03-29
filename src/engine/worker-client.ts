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
