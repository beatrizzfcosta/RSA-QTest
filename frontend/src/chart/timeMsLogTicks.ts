import type { Chart, Plugin, Scale } from "chart.js";
import { MIN_TIME_MS_FOR_LOG } from "./timeAxis";

const MULTIPLIERS = [1, 2, 5] as const;

/**
 * Rótulos do eixo: menos ruído que "700.0 ms"; alinhado com marcas 1–2–5 por década.
 */
export function formatMsAxisLog(value: number | string): string {
  const v = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(v) || v <= 0) return typeof value === "string" ? value : "";

  if (v >= 10_000) {
    const r = Math.round(v);
    return `${r.toLocaleString("pt-PT")} ms`;
  }
  if (v >= 1000) {
    const k = v / 1000;
    const t =
      Math.abs(k - Math.round(k)) < 1e-9
        ? `${Math.round(k)} k`
        : `${k.toFixed(1).replace(/\.0$/, "")} k`;
    return `${t} ms`;
  }
  if (v >= 1) {
    if (Math.abs(v - Math.round(v)) < 1e-6) return `${Math.round(v)} ms`;
    return `${v.toFixed(2).replace(/\.?0+$/, "")} ms`;
  }
  if (v >= 0.001) return `${v.toFixed(3).replace(/\.?0+$/, "")} ms`;
  return `${v.toExponential(1)} ms`;
}

function balancedLogTickValues(min: number, max: number): number[] {
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min <= 0 ||
    max <= 0
  ) {
    return [MIN_TIME_MS_FOR_LOG, 0.001, 0.01, 0.1, 1, 10, 100, 1000];
  }
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const low = Math.max(lo, MIN_TIME_MS_FOR_LOG);
  const p0 = Math.floor(Math.log10(low));
  const p1 = Math.ceil(Math.log10(hi));
  const ticks: number[] = [];
  for (let p = p0; p <= p1; p++) {
    const dec = 10 ** p;
    for (const m of MULTIPLIERS) {
      const t = m * dec;
      if (t >= low * 0.92 && t <= hi * 1.08) ticks.push(t);
    }
  }
  const uniq = [...new Set(ticks)].sort((a, b) => a - b);
  if (uniq.length >= 2) return uniq;
  return [low, hi].sort((a, b) => a - b);
}

/**
 * Substitui os ticks do Chart.js (7, 10, 15, 20…) por 1–2–5×10ⁿ — espaçamento uniforme em escala log.
 */
export const logMsTickBalancePlugin: Plugin = {
  id: "logMsTickBalance",
  afterBuildTicks(_chart: Chart, args: { scale: Scale }) {
    const scale = args.scale;
    if (!scale || scale.type !== "logarithmic" || scale.axis !== "y") return;

    const { id } = scale;
    if (id !== "y" && !id.startsWith("y")) return;

    const min = scale.min as number;
    const max = scale.max as number;
    const values = balancedLogTickValues(min, max);
    scale.ticks = values.map((value) => ({ value }));
  },
};
