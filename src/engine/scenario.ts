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

  for (const [id, node] of graph.nodes) {
    newNodes.set(id, cloneNode(node));
  }

  for (const override of scenario.overrides) {
    const node = newNodes.get(override.nodeId);
    if (!node) continue;

    switch (node.type) {
      case 'binary': {
        const binaryNode = node as BinaryNode;
        if (override.clampValue !== undefined) {
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
