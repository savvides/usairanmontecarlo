# TODOS

## Simulation Data

- **Add scenario file entries for new nodes**
  **Priority:** P2
  Add scenario overrides for energy_infrastructure_targeting, ground_operation_feasibility, and drone_cost_asymmetry to phase-3-scenarios.json and phase-7-scenarios.json so users can explore what-if analysis on these dimensions.
  **Depends on:** v1.0.1.0 shipping (new nodes must exist first)

- **Design scenario cards for newly-mixed phases (4-7)**
  **Priority:** P2
  With Phases 4-7 shifting from projected to mixed, users can't currently explore what-if scenarios on these phases. Design scenario cards that let users explore divergent futures from the observed April 12 state (e.g., Phase 7: "Ceasefire holds", "Naval blockade imposed", "Ground escalation"). Needs design thinking about how observed data constrains the what-if space.
  **Depends on:** April 12 editorial update shipping first

- **Document expected update cadence for readers**
  **Priority:** P3
  Add a small note to the landing page or methodology page explaining how frequently the simulation is updated. Each manual update creates a staleness cliff — a reader on April 13 sees "as of April 12" and wonders if the site is maintained. Setting expectations builds trust.

## UI

- **Mobile timeline label collision**
  **Priority:** P3
  At 375px viewport, event labels in the timeline bar overlap each other (e.g., "AffeMab d 1Ms2..."). Pre-existing in TimelineBar.tsx since the component shipped. Worsens each cycle as more events are added (now 22 events, may grow to 30+ over the next quarter). Fix: stagger labels into two rows on narrow viewports, or show only every Nth label with a tooltip on the dots.
  **Found by:** /qa on 2026-04-25 (out of scope for v1.0.3.0)

## Testing

- **Expand scenario card validation to all 8 phases**
  **Priority:** P3
  The data integrity test now validates nodes across all phases but scenario card validation still only covers Phase 1. Expand to validate scenario files for phases 2-8.

## Completed
