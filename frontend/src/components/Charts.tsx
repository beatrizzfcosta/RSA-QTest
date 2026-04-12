import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { FactorMetrics } from "../types";
import { registerChartJs } from "../chart/register";
import "./Charts.css";

registerChartJs();

const LABELS = [
  "Fatoração clássica",
  "Fatoração quântica",
  "Força bruta",
] as const;

/* Mesma ordem que os cartões: clássica (sage) | quântica (mauve) | força bruta (burgundy) */
const BAR_BG = [
  "rgba(169, 191, 112, 0.88)",
  "rgba(133, 77, 137, 0.88)",
  "rgba(140, 76, 76, 0.88)",
] as const;

const BAR_BORDER = ["#7a8f4a", "#6b3f6e", "#7a4141"] as const;

type FactorChartsProps = {
  metrics: FactorMetrics;
};

export function FactorCharts({ metrics }: FactorChartsProps) {
  const timeData = useMemo(
    () => ({
      labels: [...LABELS],
      datasets: [
        {
          label: "Tempo (ms)",
          data: [
            metrics.classic.timeMs,
            metrics.quantum.timeMs,
            metrics.brute.timeMs,
          ],
          backgroundColor: [...BAR_BG],
          borderColor: [...BAR_BORDER],
          borderWidth: 1,
        },
      ],
    }),
    [metrics],
  );

  const costData = useMemo(
    () => ({
      labels: [...LABELS],
      datasets: [
        {
          label: "Custo computacional",
          data: [
            metrics.classic.computationalCost,
            metrics.quantum.computationalCost,
            metrics.brute.computationalCost,
          ],
          backgroundColor: [...BAR_BG],
          borderColor: [...BAR_BORDER],
          borderWidth: 1,
        },
      ],
    }),
    [metrics],
  );

  const timeOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Tempo de execução por método",
          font: { size: 14 },
          color: "#6370aa",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "ms" },
        },
      },
    }),
    [],
  );

  const costOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Custo computacional (unidades relativas)",
          font: { size: 14 },
          color: "#6370aa",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "unid." },
        },
      },
    }),
    [],
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
