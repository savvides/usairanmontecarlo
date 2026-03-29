'use client';

import { useState, useCallback } from 'react';

export interface PhaseState {
  currentPhase: number;
  completedPhases: Set<number>;
  isFirstVisit: boolean;
}

const TOTAL_PHASES = 8;

export function usePhase() {
  const [state, setState] = useState<PhaseState>({
    currentPhase: 1,
    completedPhases: new Set<number>(),
    isFirstVisit: true,
  });

  const goToPhase = useCallback((phase: number) => {
    if (phase < 1 || phase > TOTAL_PHASES) return;
    setState((prev) => {
      if (prev.isFirstVisit && phase > prev.currentPhase && !prev.completedPhases.has(phase - 1)) {
        return prev;
      }
      return { ...prev, currentPhase: phase };
    });
  }, []);

  const advancePhase = useCallback(() => {
    setState((prev) => {
      const newCompleted = new Set(prev.completedPhases);
      newCompleted.add(prev.currentPhase);
      const nextPhase = Math.min(prev.currentPhase + 1, TOTAL_PHASES);
      const allComplete = newCompleted.size === TOTAL_PHASES;
      return {
        currentPhase: nextPhase,
        completedPhases: newCompleted,
        isFirstVisit: allComplete ? false : prev.isFirstVisit,
      };
    });
  }, []);

  const resetPhases = useCallback(() => {
    setState({
      currentPhase: 1,
      completedPhases: new Set<number>(),
      isFirstVisit: true,
    });
  }, []);

  return {
    ...state,
    totalPhases: TOTAL_PHASES,
    goToPhase,
    advancePhase,
    resetPhases,
    canAdvance: state.currentPhase < TOTAL_PHASES,
    canNavigateFreely: !state.isFirstVisit,
  };
}
