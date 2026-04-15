import type { FactorMetrics } from "../types";
import "./Metrics.css";

type MetricsProps = {
  metrics: FactorMetrics;
};

export function Metrics({ metrics }: MetricsProps) {
  return (
    <div className="metrics">
      <article className="metric-card classic">
        <h3>Fatorização clássica</h3>
        <dl>
          <dt>Tempo</dt>
          <dd>{metrics.classic.timeMs} ms</dd>
          <dt>Operações (demo)</dt>
          <dd>{metrics.classic.operations}</dd>
          <dt>Custo computacional (unid.)</dt>
          <dd>{metrics.classic.computationalCost}</dd>
        </dl>
      </article>
      <article className="metric-card quantum">
        <h3>Fatorização quântica</h3>
        <dl>
          <dt>Tempo</dt>
          <dd>{metrics.quantum.timeMs} ms</dd>
          <dt>Custo computacional (unid.)</dt>
          <dd>{metrics.quantum.computationalCost}</dd>
        </dl>
      </article>
      <article className="metric-card brute">
        <h3>Força bruta</h3>
        <dl>
          <dt>Tempo</dt>
          <dd>{metrics.brute.timeMs} ms</dd>
          <dt>Tentativas (demo)</dt>
          <dd>{metrics.brute.operations}</dd>
          <dt>Custo computacional (unid.)</dt>
          <dd>{metrics.brute.computationalCost}</dd>
        </dl>
      </article>
    </div>
  );
}
