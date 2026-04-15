export type PQChoice = "3-5" | "3-7";

export type FactorMethodMetrics = {
  timeMs: number;
  /** Presente em clássico e força bruta; omitido na métrica quântica. */
  operations?: number | string;
  /** Valor numérico para o gráfico de custo (ex.: operações, shots). */
  computationalCost: number;
};

export type FactorMetrics = {
  classic: FactorMethodMetrics;
  quantum: FactorMethodMetrics;
  brute: FactorMethodMetrics;
};
