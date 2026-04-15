import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

let done = false;

export function registerChartJs(): void {
  if (done) return;
  ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  );
  done = true;
}
