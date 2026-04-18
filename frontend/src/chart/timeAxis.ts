/**
 * Valores para eixo Y logarítmico (ms): zeros aproximam-se de um mínimo &gt; 0.
 */
export const MIN_TIME_MS_FOR_LOG = 1e-6;

export function timeMsBarValues(raw: number[], useLog: boolean): number[] {
  return raw.map((v) =>
    useLog ? Math.max(v, MIN_TIME_MS_FOR_LOG) : Math.max(0, v),
  );
}
