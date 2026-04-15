import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { FactorMetrics } from "../types";
import { registerChartJs } from "../chart/register";
import "./Charts.css";

registerChartJs();

const LABELS = [
  "Fatorização clássica",
  "Fatorização quântica",
  "Força bruta",
] as const;

/* Mesma ordem que os cartões: clássica (sage) | quântica (mauve) | força bruta (burgundy) */
const BAR_BG = [
  "rgba(169, 191, 112, 0.88)",
  "rgba(133, 77, 137, 0.88)",
  "rgba(140, 76, 76, 0.88)",
] as const;

const BAR_BORDER = ["#7a8f4a", "#6b3f6e", "#7a4141"] as const;

/** Escala log exige valores > 0; valores ~0 ms ainda ficam visíveis. */
const MIN_LOG_TIME_MS = 1e-6;
const MIN_LOG_COST = 1e-9;

/**
 * Grelha horizontal — usar rgba fixo: canvas do Chart.js não aplica bem
 * color-mix()/var() e pode cair no preto por defeito.
 */
const GRID_LINE = "rgba(99, 112, 170, 0.14)";

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

/** Rótulos do eixo de custo: potências de 10 (dados em log₁₀ no eixo linear). */
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

type FactorChartsProps = {
  metrics: FactorMetrics;
};

export function FactorCharts({ metrics }: FactorChartsProps) {
  const costScale = useMemo(() => {
    const raw = [
      metrics.classic.computationalCost,
      metrics.quantum.computationalCost,
      metrics.brute.computationalCost,
    ];
    const log = raw.map((v) => Math.log10(Math.max(v, MIN_LOG_COST)));
    const { min: yMin, max: yMax } = log10AxisRange(log);
    return { raw, log, yMin, yMax };
  }, [metrics]);

  const timeData = useMemo(
    () => {
      const raw = [
        metrics.classic.timeMs,
        metrics.quantum.timeMs,
        metrics.brute.timeMs,
      ];
      return {
        labels: [...LABELS],
        datasets: [
          {
            label: "Tempo (ms)",
            data: raw.map((v) => Math.max(v, MIN_LOG_TIME_MS)),
            backgroundColor: [...BAR_BG],
            borderColor: [...BAR_BORDER],
            borderWidth: 1,
          },
        ],
      };
    },
    [metrics],
  );

  const costData = useMemo(
    () => ({
      labels: [...LABELS],
      datasets: [
        {
          label: "Custo computacional",
          data: costScale.log,
          backgroundColor: [...BAR_BG],
          borderColor: [...BAR_BORDER],
          borderWidth: 1,
        },
      ],
    }),
    [costScale.log],
  );

  const timeOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      datasets: {
        bar: {
          categoryPercentage: 0.72,
          barPercentage: 0.55,
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Tempo de execução por método (escala log)",
          font: { size: 14 },
          color: "#6370aa",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const v = [
                metrics.classic.timeMs,
                metrics.quantum.timeMs,
                metrics.brute.timeMs,
              ][i] ?? 0;
              return `${ctx.label}: ${formatTimeMs(v)} ms`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "logarithmic",
          title: { display: true, text: "ms (log₁₀)", color: "#6370aa" },
          ticks: {
            maxTicksLimit: 5,
            autoSkip: true,
            color: "#8b93b8",
            callback: (value) =>
              typeof value === "number" ? formatTimeMs(value) : String(value),
          },
          border: {
            display: false,
          },
          grid: {
            color: GRID_LINE,
            lineWidth: 1,
            tickBorderDash: [0],
            tickWidth: 0,
          },
        },
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
        },
      },
    }),
    [metrics],
  );

  const costOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      datasets: {
        bar: {
          categoryPercentage: 0.72,
          barPercentage: 0.55,
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Custo computacional (escala log)",
          font: { size: 14 },
          color: "#6370aa",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const v = costScale.raw[i] ?? 0;
              return `${ctx.label}: ${formatCostValue(v)} unid.`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          min: costScale.yMin,
          max: costScale.yMax,
          title: { display: true, text: "log₁₀(unid.)", color: "#6370aa" },
          ticks: {
            stepSize: 1,
            color: "#8b93b8",
            callback: (value) =>
              typeof value === "number"
                ? tickLabelCostFromLog10Power(value)
                : String(value),
          },
          border: {
            display: false,
          },
          grid: {
            color: GRID_LINE,
            lineWidth: 1,
            tickBorderDash: [0],
            tickWidth: 0,
          },
        },
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
        },
      },
    }),
    [costScale],
  );

  return (
    <div className="charts-section">
      <h3 className="charts-section__title">Resultados</h3>
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
