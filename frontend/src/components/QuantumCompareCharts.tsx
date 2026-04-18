import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { FactorMethodMetrics } from "../types";
import { registerChartJs } from "../chart/register";
import {
  chartAxisTitle,
  chartSubtitle,
  chartTitlePrimary,
} from "../chart/chartLayout";
import { CHART_AXIS, SERIES_COLORS } from "../chart/defaults";
import { timeMsBarValues } from "../chart/timeAxis";
import { formatMsAxisLog } from "../chart/timeMsLogTicks";
import {
  linearBalancedRangeFromZeroMs,
  timeCompareGapMs,
  useLinearTimePairFocus,
} from "../chart/timeCompareScale";
import "./Charts.css";

registerChartJs();

/** Eixo Y do gráfico de custo (shots): passo e margem no topo. */
const COST_SHOT_TICK_STEP = 100;
const COST_SHOT_HEADROOM = 200;

function formatTimeMs(v: number): string {
  if (v >= 1000) return v.toFixed(0);
  if (v >= 1) return v.toFixed(2);
  if (v >= 0.01) return v.toFixed(4);
  return v.toExponential(1);
}

function formatCostValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}

function shotsLinearYRange(a: number, b: number): { yMin: number; yMax: number } {
  const hi = Math.max(Math.max(0, a), Math.max(0, b));
  if (hi <= 0) return { yMin: 0, yMax: COST_SHOT_TICK_STEP };
  const rawMax = hi + COST_SHOT_HEADROOM;
  const yMax =
    Math.ceil(rawMax / COST_SHOT_TICK_STEP) * COST_SHOT_TICK_STEP;
  return { yMin: 0, yMax };
}

type QuantumCase = {
  shortLabel: string;
  detailLabel: string;
  /** N = p×q deste teste (para escolher o passo do eixo de tempo). */
  n: number;
  quantum: FactorMethodMetrics;
};

type QuantumCompareChartsProps = {
  caseA: QuantumCase;
  caseB: QuantumCase;
};

export function QuantumCompareCharts({
  caseA,
  caseB,
}: QuantumCompareChartsProps) {
  const costRange = useMemo(() => {
    const raw = [
      caseA.quantum.computationalCost,
      caseB.quantum.computationalCost,
    ];
    const y = shotsLinearYRange(raw[0] ?? 0, raw[1] ?? 0);
    return { raw, yMin: y.yMin, yMax: y.yMax };
  }, [caseA.quantum.computationalCost, caseB.quantum.computationalCost]);

  const timeCompareGap = timeCompareGapMs(caseA.n, caseB.n);

  const timeLinearFocus = useMemo(
    () =>
      useLinearTimePairFocus(
        caseA.quantum.timeMs,
        caseB.quantum.timeMs,
      ),
    [caseA.quantum.timeMs, caseB.quantum.timeMs],
  );

  const timeBalancedRange = useMemo(
    () =>
      linearBalancedRangeFromZeroMs(
        caseA.quantum.timeMs,
        caseB.quantum.timeMs,
        timeCompareGap,
      ),
    [caseA.quantum.timeMs, caseB.quantum.timeMs, timeCompareGap],
  );

  const timeData = useMemo(
    () => ({
      labels: [caseA.shortLabel, caseB.shortLabel],
      datasets: [
        {
          label: "Tempo Shor (ms)",
          data: timeLinearFocus
            ? [
                Math.max(0, caseA.quantum.timeMs),
                Math.max(0, caseB.quantum.timeMs),
              ]
            : timeMsBarValues(
                [caseA.quantum.timeMs, caseB.quantum.timeMs],
                true,
              ),
          backgroundColor: [
            SERIES_COLORS.compareA.bg,
            SERIES_COLORS.compareB.bg,
          ],
          hoverBackgroundColor: [
            SERIES_COLORS.compareA.hover,
            SERIES_COLORS.compareB.hover,
          ],
        },
      ],
    }),
    [
      caseA.shortLabel,
      caseA.quantum.timeMs,
      caseB.shortLabel,
      caseB.quantum.timeMs,
      timeLinearFocus,
    ],
  );

  const costData = useMemo(
    () => ({
      labels: [caseA.shortLabel, caseB.shortLabel],
      datasets: [
        {
          label: "Custo (shots)",
          data: costRange.raw.map((v) => Math.max(0, v)),
          backgroundColor: [
            SERIES_COLORS.compareA.bg,
            SERIES_COLORS.compareB.bg,
          ],
          hoverBackgroundColor: [
            SERIES_COLORS.compareA.hover,
            SERIES_COLORS.compareB.hover,
          ],
        },
      ],
    }),
    [caseA.shortLabel, caseB.shortLabel, costRange.raw],
  );

  const timeOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 450 },
      datasets: {
        bar: {
          categoryPercentage: 0.72,
          barPercentage: 0.68,
        },
      },
      plugins: {
        legend: { display: false },
        title: chartTitlePrimary("Tempo Shor (Qiskit) por valor de N"),
        subtitle: chartSubtitle(
          timeLinearFocus
            ? `Eixo linear desde 0; marcas e margem em passos de ${timeCompareGap.toLocaleString("pt-PT")} ms (${caseA.n === caseB.n ? "mesmo N" : "N diferentes"}).`
            : "Eixo Y em escala logarítmica (ms) — tempos em ordens de grandeza muito diferentes.",
        ),
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              return i === 0 ? caseA.detailLabel : caseB.detailLabel;
            },
            label: (ctx) => {
              const i = ctx.dataIndex;
              const v =
                i === 0 ? caseA.quantum.timeMs : caseB.quantum.timeMs;
              return `Tempo: ${formatTimeMs(v)} ms`;
            },
          },
        },
      },
      scales: {
        y: timeLinearFocus
          ? {
              type: "linear",
              min: timeBalancedRange.yMin,
              max: timeBalancedRange.yMax,
              title: chartAxisTitle("Milisegundos"),
              ticks: {
                stepSize: timeCompareGap,
                autoSkip: false,
                color: CHART_AXIS.tick,
                font: { size: CHART_AXIS.tickFontSize },
                callback: (value) =>
                  typeof value === "number"
                    ? formatMsAxisLog(value)
                    : String(value),
              },
              border: { display: false },
              grid: {
                color: CHART_AXIS.grid,
                lineWidth: 1,
                drawTicks: false,
              },
            }
          : {
              type: "logarithmic",
              title: chartAxisTitle("Milisegundos (escala log)"),
              ticks: {
                maxTicksLimit: 12,
                autoSkip: true,
                color: CHART_AXIS.tick,
                font: { size: CHART_AXIS.tickFontSize },
              },
              border: { display: false },
              grid: {
                color: CHART_AXIS.grid,
                lineWidth: 1,
                drawTicks: false,
              },
            },
        x: {
          ticks: {
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            maxRotation: 0,
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [caseA, caseB, timeLinearFocus, timeBalancedRange, timeCompareGap],
  );

  const costOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 450 },
      datasets: {
        bar: {
          categoryPercentage: 0.72,
          barPercentage: 0.68,
        },
      },
      plugins: {
        legend: { display: false },
        title: chartTitlePrimary("Custo computacional Shor (shots)"),
        subtitle: chartSubtitle(
          "Eixo linear em shots; marcas de 200 em 200.",
        ),
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              return i === 0 ? caseA.detailLabel : caseB.detailLabel;
            },
            label: (ctx) => {
              const i = ctx.dataIndex;
              const v = costRange.raw[i] ?? 0;
              return `Custo: ${formatCostValue(v)} shots`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          min: costRange.yMin,
          max: costRange.yMax,
          title: chartAxisTitle("Shots"),
          ticks: {
            stepSize: COST_SHOT_TICK_STEP,
            autoSkip: false,
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            callback: (value) =>
              typeof value === "number"
                ? Math.round(value).toLocaleString("pt-PT")
                : String(value),
          },
          border: { display: false },
          grid: {
            color: CHART_AXIS.grid,
            lineWidth: 1,
            drawTicks: false,
          },
        },
        x: {
          ticks: {
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            maxRotation: 0,
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [caseA, caseB, costRange],
  );

  return (
    <div className="charts-section charts-section--compare">
      <h3 className="charts-section__title">Comparação — Shor (Qiskit)</h3>
      <p className="charts-section__legend-hint">
        <span className="swatch swatch--a" aria-hidden /> Teste 1 ·{" "}
        <span className="swatch swatch--b" aria-hidden /> Teste 2
      </p>
      <div className="charts-section__grid">
        <div className="chart-wrap">
          <div className="chart-inner">
            <Bar data={timeData} options={timeOptions} />
          </div>
        </div>
        <div className="chart-wrap">
          <div className="chart-inner">
            <Bar data={costData} options={costOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
