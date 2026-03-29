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

export interface SimulationResult {
  runs: RunResult[]; // array of runs, each run is a Float32Array indexed by node position in sortedIds
  nodeIndexMap: Map<string, number>; // node ID -> index in RunResult
  runCount: number;
  diagnostics: SimulationDiagnostics;
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
