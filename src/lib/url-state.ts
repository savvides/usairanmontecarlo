/**
 * Encode/decode simulation scenario state for URL sharing.
 * State is encoded as base64-compressed JSON in the URL hash.
 */

interface ShareableState {
  /** Map of phase number -> selected scenario card ID */
  scenarios: Record<number, string>;
  /** Current phase number */
  phase: number;
}

export function encodeState(scenarios: Map<number, { id: string }>, phase: number): string {
  const state: ShareableState = {
    scenarios: Object.fromEntries(
      Array.from(scenarios.entries()).map(([k, v]) => [k, v.id])
    ),
    phase,
  };
  return btoa(JSON.stringify(state));
}

export function decodeState(hash: string): ShareableState | null {
  try {
    const json = atob(hash);
    const state = JSON.parse(json) as ShareableState;
    if (typeof state.phase !== 'number' || typeof state.scenarios !== 'object') {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function getShareUrl(scenarios: Map<number, { id: string }>, phase: number): string {
  const encoded = encodeState(scenarios, phase);
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}
