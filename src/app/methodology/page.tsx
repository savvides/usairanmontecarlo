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
              The model behind this simulation is a Bayesian network: a directed graph of 107
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
          <h2 className="text-lg font-semibold text-text-primary">Theoretical Framework: Pape&apos;s Coercion Theory</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              This simulation&apos;s conflict dynamics are informed by Robert Pape&apos;s empirical research
              on strategic coercion, the most comprehensive scholarly analysis of airpower&apos;s
              political effectiveness. Pape analyzed every strategic air campaign from 1917 to 1991
              (33 cases) and found a striking pattern: airpower almost always succeeds tactically
              but almost never achieves its political objectives.
            </p>
            <p>
              <strong className="text-text-primary">The denial/punishment distinction.</strong> Pape
              classified coercive airpower into four strategies. Punishment (targeting civilians to
              force capitulation) failed in all 8 cases where it was the dominant approach.
              Decapitation (killing leaders) has never worked independently against states. Only
              denial (threatening the enemy&apos;s ability to achieve military objectives) produced
              success — and only 15% of the time (5 of 33 cases), always requiring ground forces
              to create what Pape calls a &ldquo;hammer and anvil&rdquo; effect.
            </p>
            <p>
              <strong className="text-text-primary">The escalation trap.</strong> Applied to Iran,
              Pape&apos;s framework predicts a three-stage escalation pattern. Stage 1: precision
              strikes achieve tactical success but fail to eliminate dispersed nuclear knowledge.
              Stage 2: strategic disappointment drives escalation to regime-change bombing. Stage 3:
              air coercion fails to produce political compliance, creating structural pressure for
              ground forces (~75% probability by Pape&apos;s estimate). The core logic is recursive:
              failure generates fear, fear justifies escalation, escalation produces new failure.
            </p>
            <p>
              <strong className="text-text-primary">Nationalist backlash.</strong> Pape&apos;s most
              counterintuitive finding: bombing consistently <em>strengthens</em> defender resolve
              rather than degrading it. This is the inverse of what punishment theory predicts.
              Authoritarian regimes suppress internal revolt under external pressure, and civilian
              casualties trigger rally-around-the-flag effects. Iran absorbed hundreds of thousands
              of casualties during the Iran-Iraq War without collapsing. The simulation models this
              as a positive feedback loop where higher bombing intensity increases Iranian nationalist
              resolve, making political concessions <em>less</em> likely.
            </p>
            <p>
              <strong className="text-text-primary">How this shapes the model.</strong> Four nodes
              directly encode Pape&apos;s parameters: escalation trap stage (Phase 3), Iranian
              nationalist resolve (Phase 6), coercive success probability (Phase 7), and ground
              escalation probability (Phase 7). Resolution outcomes are calibrated against Pape&apos;s
              empirical success rates — &ldquo;decisive US victory&rdquo; through airpower alone is set
              near 5%, consistent with the 0-15% historical range for punishment and denial strategies.
            </p>
            <p>
              <strong className="text-text-primary">Observed validation (April 2026).</strong> As of
              April 24, 2026, observed conflict outcomes have validated Pape&apos;s predictions with
              striking accuracy. The US air campaign achieved near-total tactical dominance over
              38 days but produced zero political concessions: the April 6 deadline passed without
              Iranian compliance; 21-hour direct negotiations in Islamabad collapsed on April 12
              when Iran refused to commit to forgoing nuclear weapons; Trump imposed a US naval
              blockade on April 13; the April 22 ceasefire expiration was met by a unilateral
              Trump extension at Pakistan&apos;s request; the second Islamabad round on April 21
              dissolved when Iran refused to attend; Iran seized two ships in Hormuz the next day;
              and on April 23 Trump ordered the Navy to &ldquo;shoot and kill&rdquo; Iranian
              mine-layers. This is textbook Stage 2 of Pape&apos;s escalation trap, now visibly
              moving toward the &ldquo;counterproductive&rdquo; outcome: Russia&apos;s foreign
              minister Lavrov has publicly warned the campaign will push Iran toward acquiring a
              nuclear weapon — Pape&apos;s canonical worst case stated by a Permanent Five member.
              The nationalist backlash coefficient is also confirmed: no wartime protests have
              emerged inside Iran, the IRGC has threatened crackdown on dissent, and the
              rally-around-the-flag effect is visible in the absence of mass opposition during
              active bombardment.
            </p>
            <p>
              <strong className="text-text-primary">Limitations of the framework.</strong> Pape&apos;s
              33-case dataset predates precision-guided standoff weapons, advanced cyber capabilities,
              and Iranian drone swarms. His bilateral model does not fully capture multilateral
              dynamics (US, Israel, Iran, proxies, Russia, China). The ~75% ground escalation estimate
              is a single analyst projection without a historical base rate for this specific scenario.
              Competing scholars (Kroenig, Mueller) argue Pape underestimates punishment&apos;s marginal
              contribution in compound strategies.
            </p>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Key Sources</h4>
            <ul className="space-y-1 text-xs text-text-muted">
              <li>Pape, <em>Bombing to Win: Air Power and Coercion in War</em> (Cornell, 1996)</li>
              <li>Pape, &ldquo;Escalation Trap&rdquo; Substack (2025-26)</li>
              <li>Pape, <em>Foreign Affairs</em> articles on Iran (2025-26)</li>
              <li>Talmadge, &ldquo;Closing Time&rdquo; <em>International Security</em> (2008)</li>
            </ul>
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
              reflect conditions as of April 24, 2026 and do not update automatically.
            </li>
            <li>
              <strong className="text-text-primary">Phases 1–2 are locked to observed data</strong> —
              the February 28 strike and the Feb 28 – Mar 10 retaliation period are historical
              record, not projections. Phases 3–7 are now mixed (partially observed, partially
              projected) as the conflict has progressed through ceasefire and negotiations.
              Phase 8 remains fully projected.
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
