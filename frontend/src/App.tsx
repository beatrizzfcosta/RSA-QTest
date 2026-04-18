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

type RunResult = {
  ciphertext: string;
  decrypted: string;
  metrics: FactorMetrics;
};

function otherPair(choice: PQChoice): PQChoice {
  return choice === "3-5" ? "3-7" : "3-5";
}

async function postRun(
  p: number,
  q: number,
  message: string,
): Promise<RunResponse> {
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ p, q, message }),
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
  return JSON.parse(text) as RunResponse;
}

export default function App() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [pq, setPq] = useState<PQChoice>("3-5");
  const [secondTestOpen, setSecondTestOpen] = useState(false);
  const [pqB, setPqB] = useState<PQChoice>("3-7");
  const [message, setMessage] = useState("");
  const [messageB, setMessageB] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resultA, setResultA] = useState<RunResult | null>(null);
  const [resultB, setResultB] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const n = useMemo(() => {
    const pair = PQ_PAIRS[pq];
    return pair.p * pair.q;
  }, [pq]);

  const nB = useMemo(() => {
    const pair = PQ_PAIRS[pqB];
    return pair.p * pair.q;
  }, [pqB]);

  const sameParams = secondTestOpen && pq === pqB;

  const maxLenPrimary = useMemo(() => {
    if (!secondTestOpen || sameParams) return Math.max(0, n - 1);
    return Math.max(0, Math.min(n, nB) - 1);
  }, [secondTestOpen, sameParams, n, nB]);

  const maxLenB = useMemo(() => Math.max(0, nB - 1), [nB]);

  const validate = (): boolean => {
    if (message.trim().length === 0) {
      setValidationError("Introduza uma mensagem.");
      return false;
    }
    if (secondTestOpen && sameParams && messageB.trim().length === 0) {
      setValidationError("Introduza a mensagem do segundo teste.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const clearResults = () => {
    setResultA(null);
    setResultB(null);
    setServerError(null);
  };

  const handleMessageChange = (value: string) => {
    const clipped = value.slice(0, maxLenPrimary);
    setMessage(clipped);
    setValidationError(null);
    clearResults();
    if (secondTestOpen && !sameParams) {
      /* segundo teste usa esta mensagem automaticamente */
    }
  };

  const handleMessageBChange = (value: string) => {
    const clipped = value.slice(0, maxLenB);
    setMessageB(clipped);
    setValidationError(null);
    clearResults();
  };

  const handlePqChange = (value: PQChoice) => {
    const primaryWasDifferentFromB = pq !== pqB;
    const nb = PQ_PAIRS[pqB].p * PQ_PAIRS[pqB].q;
    const nn = PQ_PAIRS[value].p * PQ_PAIRS[value].q;
    const cap =
      secondTestOpen && value !== pqB ? Math.min(nn, nb) - 1 : nn - 1;
    const clipped = message.slice(0, Math.max(0, cap));
    setPq(value);
    setMessage(clipped);
    if (secondTestOpen && value === pqB) {
      if (primaryWasDifferentFromB) {
        setMessageB(clipped);
      } else {
        setMessageB((m) => m.slice(0, Math.max(0, nn - 1)));
      }
    }
    clearResults();
  };

  const handlePqBChange = (value: PQChoice) => {
    const prevSame = pq === pqB;
    const na = PQ_PAIRS[pq].p * PQ_PAIRS[pq].q;
    const nn = PQ_PAIRS[value].p * PQ_PAIRS[value].q;
    const cap =
      pq !== value ? Math.min(na, nn) - 1 : na - 1;
    const clipped = message.slice(0, Math.max(0, cap));
    setPqB(value);
    setMessage(clipped);
    if (pq === value) {
      if (!prevSame) {
        setMessageB(clipped);
      } else {
        setMessageB((m) => m.slice(0, Math.max(0, na - 1)));
      }
    }
    clearResults();
  };

  const openSecondTest = () => {
    const nextB = otherPair(pq);
    const na = PQ_PAIRS[pq].p * PQ_PAIRS[pq].q;
    const nb = PQ_PAIRS[nextB].p * PQ_PAIRS[nextB].q;
    setSecondTestOpen(true);
    setPqB(nextB);
    setMessage((m) => m.slice(0, Math.max(0, Math.min(na, nb) - 1)));
    clearResults();
  };

  const closeSecondTest = () => {
    setSecondTestOpen(false);
    setResultB(null);
    setMessageB("");
    setValidationError(null);
    setServerError(null);
    setPqB(otherPair(pq));
    setMessage((m) => m.slice(0, Math.max(0, n - 1)));
  };

  const handleImplement = async () => {
    if (!validate()) return;
    clearResults();
    setLoading(true);
    try {
      const pair = PQ_PAIRS[pq];
      const msg2 = sameParams ? messageB : message;

      if (!secondTestOpen) {
        const data = await postRun(pair.p, pair.q, message);
        setResultA({
          ciphertext: data.ciphertext,
          decrypted: data.decrypted,
          metrics: data.metrics,
        });
        setResultB(null);
      } else {
        const pair2 = PQ_PAIRS[pqB];
        const [dataA, dataB] = await Promise.all([
          postRun(pair.p, pair.q, message),
          postRun(pair2.p, pair2.q, msg2),
        ]);
        setResultA({
          ciphertext: dataA.ciphertext,
          decrypted: dataA.decrypted,
          metrics: dataA.metrics,
        });
        setResultB({
          ciphertext: dataB.ciphertext,
          decrypted: dataB.decrypted,
          metrics: dataB.metrics,
        });
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Pedido falhou.");
    } finally {
      setLoading(false);
    }
  };

  const implementDisabled =
    message.trim().length === 0 ||
    message.length > maxLenPrimary ||
    (secondTestOpen &&
      sameParams &&
      (messageB.trim().length === 0 || messageB.length > maxLenB)) ||
    loading;

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
          protótipo fixa primos pequenos <strong>p</strong> e{" "}
          <strong>q</strong> (com <strong>N = p×q</strong>), aceita uma mensagem
          curta e, num único pedido ao servidor, devolve a cifra, o texto
          recuperado na descriptografia e três medições independentes ligadas a{" "}
          <strong>N</strong> e à mensagem.
        </p>
        <p>
          A API (<code>/api/run</code>) gera as chaves, cifra e decifra no
          servidor e exige <code>comprimento da mensagem &lt; N</code> (o campo
          de texto limita-se a isso). As três métricas vêm todas dessa resposta.
        </p>
        <ul>
          <li>
            <strong>RSA clássico (encriptação):</strong> tempo medido ao cifrar
            a mensagem; custo em linha com o número de caracteres processados.
          </li>
          <li>
            <strong>Shor (simulador quântico):</strong> tempo de uma execução do
            algoritmo de Shor (Qiskit) para trabalhar com o mesmo{" "}
            <strong>N</strong>; o custo computacional corresponde ao número de
            shots definido no backend.
          </li>
          <li>
            <strong>Força bruta (Fatorização clássica):</strong> tempo e número
            de divisões experimentais até encontrar um fator de{" "}
            <strong>N</strong> por tentativa sistemática.
          </li>
        </ul>
        <p>
          Opcionalmente, use <strong>+ Adicionar teste</strong> para comparar
          outro par <strong>p</strong>, <strong>q</strong>: com{" "}
          <strong>N</strong> diferente, o segundo teste reutiliza a mensagem do
          primeiro; com o mesmo par, pode indicar outra mensagem só para o
          segundo teste.
        </p>
      </Modal>

      <Page
        pq={pq}
        onPqChange={handlePqChange}
        n={n}
        maxLenPrimary={maxLenPrimary}
        message={message}
        onMessageChange={handleMessageChange}
        secondTestOpen={secondTestOpen}
        onAddSecondTest={openSecondTest}
        onRemoveSecondTest={closeSecondTest}
        pqB={pqB}
        onPqBChange={handlePqBChange}
        nB={nB}
        sameParams={sameParams}
        messageB={messageB}
        onMessageBChange={handleMessageBChange}
        maxLenB={maxLenB}
        validationError={validationError}
        serverError={serverError}
        onImplement={handleImplement}
        implementDisabled={implementDisabled}
        loading={loading}
        resultA={resultA}
        resultB={resultB}
        labelA={PQ_PAIRS[pq].label}
        labelB={PQ_PAIRS[pqB].label}
      />
    </div>
  );
}
