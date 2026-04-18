/**
 * Tema partilhado para Chart.js — tipografia, tooltips e cores de séries.
 */
export const CHART_FONT =
  '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

/** Barras principais (contraste suave, adequado para impressão / apresentação). */
export const SERIES_COLORS = {
  classic: {
    bg: "rgba(88, 125, 58, 0.9)",
    hover: "rgba(88, 125, 58, 1)",
  },
  quantum: {
    bg: "rgba(95, 62, 118, 0.9)",
    hover: "rgba(95, 62, 118, 1)",
  },
  brute: {
    bg: "rgba(148, 76, 76, 0.9)",
    hover: "rgba(148, 76, 76, 1)",
  },
  compareA: {
    bg: "rgba(95, 62, 118, 0.92)",
    hover: "rgba(95, 62, 118, 1)",
    fill: "rgba(95, 62, 118, 0.14)",
  },
  compareB: {
    bg: "rgba(55, 85, 145, 0.92)",
    hover: "rgba(55, 85, 145, 1)",
    fill: "rgba(55, 85, 145, 0.14)",
  },
  /** Fases Shor — tons distintos, mesma saturação */
  phase: [
    "rgba(95, 62, 118, 0.88)",
    "rgba(55, 85, 145, 0.88)",
    "rgba(88, 125, 58, 0.88)",
    "rgba(148, 76, 76, 0.82)",
    "rgba(75, 110, 140, 0.88)",
  ],
} as const;

export const CHART_AXIS = {
  tick: "#64748b",
  title: "#475569",
  titleFontSize: 12,
  tickFontSize: 11,
  grid: "rgba(100, 116, 139, 0.11)",
} as const;

export const CHART_TITLE = {
  color: "#1e293b",
  fontSize: 15,
  paddingBottom: 16,
  paddingTop: 4,
} as const;
