import type { PQChoice, FactorMetrics } from "../types";
import { PQ_PAIRS } from "../constants";
import { Metrics } from "./Metrics";
import { FactorCharts } from "./Charts";
import { FactorChartsCompare } from "./FactorChartsCompare";
import { QuantumCompareCharts } from "./QuantumCompareCharts";
import { ShorPhasesChart } from "./ShorPhasesChart";
import { ShorPipelineCompareChart } from "./ShorPipelineCompareChart";
import "./Page.css";

type RunResult = {
  ciphertext: string;
  decrypted: string;
  metrics: FactorMetrics;
};

type PageProps = {
  pq: PQChoice;
  onPqChange: (value: PQChoice) => void;
  n: number;
  maxLenPrimary: number;
  message: string;
  onMessageChange: (value: string) => void;
  secondTestOpen: boolean;
  onAddSecondTest: () => void;
  onRemoveSecondTest: () => void;
  pqB: PQChoice;
  onPqBChange: (value: PQChoice) => void;
  nB: number;
  sameParams: boolean;
  messageB: string;
  onMessageBChange: (value: string) => void;
  maxLenB: number;
  validationError: string | null;
  serverError: string | null;
  onImplement: () => void | Promise<void>;
  implementDisabled: boolean;
  loading: boolean;
  resultA: RunResult | null;
  resultB: RunResult | null;
  labelA: string;
  labelB: string;
};

export function Page({
  pq,
  onPqChange,
  n,
  maxLenPrimary,
  message,
  onMessageChange,
  secondTestOpen,
  onAddSecondTest,
  onRemoveSecondTest,
  pqB,
  onPqBChange,
  nB,
  sameParams,
  messageB,
  onMessageBChange,
  maxLenB,
  validationError,
  serverError,
  onImplement,
  implementDisabled,
  loading,
  resultA,
  resultB,
  labelA,
  labelB,
}: PageProps) {
  const cipherA =
    resultA && resultA.ciphertext.trim().length > 0 ? resultA.ciphertext : "—";
  const cipherB =
    resultB && resultB.ciphertext.trim().length > 0 ? resultB.ciphertext : "—";

  const showDualResults = secondTestOpen && resultA && resultB;
  const showSingleResult = resultA && !secondTestOpen;

  return (
    <main className="page">
      <section className="panel" aria-labelledby="dev-heading">
        <h2 id="dev-heading" className="panel__title">
          Experiência
        </h2>

        <div className="panel__inputs panel__inputs--split">
          <div className="experimento-grid">
            <div className="experimento-col">
              <div className="form-row">
                <label htmlFor="pq">Teste 1 — primos p e q</label>
                <div className="select-field">
                  <select
                    id="pq"
                    className="select-field__control"
                    value={pq}
                    onChange={(e) => onPqChange(e.target.value as PQChoice)}
                  >
                    <option value="3-5">{PQ_PAIRS["3-5"].label}</option>
                    <option value="3-7">{PQ_PAIRS["3-7"].label}</option>
                  </select>
                </div>
                <p className="hint">
                  N = p×q = {n}. A mensagem deve ter no máximo{" "}
                  {Math.max(0, maxLenPrimary)} caracteres (&lt; N
                  {secondTestOpen && !sameParams ? " em ambos os testes" : ""}).
                </p>
              </div>

              <div className="form-row">
                <label htmlFor="msg">Mensagem</label>
                <div className="message-field">
                  <textarea
                    id="msg"
                    className="message-field__control"
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    placeholder="Texto curto para cifrar…"
                    maxLength={Math.max(0, maxLenPrimary)}
                    rows={5}
                    aria-invalid={validationError ? true : undefined}
                  />
                </div>
              </div>

              <div className="form-row form-row--cipher">
                <label htmlFor="cipher-display">Mensagem criptografada</label>
                <div
                  id="cipher-display"
                  className="cipher-field"
                  role="status"
                  aria-live="polite"
                >
                  <pre className="cipher-field__value">{cipherA}</pre>
                </div>
              </div>
            </div>

            <div className="experimento-col experimento-col--aside">
              {!secondTestOpen ? (
                <button
                  type="button"
                  className="add-test-card"
                  onClick={onAddSecondTest}
                >
                  <span className="add-test-card__plus" aria-hidden>
                    +
                  </span>
                  <span className="add-test-card__label">Adicionar teste</span>
                </button>
              ) : (
                <div className="second-test-panel">
                  <div className="form-row">
                    <label htmlFor="pq-b">Teste 2 — primos p e q</label>
                    <div className="select-field">
                      <select
                        id="pq-b"
                        className="select-field__control"
                        value={pqB}
                        onChange={(e) =>
                          onPqBChange(e.target.value as PQChoice)
                        }
                      >
                        <option value="3-5">{PQ_PAIRS["3-5"].label}</option>
                        <option value="3-7">{PQ_PAIRS["3-7"].label}</option>
                      </select>
                    </div>
                    <p className="hint">N = {nB}</p>
                  </div>

                  {sameParams ? (
                    <div className="form-row">
                      <label htmlFor="msg-b">Mensagem (teste 2)</label>
                      <div className="message-field">
                        <textarea
                          id="msg-b"
                          className="message-field__control"
                          value={messageB}
                          onChange={(e) =>
                            onMessageBChange(e.target.value)
                          }
                          placeholder="Mesmo N que o primeiro teste — pode usar uma mensagem diferente…"
                          maxLength={Math.max(0, maxLenB)}
                          rows={5}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="second-test-panel__sync-hint">
                      O segundo teste usa automaticamente a mesma mensagem do
                      primeiro quando o N é diferente.
                    </p>
                  )}

                  <div className="form-row form-row--cipher">
                    <label htmlFor="cipher-b">Mensagem criptografada (teste 2)</label>
                    <div
                      id="cipher-b"
                      className="cipher-field"
                      role="status"
                      aria-live="polite"
                    >
                      <pre className="cipher-field__value">{cipherB}</pre>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-text"
                    onClick={onRemoveSecondTest}
                  >
                    Remover segundo teste
                  </button>
                </div>
              )}
            </div>
          </div>

          {validationError && <p className="error">{validationError}</p>}
          {serverError && <p className="error">{serverError}</p>}

          <button
            type="button"
            className="btn-primary"
            onClick={() => void onImplement()}
            disabled={implementDisabled}
          >
            {loading
              ? secondTestOpen
                ? "A processar ambos os testes…"
                : "A processar…"
              : "Implementar"}
          </button>
        </div>

        {showSingleResult && resultA && (
          <>
            <Metrics metrics={resultA.metrics} />
            <FactorCharts metrics={resultA.metrics} />
            {resultA.metrics.quantum.shorPhasesMs && (
              <ShorPhasesChart phases={resultA.metrics.quantum.shorPhasesMs} />
            )}
            <div className="decrypt-box">
              <h3>Descriptografia</h3>
              <p className="value">
                {resultA.decrypted.trim().length > 0
                  ? resultA.decrypted
                  : "—"}
              </p>
            </div>
          </>
        )}

        {showDualResults && resultA && resultB && (
          <>
            <div className="case-results">
              <section className="case-panel" aria-labelledby="case-a-heading">
                <h3 id="case-a-heading" className="case-panel__title">
                  Teste 1 — {labelA}{" "}
                  <span className="case-panel__n">(N = {n})</span>
                </h3>
                <Metrics metrics={resultA.metrics} />
                <div className="decrypt-box">
                  <h3>Descriptografia</h3>
                  <p className="value">
                    {resultA.decrypted.trim().length > 0
                      ? resultA.decrypted
                      : "—"}
                  </p>
                </div>
              </section>

              <section className="case-panel" aria-labelledby="case-b-heading">
                <h3 id="case-b-heading" className="case-panel__title">
                  Teste 2 — {labelB}{" "}
                  <span className="case-panel__n">(N = {nB})</span>
                </h3>
                <Metrics metrics={resultB.metrics} />
                <div className="decrypt-box">
                  <h3>Descriptografia</h3>
                  <p className="value">
                    {resultB.decrypted.trim().length > 0
                      ? resultB.decrypted
                      : "—"}
                  </p>
                </div>
              </section>
            </div>

            <FactorChartsCompare
              metricsA={resultA.metrics}
              metricsB={resultB.metrics}
              legendA={`Teste 1 · N = ${n}`}
              legendB={`Teste 2 · N = ${nB}`}
            />

            {resultA.metrics.quantum.shorPhasesMs &&
              resultB.metrics.quantum.shorPhasesMs && (
                <ShorPipelineCompareChart
                  testA={{
                    legendLabel: `Teste 1 · N = ${n}`,
                    phases: resultA.metrics.quantum.shorPhasesMs,
                  }}
                  testB={{
                    legendLabel: `Teste 2 · N = ${nB}`,
                    phases: resultB.metrics.quantum.shorPhasesMs,
                  }}
                />
              )}

            <QuantumCompareCharts
              caseA={{
                shortLabel: `N = ${n}`,
                detailLabel: `${labelA} · N = ${n}`,
                n,
                quantum: resultA.metrics.quantum,
              }}
              caseB={{
                shortLabel: `N = ${nB}`,
                detailLabel: `${labelB} · N = ${nB}`,
                n: nB,
                quantum: resultB.metrics.quantum,
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}
