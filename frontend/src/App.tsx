import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Modal } from "./components/Modal";
import { Page } from "./components/Page";
import type { PQChoice, FactorMetrics } from "./types";
import { PQ_PAIRS } from "./constants";
import "./App.css";

type RunResponse = {
  ciphertext: string;
  decrypted: string;
  metrics: FactorMetrics;
};

export default function App() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [pq, setPq] = useState<PQChoice>("3-5");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [ciphertext, setCiphertext] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [metrics, setMetrics] = useState<FactorMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const n = useMemo(() => {
    const pair = PQ_PAIRS[pq];
    return pair.p * pair.q;
  }, [pq]);

  const maxLen = n - 1;

  const validate = (): boolean => {
    if (message.trim().length === 0) {
      setValidationError("Introduza uma mensagem.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleMessageChange = (value: string) => {
    const clipped = value.slice(0, maxLen);
    setMessage(clipped);
    setValidationError(null);
    setCiphertext("");
    setDecrypted("");
    setMetrics(null);
    setServerError(null);
  };

  const handleImplement = async () => {
    if (!validate()) return;
    setCiphertext("");
    setDecrypted("");
    setMetrics(null);
    setServerError(null);
    setLoading(true);
    try {
      const pair = PQ_PAIRS[pq];
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p: pair.p,
          q: pair.q,
          message,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let detail = text;
        try {
          const j = JSON.parse(text) as { detail?: unknown };
          if (typeof j.detail === "string") detail = j.detail;
          else if (Array.isArray(j.detail))
            detail = j.detail.map((x) => JSON.stringify(x)).join("; ");
        } catch {
          /* usar texto cru */
        }
        throw new Error(detail || `HTTP ${res.status}`);
      }
      const data = JSON.parse(text) as RunResponse;
      setCiphertext(data.ciphertext);
      setDecrypted(data.decrypted);
      setMetrics(data.metrics);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Pedido falhou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header onInfoClick={() => setInfoOpen(true)} />

      <Modal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Desenvolvimento"
      >
        <p>
          O RSA assenta na dificuldade de fatorar números grandes. Este
          protótipo permite escolher primos pequenos <strong>p</strong> e{" "}
          <strong>q</strong>, definir uma mensagem curta e comparar tempos
          entre fatoração clássica, simulação quântica (Shor) e força bruta.
        </p>
        <p>
          A codificação e validação RSA são feitas no servidor. O campo de
          texto limita o tamanho a &lt; <strong>N = p×q</strong> caracteres.
        </p>
        <ul>
          <li>
            Escolha o par <strong>p</strong> e <strong>q</strong>, escreva a
            mensagem e use <strong>Implementar</strong> para obter métricas e
            gráficos.
          </li>
          <li>
            Métricas clássicas vêm da API; quânticas e força bruta podem ser
            placeholders até integrar Shor e simulações completas.
          </li>
        </ul>
      </Modal>

      <Page
        pq={pq}
        onPqChange={(value) => {
          setPq(value);
          const nextN = PQ_PAIRS[value].p * PQ_PAIRS[value].q;
          setMessage((m) => m.slice(0, nextN - 1));
          setCiphertext("");
          setDecrypted("");
          setMetrics(null);
          setServerError(null);
        }}
        n={n}
        maxLen={maxLen}
        message={message}
        onMessageChange={handleMessageChange}
        validationError={validationError}
        serverError={serverError}
        onImplement={handleImplement}
        implementDisabled={
          message.trim().length === 0 || message.length >= n || loading
        }
        loading={loading}
        metrics={metrics}
        ciphertext={ciphertext}
        decrypted={decrypted}
      />
    </div>
  );
}
