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
      if (!graph.nodes.has(parentId)) {
        errors.push(`Node "${id}" references nonexistent parent "${parentId}"`);
        continue;
      }

      const parent = graph.nodes.get(parentId)!;
      if (parent.phase > node.phase) {
        errors.push(
          `Node "${id}" (phase ${node.phase}) depends on "${parentId}" (phase ${parent.phase}) — forward phase reference`
        );
      }
    }

    // Continuous nodes must have a non-zero range — discretization divides by (max - min).
    if (node.type === 'continuous' && node.max <= node.min) {
      errors.push(`Node "${id}" has invalid range: min=${node.min} max=${node.max}`);
    }

    // Each CPT row's parentValues keys must be a subset of node.parents.
    // Stray keys would silently create "ghost" dependencies the engine ignores.
    const parentSet = new Set(node.parents);
    for (let i = 0; i < node.cpt.length; i++) {
      const row = node.cpt[i];
      for (const key of Object.keys(row.parentValues)) {
        if (!parentSet.has(key)) {
          errors.push(
            `Node "${id}" CPT row ${i} references unknown parent "${key}" (node.parents = [${node.parents.join(', ')}])`
          );
        }
      }
    }
  }

  return errors;
}
