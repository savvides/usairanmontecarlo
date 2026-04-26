# Contributing

Thanks for your interest in contributing to the USA vs Iran War Simulation.

## How to Contribute

### Updating Simulation Data

The most valuable contribution is keeping the simulation current as events unfold:

1. Fork the repo and create a branch
2. Run `npm run update` to add new timeline events
3. Update phase node data in `src/data/nodes/` if new observed facts warrant probability changes
4. Update editorial content in `src/lib/phase-content.ts`
5. Run `npm test` to verify all tests pass
6. Run `npm run build` to verify the build succeeds
7. Open a PR with a clear description of what real-world events prompted the update

### Improving the Engine

The simulation engine lives in `src/engine/` and is pure TypeScript with zero React dependencies:

- `types.ts` — all type definitions
- `graph.ts` — DAG construction and validation
- `sampler.ts` — Monte Carlo sampling with CPT interpolation
- `scenario.ts` — scenario card application
- `distributions.ts` — probability distribution sampling

All engine changes must include tests. Run `npm test` before submitting.

### Improving the UI

The frontend is Next.js with D3.js visualizations. Key files:

- `src/components/simulation/` — simulation panels and layout
- `src/components/visualizations/` — D3 chart components
- `src/hooks/` — React hooks for simulation state

### Adding Source Citations

Every node in the Bayesian network has a `source` field with a citation, URL, and confidence rating. If you find better sources or notice outdated citations, PRs are welcome.

## Development Setup

```bash
git clone https://github.com/savvides/usairanmontecarlo.git
cd usairanmontecarlo
npm install
npm run dev    # http://localhost:3000
npm test       # 121 tests
```

## Guidelines

- Keep PRs focused — one concern per PR
- Include test coverage for engine changes
- Source all probability claims with citations
- Be respectful of the sensitive subject matter — this is an educational tool about a real conflict affecting real people

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be kind, be constructive.
