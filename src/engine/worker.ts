import { buildGraph } from './graph';
import { applyScenario } from './scenario';
import { runSimulation } from './sampler';
import type { WorkerRequest, WorkerResponse, SimNode, ScenarioCard } from './types';

// Web Worker entry point.
// Receives a simulation request via postMessage, runs the simulation, and returns results.
// This file is bundled separately as a Web Worker by Next.js/webpack.

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, nodes, overrides, runCount, seed } = event.data;

  const graph = buildGraph(nodes);

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

  const result = runSimulation(activeGraph, runCount, seed);

  const response: WorkerResponse = {
    type: 'result',
    id,
    runs: result.runs.map((run) => run.buffer as ArrayBuffer),
    nodeIndexMap: Array.from(result.nodeIndexMap.entries()),
    diagnosticsNodes: Array.from(result.diagnostics.nodes.entries()),
  };

  // Transfer ArrayBuffers (zero-copy). diagnosticsNodes is small enough to copy.
  self.postMessage(response, { transfer: response.runs });
};
