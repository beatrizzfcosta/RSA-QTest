import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { CHART_FONT } from "./defaults";
import { formatMsAxisLog, logMsTickBalancePlugin } from "./timeMsLogTicks";

let done = false;

export function registerChartJs(): void {
  if (done) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    LineElement,
    PointElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler,
    logMsTickBalancePlugin,
  );

  const logDefaults = LogarithmicScale.defaults;
  if (logDefaults?.ticks) {
    logDefaults.ticks.callback = (tickValue: number | string) =>
      formatMsAxisLog(tickValue);
  }

  ChartJS.defaults.font.family = CHART_FONT;
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.color = "#64748b";

  ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(15, 23, 42, 0.94)";
  ChartJS.defaults.plugins.tooltip.titleColor = "#f8fafc";
  ChartJS.defaults.plugins.tooltip.bodyColor = "#e2e8f0";
  ChartJS.defaults.plugins.tooltip.borderColor = "rgba(148, 163, 184, 0.22)";
  ChartJS.defaults.plugins.tooltip.borderWidth = 1;
  ChartJS.defaults.plugins.tooltip.padding = 12;
  ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
  ChartJS.defaults.plugins.tooltip.titleFont = {
    family: CHART_FONT,
    size: 13,
    weight: "bold",
  };
  ChartJS.defaults.plugins.tooltip.bodyFont = {
    family: CHART_FONT,
    size: 12,
  };
  ChartJS.defaults.plugins.tooltip.boxPadding = 6;
  ChartJS.defaults.plugins.tooltip.displayColors = true;
  ChartJS.defaults.plugins.tooltip.usePointStyle = true;

  ChartJS.defaults.set("plugins.legend.labels", {
    usePointStyle: true,
    pointStyle: "rectRounded" as const,
    padding: 14,
    font: { family: CHART_FONT, size: 11 },
    color: "#475569",
  });

  ChartJS.defaults.elements.bar.borderRadius = 7;
  ChartJS.defaults.elements.bar.borderSkipped = false;
  ChartJS.defaults.elements.bar.borderWidth = 0;

  ChartJS.defaults.elements.line.borderWidth = 2.5;
  ChartJS.defaults.elements.line.tension = 0.3;
  ChartJS.defaults.elements.point.radius = 4;
  ChartJS.defaults.elements.point.hoverRadius = 6;
  ChartJS.defaults.elements.point.borderWidth = 2;
  ChartJS.defaults.elements.point.backgroundColor = "#ffffff";

  done = true;
}
