'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProbabilityBar } from '@/components/visualizations/ProbabilityBar';
import { DistributionChart } from '@/components/visualizations/DistributionChart';
import type { SimNode, ContinuousNode } from '@engine/types';
import type { PhaseResults } from '@/hooks/useSimulation';

function useContainerWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(400);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(ref.current);
    setWidth(ref.current.clientWidth);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

interface ResultsPanelProps {
  nodes: SimNode[];
  phaseResults: PhaseResults | null;
  phase: number;
  isRunning: boolean;
}

export function ResultsPanel({ nodes, phaseResults, phase, isRunning }: ResultsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWidth = useContainerWidth(containerRef) - 24; // subtract padding (p-3 = 12px * 2)

  if (!phaseResults) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm text-text-muted">
          {isRunning ? 'Running simulation...' : 'Select a scenario to see results'}
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`results-${phase}`}
        ref={containerRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-y-auto p-5"
      >
        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4">
          Outcome Distributions
        </h3>

        <div className="space-y-6">
          {nodes.map((node) => {
            const values = phaseResults.distributions.get(node.id);
            if (!values) return null;

            const stats = phaseResults.stats.get(node.id);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-border bg-surface-elevated p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-medium text-text-primary">
                      {node.label}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {node.description.length > 80
                        ? node.description.slice(0, 80) + '...'
                        : node.description}
                    </p>
                  </div>
                  {(() => {
                    const conf = phaseResults.confidence.get(node.id);
                    const tier = conf?.tier ?? 'low';
                    return (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap ${
                          tier === 'high'
                            ? 'bg-success/10 text-success'
                            : tier === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-danger/10 text-danger'
                        }`}
                        title={conf ? `Confidence: ${(conf.score * 100).toFixed(0)}%` : ''}
                      >
                        {tier} conf.
                      </span>
                    );
                  })()}
                </div>

                {node.type === 'continuous' ? (
                  <DistributionChart
                    node={node as ContinuousNode}
                    values={values}
                    width={Math.max(chartWidth, 200)}
                    height={120}
                  />
                ) : (
                  <ProbabilityBar node={node} values={values} width={Math.max(chartWidth, 200)} />
                )}

                {stats && (
                  <div className="mt-2 flex gap-3 text-[10px] font-mono text-text-muted">
                    <span>mean: {stats.mean.toFixed(2)}</span>
                    <span>p10: {stats.p10.toFixed(2)}</span>
                    <span>p90: {stats.p90.toFixed(2)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
