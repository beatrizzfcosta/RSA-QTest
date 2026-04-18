import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import type { ShorPhasesMs } from "../types";
import { registerChartJs } from "../chart/register";
import {
  chartAxisTitle,
  chartSubtitle,
  chartTitlePrimary,
} from "../chart/chartLayout";
import { CHART_AXIS, SERIES_COLORS } from "../chart/defaults";
import { MIN_TIME_MS_FOR_LOG } from "../chart/timeAxis";
import "./Charts.css";

registerChartJs();

/** Preenchimento entre as duas linhas (diferença visual a cada fase). */
const RIBBON_FILL = "rgba(100, 116, 139, 0.28)";

const PHASE_DEF = [
  ["circuitBuildMs", "Construção do circuito"],
  ["transpileMs", "Transpilação"],
  ["sampleMs", "Amostragem (simulador)"],
  ["orderInferenceMs", "Inferência da ordem"],
  ["classicalFactorMs", "Pós-processamento clássico"],
] as const satisfies ReadonlyArray<readonly [keyof ShorPhasesMs, string]>;

function formatMs(v: number): string {
  if (v >= 1000) return `${v.toFixed(1)} ms`;
  if (v >= 1) return `${v.toFixed(2)} ms`;
  if (v >= 0.001) return `${v.toFixed(4)} ms`;
  return `${v.toExponential(1)} ms`;
}

function formatSignedDeltaMs(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const a = Math.abs(delta);
  const body =
    a >= 1000
      ? `${a.toFixed(2)} ms`
      : a >= 1
        ? `${a.toFixed(3)} ms`
        : a >= 0.001
          ? `${a.toFixed(5)} ms`
          : `${a.toExponential(1)} ms`;
  return `${sign}${body}`;
}

function cumulativeSeries(phases: ShorPhasesMs): {
  labels: string[];
  cumulativeRaw: number[];
} {
  const labels: string[] = [];
  const perPhase: number[] = [];
  for (const [key, label] of PHASE_DEF) {
    const v = phases[key];
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    labels.push(label);
    perPhase.push(Math.max(0, v));
  }
  const cumulativeRaw: number[] = [];
  let acc = 0;
  for (const v of perPhase) {
    acc += v;
    cumulativeRaw.push(acc);
  }
  return { labels, cumulativeRaw };
}

function plotYFromCumulative(cumulativeRaw: number[]): number[] {
  return cumulativeRaw.map((v) => Math.max(v, MIN_TIME_MS_FOR_LOG));
}

type ShorPipelineTest = {
  legendLabel: string;
  phases: ShorPhasesMs;
};

type ShorPipelineCompareChartProps = {
  testA: ShorPipelineTest;
  testB: ShorPipelineTest;
};

export function ShorPipelineCompareChart({
  testA,
  testB,
}: ShorPipelineCompareChartProps) {
  const a = useMemo(() => cumulativeSeries(testA.phases), [testA.phases]);
  const b = useMemo(() => cumulativeSeries(testB.phases), [testB.phases]);

  const labels = useMemo(() => {
    if (a.labels.length === 0 || b.labels.length === 0) return [];
    if (a.labels.length !== b.labels.length) return a.labels;
    for (let i = 0; i < a.labels.length; i++) {
      if (a.labels[i] !== b.labels[i]) return a.labels;
    }
    return a.labels;
  }, [a.labels, b.labels]);

  const logSuggestedMax = useMemo(() => {
    const all = [...a.cumulativeRaw, ...b.cumulativeRaw];
    if (all.length === 0) return undefined;
    const mx = Math.max(...all);
    return mx > 0 ? mx * 1.08 : undefined;
  }, [a.cumulativeRaw, b.cumulativeRaw]);

  const data = useMemo((): ChartData<"line"> => {
    const yA = plotYFromCumulative(a.cumulativeRaw);
    const yB = plotYFromCumulative(b.cumulativeRaw);
    return {
      labels,
      datasets: [
        {
          label: testA.legendLabel,
          data: yA,
          order: 1,
          borderColor: SERIES_COLORS.compareA.bg,
          backgroundColor: "transparent",
          borderWidth: 3,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: SERIES_COLORS.compareA.bg,
          pointBorderWidth: 2.5,
          pointStyle: "circle" as const,
          tension: 0.2,
          spanGaps: false,
        },
        {
          label: testB.legendLabel,
          data: yB,
          order: 2,
          borderColor: SERIES_COLORS.compareB.bg,
          backgroundColor: RIBBON_FILL,
          borderWidth: 3,
          fill: "-1",
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: SERIES_COLORS.compareB.bg,
          pointBorderWidth: 2.5,
          pointStyle: "rectRot" as const,
          tension: 0.2,
          spanGaps: false,
        },
      ],
    };
  }, [labels, testA.legendLabel, testB.legendLabel, a.cumulativeRaw, b.cumulativeRaw]);

  const subtitleText =
    "Eixo Y em escala log (ms). A zona sombreada entre as linhas é a diferença entre testes. Detalhes no tooltip.";

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 480, easing: "easeOutQuart" },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: "line" as const,
          },
        },
        title: chartTitlePrimary(
          "Tempo acumulado ao longo da pipeline Shor",
        ),
        subtitle: chartSubtitle(subtitleText),
        tooltip: {
          padding: 14,
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex ?? 0;
              return labels[idx] ?? "";
            },
            label: (ctx) => {
              const idx = ctx.dataIndex;
              const raw =
                ctx.datasetIndex === 0
                  ? a.cumulativeRaw[idx]
                  : b.cumulativeRaw[idx];
              if (raw === undefined) return "";
              return `${ctx.dataset.label}: ${formatMs(raw)} (acumulado)`;
            },
            footer: (items) => {
              const idx = items[0]?.dataIndex ?? 0;
              const ra = a.cumulativeRaw[idx];
              const rb = b.cumulativeRaw[idx];
              if (ra === undefined || rb === undefined) return "";
              const delta = rb - ra;
              const lines: string[] = [
                `Diferença (2º − 1º): ${formatSignedDeltaMs(delta)}`,
              ];
              if (ra > 1e-12) {
                const pct = ((rb - ra) / ra) * 100;
                const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
                lines.push(
                  `Relativo ao 1º: ${sign}${Math.abs(pct).toFixed(2)} %`,
                );
              }
              return lines;
            },
          },
        },
      },
      scales: {
        y: {
          type: "logarithmic",
          suggestedMax: logSuggestedMax,
          title: chartAxisTitle("Tempo acumulado (ms, escala log)"),
          ticks: {
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            maxTicksLimit: 12,
          },
          border: { display: false },
          grid: {
            color: CHART_AXIS.grid,
            lineWidth: 1,
            drawTicks: false,
          },
        },
        x: {
          offset: true,
          ticks: {
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            maxRotation: 28,
            autoSkip: false,
          },
          grid: {
            display: true,
            color: "rgba(100, 116, 139, 0.14)",
            lineWidth: 1,
            drawTicks: false,
          },
          border: { display: false },
        },
      },
    }),
    [labels, a.cumulativeRaw, b.cumulativeRaw, logSuggestedMax, subtitleText],
  );

  if (labels.length === 0) return null;

  const lastIdx = a.cumulativeRaw.length - 1;
  const finalA = lastIdx >= 0 ? a.cumulativeRaw[lastIdx]! : 0;
  const finalB = lastIdx >= 0 ? b.cumulativeRaw[lastIdx]! : 0;
  const finalDelta = finalB - finalA;

  return (
    <div className="charts-section charts-section--shor-pipeline-compare">
      <h3 className="charts-section__title">Pipeline Shor — comparação</h3>
      <p className="charts-section__phase-note">
        Cada ponto é o tempo total desde o início até ao fim dessa etapa. A
        sombra entre as duas linhas realça a diferença em cada fase. No fim:{" "}
        <strong>{formatSignedDeltaMs(finalDelta)}</strong> (2.º − 1.º).
      </p>
      <div className="charts-section__legend-hint" aria-hidden>
        <span>
          <span className="swatch swatch--a" /> círculos — 1.º teste
        </span>
        <span>
          <span className="swatch swatch--b" /> losangos — 2.º teste
        </span>
      </div>
      <div className="chart-wrap chart-wrap--pipeline-compare">
        <div className="chart-inner chart-inner--pipeline-compare">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
