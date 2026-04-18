export type PQChoice = "3-5" | "3-7";

/** Tempos por fase da pipeline Shor (ms), vindos do backend. */
export type ShorPhasesMs = {
  circuitBuildMs: number;
  transpileMs: number;
  sampleMs: number;
  orderInferenceMs: number;
  classicalFactorMs: number;
};

export type FactorMethodMetrics = {
  timeMs: number;
  /** Presente em clássico e força bruta; omitido na métrica quântica. */
  operations?: number | string;
  /** Valor numérico para o gráfico de custo (ex.: operações, shots). */
  computationalCost: number;
  /** Desdobramento temporal do Shor (só métrica quântica). */
  shorPhasesMs?: ShorPhasesMs;
};

export type FactorMetrics = {
  classic: FactorMethodMetrics;
  quantum: FactorMethodMetrics;
  brute: FactorMethodMetrics;
};
