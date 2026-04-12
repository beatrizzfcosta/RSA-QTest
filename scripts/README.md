# `scripts/` — Automação e utilitários

## Objetivo

Centralizar comandos 

## Comandos

Validar Python e Node na máquina:

```bash
python3 --version
node --version
npm --version
```

Exemplo de orquestração manual (dois terminais até existir script):

**Terminal A — backend**

```bash
cd /Users/beatrizfimadacosta/RSA-QTest/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal B — frontend**

```bash
cd /Users/beatrizfimadacosta/RSA-QTest/frontend
npm run dev
```