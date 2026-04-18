import { useMemo } from "react";
import { Chart } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import type { ShorPhasesMs } from "../types";
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

const PHASE_DEF = [
  ["circuitBuildMs", "Construção do circuito"],
  ["transpileMs", "Transpilação"],
  ["sampleMs", "Amostragem (simulador)"],
  ["orderInferenceMs", "Inferência da ordem"],
  ["classicalFactorMs", "Pós-processamento clássico"],
] as const satisfies ReadonlyArray<readonly [keyof ShorPhasesMs, string]>;

const LINE_ACCENT = "rgba(30, 58, 95, 0.95)";
const LINE_POINT_FILL = "#ffffff";

function formatMs(v: number): string {
  if (v >= 1000) return `${v.toFixed(1)} ms`;
  if (v >= 1) return `${v.toFixed(2)} ms`;
  if (v >= 0.001) return `${v.toFixed(4)} ms`;
  return `${v.toExponential(1)} ms`;
}

type ShorPhasesChartProps = {
  phases: ShorPhasesMs;
  /** Título curto opcional (ex.: "teste 1"). */
  subtitle?: string;
};

export function ShorPhasesChart({ phases, subtitle }: ShorPhasesChartProps) {
  const { labels, rawPhaseMs, cumulativeRawMs } = useMemo(() => {
    const labels: string[] = [];
    const rawPhaseMs: number[] = [];
    for (const [key, label] of PHASE_DEF) {
      const v = phases[key];
      if (typeof v !== "number" || Number.isNaN(v)) continue;
      labels.push(label);
      rawPhaseMs.push(Math.max(0, v));
    }
    const cumulativeRawMs: number[] = [];
    let acc = 0;
    for (const v of rawPhaseMs) {
      acc += v;
      cumulativeRawMs.push(acc);
    }
    return {
      labels,
      rawPhaseMs,
      cumulativeRawMs,
    };
  }, [phases]);

  const barColors = useMemo(
    () => [...SERIES_COLORS.phase.slice(0, rawPhaseMs.length)],
    [rawPhaseMs],
  );

  const data = useMemo((): ChartData => {
    const barY = timeMsBarValues(rawPhaseMs, true);
    const lineY = timeMsBarValues(cumulativeRawMs, true);
    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Tempo na fase (ms)",
          data: barY,
          backgroundColor: barColors,
          order: 2,
        },
        {
          type: "line",
          label: "Tempo acumulado (ms)",
          data: lineY,
          borderColor: LINE_ACCENT,
          backgroundColor: "transparent",
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: LINE_POINT_FILL,
          pointBorderColor: LINE_ACCENT,
          pointBorderWidth: 2,
          tension: 0.3,
          order: 1,
          yAxisID: "y",
        },
      ],
    };
  }, [labels, rawPhaseMs, cumulativeRawMs, barColors]);

  const titleText = subtitle
    ? `Pipeline Shor — desempenho temporal (${subtitle})`
    : "Pipeline Shor — desempenho temporal por fase";

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 450 },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        title: chartTitlePrimary(titleText),
        subtitle: chartSubtitle(
          "Eixo Y em escala logarítmica (ms); tooltips com valores exactos.",
        ),
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              if (ctx.datasetIndex === 1) {
                const raw = cumulativeRawMs[i] ?? 0;
                return `Acumulado: ${formatMs(raw)}`;
              }
              const raw = rawPhaseMs[i] ?? 0;
              return `Fase: ${formatMs(raw)}`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "logarithmic",
          title: chartAxisTitle("Milisegundos (escala log)"),
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
          ticks: {
            color: CHART_AXIS.tick,
            font: { size: CHART_AXIS.tickFontSize },
            maxRotation: 32,
            minRotation: 0,
            autoSkip: false,
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [subtitle, titleText, rawPhaseMs, cumulativeRawMs],
  );

  if (labels.length === 0) return null;

  return (
    <div className="charts-section charts-section--shor-phases">
      <p className="charts-section__phase-note">
        Barras: duração medida em cada etapa; linha: soma acumulada ao longo
        do pipeline (última execução no simulador).
      </p>
      <div className="chart-wrap">
        <div className="chart-inner chart-inner--tall">
          <Chart type="bar" data={data as never} options={options} />
        </div>
      </div>
    </div>
  );
}
