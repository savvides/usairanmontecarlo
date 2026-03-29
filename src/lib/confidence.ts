import type { NodeDiagnostics, NodeType, SourceCitation } from '@engine/types';

export function computeNodeConfidence(
  diagnostics: NodeDiagnostics,
  runCount: number,
  nodeType: NodeType,
  observedMeanOrProportion: number,
  source: SourceCitation,
  minCategoryCount?: number
): number {
  const total = diagnostics.exact + diagnostics.interpolated + diagnostics.default;
  if (total === 0) return 0;

  // CPT Coverage Score (40%)
  const cptScore =
    (diagnostics.exact * 1.0 + diagnostics.interpolated * 0.6 + diagnostics.default * 0.2) / total;

  // Sample Adequacy Score (30%)
  let sampleScore: number;
  switch (nodeType) {
    case 'binary': {
      const p = observedMeanOrProportion;
      sampleScore = Math.min(1, (runCount * p * (1 - p)) / 2000);
      break;
    }
    case 'categorical': {
      const minCount = minCategoryCount ?? 0;
      sampleScore = Math.min(1, minCount / 30);
      break;
    }
    case 'continuous':
      sampleScore = 1.0;
      break;
  }

  // Source Confidence Score (30%)
  const sourceScore = source.confidence === 'high' ? 1.0 : source.confidence === 'medium' ? 0.6 : 0.3;

  return cptScore * 0.4 + sampleScore * 0.3 + sourceScore * 0.3;
}

export type ConfidenceTier = 'high' | 'medium' | 'low';

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}
