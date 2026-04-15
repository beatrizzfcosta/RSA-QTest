import type { PQChoice, FactorMetrics } from "../types";
import { PQ_PAIRS } from "../constants";
import { Metrics } from "./Metrics";
import { FactorCharts } from "./Charts";
import "./Page.css";

type PageProps = {
  pq: PQChoice;
  onPqChange: (value: PQChoice) => void;
  n: number;
  maxLen: number;
  message: string;
  onMessageChange: (value: string) => void;
  validationError: string | null;
  serverError: string | null;
  onImplement: () => void | Promise<void>;
  implementDisabled: boolean;
  loading: boolean;
  metrics: FactorMetrics | null;
  ciphertext: string;
  decrypted: string;
};

export function Page({
  pq,
  onPqChange,
  n,
  maxLen,
  message,
  onMessageChange,
  validationError,
  serverError,
  onImplement,
  implementDisabled,
  loading,
  metrics,
  ciphertext,
  decrypted,
}: PageProps) {
  const cipherDisplay =
    ciphertext.trim().length > 0 ? ciphertext : "—";

  return (
    <main className="page">
      <section className="panel" aria-labelledby="dev-heading">
        <h2 id="dev-heading" className="panel__title">
          Experiência
        </h2>

        <div className="panel__inputs">
        <div className="form-row">
          <label htmlFor="pq">Primos p e q</label>
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
            N = p×q = {n}. A mensagem deve ter no máximo {maxLen} caracteres (&lt; N).
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
              maxLength={maxLen}
              rows={5}
              aria-invalid={validationError ? true : undefined}
            />
          </div>
          {validationError && <p className="error">{validationError}</p>}
          {serverError && <p className="error">{serverError}</p>}
        </div>

        <div className="form-row form-row--cipher">
          <label htmlFor="cipher-display">Mensagem criptografada</label>
          <div
            id="cipher-display"
            className="cipher-field"
            role="status"
            aria-live="polite"
          >
            <pre className="cipher-field__value">{cipherDisplay}</pre>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => void onImplement()}
          disabled={implementDisabled}
        >
          {loading ? "A processar…" : "Implementar"}
        </button>
        </div>

        {metrics && (
          <>
            <Metrics metrics={metrics} />
            <FactorCharts metrics={metrics} />
            <div className="decrypt-box">
              <h3>Descriptografia</h3>
              <p className="value">
                {decrypted.trim().length > 0 ? decrypted : "—"}
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
