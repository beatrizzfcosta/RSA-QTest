/**
 * Quando max/min ≤ isto, comparações de tempo (dois valores) usam eixo linear
 * em vez de log.
 */
export const TIME_PAIR_LINEAR_MAX_RATIO = 24;

/** Mesmo N nos dois testes (ex.: 15 e 15): margem e passo do eixo Y (ms). */
export const TIME_COMPARE_GAP_SAME_N_MS = 5000;

/** N diferentes (ex.: 15 e 21): margem e passo do eixo Y (ms). */
export const TIME_COMPARE_GAP_DIFFERENT_N_MS = 100_000;

export function timeCompareGapMs(nA: number, nB: number): number {
  return nA === nB ? TIME_COMPARE_GAP_SAME_N_MS : TIME_COMPARE_GAP_DIFFERENT_N_MS;
}

/**
 * Eixo linear desde 0; máximo = ceil((maior tempo + gap) / gap) × gap —
 * evita ticks “estranhos” fora da grelha.
 */
export function linearBalancedRangeFromZeroMs(
  a: number,
  b: number,
  gapMs: number,
): {
  yMin: number;
  yMax: number;
} {
  const hi = Math.max(Math.max(0, a), Math.max(0, b));
  const step = Math.max(gapMs, 1);
  if (hi <= 0) {
    return { yMin: 0, yMax: step };
  }
  const rawMax = hi + gapMs;
  const yMax = Math.ceil(rawMax / step) * step;
  return { yMin: 0, yMax };
}

export function useLinearTimePairFocus(a: number, b: number): boolean {
  const tA = Math.max(0, a);
  const tB = Math.max(0, b);
  const hi = Math.max(tA, tB);
  const lo = Math.min(tA, tB);
  if (hi <= 0) return true;
  const ratio = hi / Math.max(lo, 1e-12);
  return ratio <= TIME_PAIR_LINEAR_MAX_RATIO;
}
