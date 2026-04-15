# `backend/` — FastAPI

Servidor **FastAPI** que chama `algorithms/classical/rsa_experiment.py` e devolve JSON ao frontend (proxy Vite: `/api` → `http://127.0.0.1:8000`).

## Arranque

Na raiz do repositório (com venv ativo):

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Em paralelo: `cd frontend && npm run dev` (porta 5173).

## Endpoints (fase actual)

| Método | Caminho        | Descrição |
|--------|----------------|-----------|
| GET    | `/api/health`  | Estado do serviço |
| POST   | `/api/run`     | Corpo JSON: `{ "p", "q", "message" }` — RSA clássico + Shor (simulador) + tentativa de divisão |

Métricas **clássicas** vêm de `run_rsa_experiment`. **Quânticas** de `run_shor` (Qiskit, `SHOR_SHOTS` em `main.py`). **Força bruta** de `factor_by_trial_division` (tempo e tentativas reais).

**Nota:** O RSA neste protótipo trata cada carácter como inteiro `ord(c)`; todos devem ser `< N = p×q`. Para `N` muito pequeno, muitos caracteres imprimíveis não são válidos — use primos maiores ou mensagens com códigos baixos para testes.
