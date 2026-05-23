# TODOS

## Simulation Data

## UI

## Testing

## Completed

- **Add scenario file entries for new nodes** (Completed 2026-05-23)
  Added overrides for `energy_infrastructure_targeting`, `ground_operation_feasibility`, and `drone_cost_asymmetry` to `phase-3-scenarios.json` and `phase-7-scenarios.json` for deep what-if analysis.

- **Design scenario cards for newly-mixed phases (4-7)** (Completed 2026-05-23)
  Fully designed scenario cards represent alternative geopolitical and economic futures starting from observed conditions.

- **Document expected update cadence for readers** (Completed 2026-05-23)
  Added a description to the methodology page explaining the snapshot-in-time nature of the simulation and its editorial update cadence.

- **Mobile timeline label collision** (Completed 2026-05-23)
  Staggered timeline event date labels into two rows in `TimelineBar.tsx` to prevent collision and overlap on mobile/narrow viewports.

- **Expand scenario card validation to all 8 phases** (Completed 2026-05-23)
  Modified `data-integrity.test.ts` to dynamically validate scenario card JSON files across all 8 phases.

