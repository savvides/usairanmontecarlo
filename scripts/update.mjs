#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const TIMELINE_PATH = 'src/data/timeline.json';

async function main() {
  console.log('\n  Simulation Update Helper\n');

  const timeline = JSON.parse(readFileSync(TIMELINE_PATH, 'utf-8'));
  console.log(`Current data: ${timeline.events.length} events, last updated ${timeline.lastUpdated}`);
  console.log(`Observed through: ${timeline.observedThrough}\n`);

  let addMore = true;
  const newEvents = [];

  while (addMore) {
    const wantEvent = await ask('Add a new timeline event? (y/n): ');
    if (wantEvent.toLowerCase() !== 'y') { addMore = false; break; }

    const date = await ask('  Date (YYYY-MM-DD): ');
    const label = await ask('  Label (short): ');
    const description = await ask('  Description (1-2 sentences): ');
    const phase = parseInt(await ask('  Phase (1-8): '), 10);
    const source = await ask('  Source: ');

    newEvents.push({ date, label, description, phase, source });
    console.log(`  Added: "${label}" on ${date}\n`);
  }

  if (newEvents.length > 0) {
    timeline.events.push(...newEvents);
    timeline.events.sort((a, b) => a.date.localeCompare(b.date));
  }

  const today = new Date().toISOString().split('T')[0];
  const newObserved = await ask(`\nObserved through date (current: ${timeline.observedThrough}, today: ${today}): `);
  if (newObserved.trim()) timeline.observedThrough = newObserved.trim();
  timeline.lastUpdated = today;

  const currentPhase = parseInt(await ask(`Current active phase (current: ${timeline.currentPhase}): `) || String(timeline.currentPhase), 10);
  timeline.currentPhase = currentPhase;

  for (let i = 1; i <= 8; i++) {
    if (i < currentPhase) timeline.phaseStatus[String(i)] = 'observed';
    else if (i === currentPhase) timeline.phaseStatus[String(i)] = 'mixed';
    else timeline.phaseStatus[String(i)] = 'projected';
  }

  writeFileSync(TIMELINE_PATH, JSON.stringify(timeline, null, 2) + '\n');
  console.log(`\nUpdated ${TIMELINE_PATH}`);
  console.log(`  ${timeline.events.length} events, observed through ${timeline.observedThrough}`);

  console.log('\nRunning tests...');
  try { execSync('npx vitest run', { stdio: 'inherit' }); }
  catch { console.error('\nTests failed. Fix issues before pushing.'); process.exit(1); }

  console.log('\nBuilding...');
  try { execSync('npx next build', { stdio: 'inherit' }); }
  catch { console.error('\nBuild failed. Fix issues before pushing.'); process.exit(1); }

  const shouldPush = await ask('\nCommit and push? (y/n): ');
  if (shouldPush.toLowerCase() === 'y') {
    execSync('git add src/data/timeline.json', { stdio: 'inherit' });
    const msg = `data: update simulation — ${newEvents.length} new events, observed through ${timeline.observedThrough}`;
    spawnSync('git', ['commit', '-m', msg], { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('\nPushed. GitHub Pages will auto-deploy.');
  } else {
    console.log('\nChanges saved locally. Run git add -A && git commit && git push when ready.');
  }

  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
