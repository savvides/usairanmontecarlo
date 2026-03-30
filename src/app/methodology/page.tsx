import Link from 'next/link';

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to simulation
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-text-primary">Methodology</h1>
        <p className="mt-2 text-sm text-text-secondary">
          How this simulation works, what the confidence badges mean, and what the known limitations are.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">What This Is</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              This is a Monte Carlo simulation — a technique that runs thousands of randomized
              scenarios through a mathematical model and shows you the distribution of outcomes.
              Instead of predicting a single future, it shows you the range of possibilities and
              how likely each one is.
            </p>
            <p>
              The model behind this simulation is a Bayesian network: a directed graph of 104
              interconnected variables spanning 8 phases of a potential US-Iran military conflict.
              Each variable has a probability distribution that depends on its parent variables.
              When you change an input — like selecting a crisis trigger scenario — the effects
              cascade through every connected variable in the network.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">How the Model Works</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Each variable in the network (called a &ldquo;node&rdquo;) has a conditional probability table
              (CPT) that defines how its probability distribution changes based on the state of its
              parent nodes. For example: if Iran&apos;s nuclear program is at breakout threshold AND
              IRGC military readiness is high, the probability of an escalation trigger event rises
              from a baseline of 15% to approximately 45%.
            </p>
            <p>
              When the CPT doesn&apos;t have an exact match for the current combination of parent states
              (which happens frequently with sparse data), the engine uses weighted interpolation —
              blending the closest matching CPT entries proportional to how many parent values they
              match. This ensures that parent-child relationships always influence outcomes, even
              when the data is incomplete.
            </p>
            <p>
              Each simulation run samples values for every node in topological order (parents before
              children), building one complete scenario from tensions through aftermath. The default
              configuration runs 5,000 independent scenarios to produce the probability distributions
              you see in the results panel.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">What the Confidence Badges Mean</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Each result card shows a confidence badge — <span className="font-mono text-success">high</span>,{' '}
              <span className="font-mono text-warning">medium</span>, or{' '}
              <span className="font-mono text-danger">low</span> — computed from three factors:
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                <strong className="text-text-primary">CPT Coverage (40%):</strong> How often the
                simulation engine found a matching or partially-matching CPT entry versus falling
                back to default probabilities.
              </li>
              <li>
                <strong className="text-text-primary">Sample Adequacy (30%):</strong> Whether there
                are enough simulation runs to produce statistically meaningful results for this
                variable.
              </li>
              <li>
                <strong className="text-text-primary">Source Quality (30%):</strong> The quality of
                the underlying data sources used to calibrate this variable.
              </li>
            </ul>
            <p>
              <strong className="text-text-primary">High confidence:</strong> Solid data, good
              model coverage, and sufficient samples. Trust the distribution shape and approximate values.
            </p>
            <p>
              <strong className="text-text-primary">Medium confidence:</strong> Directional
              estimate — trust the trend but not the exact percentages.
            </p>
            <p>
              <strong className="text-text-primary">Low confidence:</strong> Speculative — the model
              is making educated guesses. Treat as hypothesis generation, not forecasting.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-text-primary">Known Limitations</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary list-disc pl-5">
            <li>
              <strong className="text-text-primary">Sparse conditional probability tables</strong> mean
              some parent-child relationships are weaker than the model structure implies.
            </li>
            <li>
              <strong className="text-text-primary">Historical base rates</strong> from analogous
              conflicts are imperfect proxies for a conflict that hasn&apos;t happened.
            </li>
            <li>
              <strong className="text-text-primary">Truly novel scenarios</strong> cannot be captured by a
              model calibrated on historical data.
            </li>
            <li>
              <strong className="text-text-primary">Feedback loops</strong> are approximated as
              unrolled time steps within the directed acyclic graph.
            </li>
            <li>
              <strong className="text-text-primary">Subjective probability estimates</strong>, even
              when sourced from respected institutions, carry expert disagreement.
            </li>
            <li>
              <strong className="text-text-primary">Snapshot-in-time model</strong> — parameters
              reflect conditions as of March 29, 2026 and do not update automatically.
            </li>
            <li>
              <strong className="text-text-primary">Phases 1–2 are locked to observed data</strong> —
              the February 28 strike and the Feb 28 – Mar 10 retaliation period are historical
              record, not projections. Probabilistic modeling begins at Phase 3.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-text-primary">Sources</h2>
          <div className="mt-3 space-y-2 text-sm text-text-secondary">
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Primary</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>CSIS — Center for Strategic and International Studies</li>
              <li>RAND Corporation</li>
              <li>IISS — International Institute for Strategic Studies</li>
              <li>SIPRI — Stockholm International Peace Research Institute</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Military</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>Congressional Research Service (CRS)</li>
              <li>GlobalFirepower / Jane&apos;s Defence</li>
              <li>DoD Annual Reports</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Economic</p>
            <ul className="space-y-1 pl-4 mb-4">
              <li>World Bank / IMF</li>
              <li>EIA — Energy Information Administration</li>
              <li>BP Statistical Review</li>
            </ul>
            <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Geopolitical</p>
            <ul className="space-y-1 pl-4">
              <li>Council on Foreign Relations</li>
              <li>Chatham House</li>
              <li>International Crisis Group</li>
            </ul>
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Back to Simulation
          </Link>
        </div>
      </div>
    </main>
  );
}
