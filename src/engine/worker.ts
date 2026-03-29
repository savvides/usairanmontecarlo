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
