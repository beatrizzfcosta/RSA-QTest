import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from algorithms.classical.brute_factor import factor_by_trial_division
from algorithms.classical.rsa_experiment import run_rsa_experiment
from algorithms.quantum.shor_wrapper import run_shor

# Teto de shots; para N pequenos o circuito do Shor já é grande — usar menos shots
# mantém a demo interativa (ex.: p×q = 21) sensivelmente mais rápida.
SHOR_SHOTS = 1024
# N até este produto usa min(SHOR_SHOTS, SHOR_SHOTS_SMALL_N) no /api/run
_SHOR_SMALL_N_THRESHOLD = 40


def _shor_shots_for_n(n: int) -> int:
    if n <= _SHOR_SMALL_N_THRESHOLD:
        return min(SHOR_SHOTS, 256)
    return SHOR_SHOTS

app = FastAPI(title="RSA-QTest API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    p: int = Field(ge=2, description="Primeiro primo, no mínimo 2.")
    q: int = Field(ge=2, description="Segundo primo, no mínimo 2.")
    message: str = Field(
        min_length=1,
        description="Mensagem a cifrar; tem de ter pelo menos um carácter.",
    )


def _quantum_metrics(n: int) -> dict:
    """Tempo e custo reais de uma execução de Shor (simulador)."""
    shots = _shor_shots_for_n(n)
    result = run_shor(n, shots=shots)
    time_ms = float(result["time"]) * 1000.0
    return {
        "timeMs": round(time_ms, 4),
        "computationalCost": shots,
    }


def _brute_metrics(n: int) -> dict:
    """Tempo e número real de divisões experimentais até encontrar um fator."""
    _factor, trials, elapsed_s = factor_by_trial_division(n)
    time_ms = elapsed_s * 1000.0
    return {
        "timeMs": round(time_ms, 4),
        "operations": trials,
        "computationalCost": trials,
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/run")
def run_experiment(body: RunRequest) -> dict:
    n = body.p * body.q
    if len(body.message) >= n:
        raise HTTPException(
            status_code=400,
            detail=f"Mensagem deve ter menos de {n} caracteres (N = p×q).",
        )
    try:
        out = run_rsa_experiment(body.p, body.q, body.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    cipher_list = out["ciphertext"]
    ciphertext_display = "".join(str(x) for x in cipher_list)

    classic = out["metrics"]["classic"]
    quantum = _quantum_metrics(n)
    brute = _brute_metrics(n)

    return {
        "ciphertext": ciphertext_display,
        "decrypted": out["decrypted"],
        "metrics": {
            "classic": classic,
            "quantum": quantum,
            "brute": brute,
        },
    }
