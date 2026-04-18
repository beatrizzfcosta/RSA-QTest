import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { FactorMetrics } from "../types";
import { registerChartJs } from "../chart/register";
import {
  chartAxisTitle,
  chartSubtitle,
  chartTitlePrimary,
} from "../chart/chartLayout";
import { CHART_AXIS, SERIES_COLORS } from "../chart/defaults";
import { timeMsBarValues } from "../chart/timeAxis";
import "./Charts.css";

registerChartJs();

const METHOD_LABELS = [
  "Fatorização clássica",
  "Fatorização quântica",
  "Força bruta",
] as const;

const MIN_LOG_COST = 1e-9;

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

function tickLabelCostFromLog10Power(p: number): string {
  const v = 10 ** p;
  if (!Number.isFinite(v)) return "";
  if (v >= 10000) return v.toExponential(0);
  if (v >= 100) return String(Math.round(v));
  if (v >= 10) return String(Math.round(v));
  if (v >= 1) return Number.isInteger(v) ? String(v) : v.toFixed(1);
  return v < 0.01 ? v.toExponential(1) : v.toFixed(2);
}

function log10AxisRange(logValues: number[]): { min: number; max: number } {
  if (logValues.length === 0) return { min: 0, max: 1 };
  const lo = Math.min(...logValues);
  const hi = Math.max(...logValues);
  let yMin = Math.floor(lo);
  let yMax = Math.ceil(hi);
  if (yMax <= yMin) yMax = yMin + 1;
  return { min: yMin, max: yMax };
}

type FactorChartsCompareProps = {
  metricsA: FactorMetrics;
  metricsB: FactorMetrics;
  legendA: string;
  legendB: string;
  sectionTitle?: string;
};

export function FactorChartsCompare({
  metricsA,
  metricsB,
  legendA,
  legendB,
  sectionTitle = "Comparação — desempenho por método",
}: FactorChartsCompareProps) {
  const timeRawA = useMemo(
    () =>
      [
        metricsA.classic.timeMs,
        metricsA.quantum.timeMs,
        metricsA.brute.timeMs,
      ] as const,
    [metricsA],
  );
  const timeRawB = useMemo(
    () =>
      [
        metricsB.classic.timeMs,
        metricsB.quantum.timeMs,
        metricsB.brute.timeMs,
      ] as const,
    [metricsB],
  );

  const costRawA = useMemo(
    () =>
      [
        metricsA.classic.computationalCost,
        metricsA.quantum.computationalCost,
        metricsA.brute.computationalCost,
      ] as const,
    [metricsA],
  );
  const costRawB = useMemo(
    () =>
      [
        metricsB.classic.computationalCost,
        metricsB.quantum.computationalCost,
        metricsB.brute.computationalCost,
      ] as const,
    [metricsB],
  );

  const costScale = useMemo(() => {
    const logA = costRawA.map((v) => Math.log10(Math.max(v, MIN_LOG_COST)));
    const logB = costRawB.map((v) => Math.log10(Math.max(v, MIN_LOG_COST)));
    const { min: yMin, max: yMax } = log10AxisRange([...logA, ...logB]);
    return { logA, logB, yMin, yMax };
  }, [costRawA, costRawB]);

  const timeData = useMemo(
    () => ({
      labels: [...METHOD_LABELS],
      datasets: [
        {
          label: legendA,
          data: timeMsBarValues([...timeRawA], true),
          backgroundColor: SERIES_COLORS.compareA.bg,
          hoverBackgroundColor: SERIES_COLORS.compareA.hover,
        },
        {
          label: legendB,
          data: timeMsBarValues([...timeRawB], true),
          backgroundColor: SERIES_COLORS.compareB.bg,
          hoverBackgroundColor: SERIES_COLORS.compareB.hover,
        },
      ],
    }),
    [legendA, legendB, timeRawA, timeRawB],
  );

  const costData = useMemo(
    () => ({
      labels: [...METHOD_LABELS],
      datasets: [
        {
          label: legendA,
          data: costScale.logA,
          backgroundColor: SERIES_COLORS.compareA.bg,
          hoverBackgroundColor: SERIES_COLORS.compareA.hover,
        },
        {
          label: legendB,
          data: costScale.logB,
          backgroundColor: SERIES_COLORS.compareB.bg,
          hoverBackgroundColor: SERIES_COLORS.compareB.hover,
        },
      ],
    }),
    [legendA, legendB, costScale.logA, costScale.logB],
  );

  const timeOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 450 },
      datasets: {
        bar: {
          categoryPercentage: 0.68,
          barPercentage: 0.82,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        title: chartTitlePrimary("Tempo de execução por método"),
        subtitle: chartSubtitle(
          "Duas barras por método; eixo Y em escala logarítmica (ms).",
        ),
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const raw =
                ctx.datasetIndex === 0 ? timeRawA[i] : timeRawB[i];
              if (raw === undefined) return "";
              return `${ctx.dataset.label}: ${formatTimeMs(raw)} ms`;
            },
            title: (items) => items[0]?.label ?? "",
          },
        },
      },
      scales: {
        y: {
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
            maxRotation: 24,
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [timeRawA, timeRawB],
  );

  const costOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 450 },
      datasets: {
        bar: {
          categoryPercentage: 0.68,
          barPercentage: 0.82,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        title: chartTitlePrimary("Custo computacional"),
        subtitle: chartSubtitle(
          "Duas barras por método; eixo Y = log₁₀ das unidades",
        ),
        tooltip: {
          callbacks: {
            title: (items) => items[0]?.label ?? "",
            label: (ctx) => {
              const i = ctx.dataIndex;
              const raw =
                ctx.datasetIndex === 0 ? costRawA[i] : costRawB[i];
              if (raw === undefined) return "";
              return `${ctx.dataset.label}: ${formatCostValue(raw)} unid.`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          min: costScale.yMin,
          max: costScale.yMax,
          title: chartAxisTitle("log₁₀ (unidades)"),
          ticks: {
            stepSize: 1,
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            callback: (value) =>
              typeof value === "number"
                ? tickLabelCostFromLog10Power(value)
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
            maxRotation: 24,
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [costScale.yMin, costScale.yMax, costRawA, costRawB],
  );

  return (
    <div className="charts-section">
      <h3 className="charts-section__title">{sectionTitle}</h3>
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
