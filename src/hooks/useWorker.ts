'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { SimGraph, NodeOverride, SimulationResult } from '@engine/types';
import { SimulationWorker } from '@engine/worker-client';

export function useWorker() {
  const workerRef = useRef<SimulationWorker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const initWorker = useCallback((url: string | URL) => {
    workerRef.current = new SimulationWorker();
    workerRef.current.init(url);
  }, []);

  const runInWorker = useCallback(
    async (
      graph: SimGraph,
      overrides: NodeOverride[],
      runCount: number,
      seed: number
    ): Promise<SimulationResult> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized');
      }
      return workerRef.current.run(graph, overrides, runCount, seed);
    },
    []
  );

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { initWorker, runInWorker, terminateWorker };
}
