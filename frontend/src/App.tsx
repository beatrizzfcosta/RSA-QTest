import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Modal } from "./components/Modal";
import { Page } from "./components/Page";
import type { PQChoice, FactorMetrics } from "./types";
import { PQ_PAIRS } from "./constants";
import "./App.css";

export default function App() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [pq, setPq] = useState<PQChoice>("3-5");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  /** Preenchido quando existir cifra devolvida pela API */
  const [ciphertext, setCiphertext] = useState("");

  const n = useMemo(() => {
    const pair = PQ_PAIRS[pq];
    return pair.p * pair.q;
  }, [pq]);

  const maxLen = n - 1;

  const validate = (): boolean => {
    if (message.length === 0) {
      setValidationError("Introduza uma mensagem.");
      return false;
    }
    if (message.length >= n) {
      setValidationError(
        `Para RSA com N = p×q = ${n}, a mensagem deve ter menos de ${n} caracteres (tem ${message.length}).`,
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleMessageChange = (value: string) => {
    const clipped = value.slice(0, maxLen);
    setMessage(clipped);
    setHasRun(false);
    setValidationError(null);
    setCiphertext("");
  };

  const handleImplement = () => {
    if (!validate()) return;
    setCiphertext("");
    setHasRun(true);
    // TODO: POST /api/run; setCiphertext(res.ciphertext)
  };

  const metrics = useMemo((): FactorMetrics | null => {
    if (!hasRun) return null;
    // TODO: substituir por resposta real do backend
    return {
      classic: {
        timeMs: 0.42,
        operations: 12,
        computationalCost: 12,
      },
      quantum: {
        timeMs: 1.85,
        operations: "shots: 1024",
        computationalCost: 1024,
      },
      brute: {
        timeMs: 2.1,
        operations: n,
        computationalCost: n * n,
      },
    };
  }, [hasRun, n]);

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
          A mensagem deve representar um valor inferior a{" "}
          <strong>N = p×q</strong> no esquema criptográfico; nesta demo
          validamos o tamanho em caracteres &lt; <strong>N</strong>.
        </p>
        <ul>
          <li>
            Escolha o par <strong>p</strong> e <strong>q</strong>, escreva a
            mensagem e use <strong>Implementar</strong> para obter métricas e
            gráficos.
          </li>
          <li>
            Os valores mostrados são de demonstração até o backend estar ligado.
          </li>
        </ul>
      </Modal>

      <Page
        pq={pq}
        onPqChange={(value) => {
          setPq(value);
          setHasRun(false);
          const nextN = PQ_PAIRS[value].p * PQ_PAIRS[value].q;
          setMessage((m) => m.slice(0, nextN - 1));
          setCiphertext("");
        }}
        n={n}
        maxLen={maxLen}
        message={message}
        onMessageChange={handleMessageChange}
        validationError={validationError}
        onImplement={handleImplement}
        implementDisabled={message.length === 0 || message.length >= n}
        metrics={metrics}
        ciphertext={ciphertext}
      />
    </div>
  );
}
