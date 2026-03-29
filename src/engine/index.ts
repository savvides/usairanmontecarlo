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
  MatchQuality,
  NodeDiagnostics,
  SimulationDiagnostics,
  ScenarioCard,
  NodeOverride,
  WorkerRequest,
  WorkerResponse,
} from './types';
