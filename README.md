<div align="center">

# 🔐 RSA-QTest

**Comparative Analysis of Classical RSA vs Quantum Factorization (Shor's Algorithm)**

[![Last commit](https://img.shields.io/github/last-commit/beatrizzfcosta/RSA-QTest?style=for-the-badge)](https://github.com/beatrizzfcosta/RSA-QTest/commits)
[![Top language](https://img.shields.io/github/languages/top/beatrizzfcosta/RSA-QTest?style=for-the-badge)](https://github.com/beatrizzfcosta/RSA-QTest)
[![Languages](https://img.shields.io/github/languages/count/beatrizzfcosta/RSA-QTest?style=for-the-badge)](https://github.com/beatrizzfcosta/RSA-QTest)
[![Issues](https://img.shields.io/github/issues/beatrizzfcosta/RSA-QTest?style=for-the-badge)](https://github.com/beatrizzfcosta/RSA-QTest/issues)
[![Stars](https://img.shields.io/github/stars/beatrizzfcosta/RSA-QTest?style=for-the-badge)](https://github.com/beatrizzfcosta/RSA-QTest/stargazers)

<br/>

**Built with the tools and technologies:**

<img alt="Python" src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=for-the-badge">
<img alt="Qiskit" src="https://img.shields.io/badge/Qiskit-6929C4?style=for-the-badge">
<img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge">
<img alt="React" src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge">
<img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge">

</div>

---

## 📖 Overview

O **RSA-QTest** é uma aplicação experimental que analisa o impacto da computação quântica na criptografia clássica, com foco no algoritmo RSA.

A plataforma permite comparar:

* 🔐 Desempenho da cifragem e decifragem com RSA
* 🧮 Métodos clássicos de fatoração
* ⚛️ Abordagem quântica com o algoritmo de Shor

O sistema demonstra, de forma prática e visual, como a segurança baseada na dificuldade computacional pode ser comprometida.

---

## 🏗️ Architecture

O sistema segue uma arquitetura em **3 camadas (three-tier)**:

```text
Frontend (React + Chart.js)
        ↓
Backend (FastAPI - Python)
        ↓
Quantum/Classical Processing (Qiskit + Algorithms)
```

---

## Estrutura do repositório

| Pasta | Descrição |
|-------|-----------|
| [`algorithms/`](algorithms/README.md) | RSA, fatoração clássica, Shor (Qiskit) — lógica partilhada |
| [`backend/`](backend/README.md) | API FastAPI |
| [`frontend/`](frontend/README.md) | React, Chart.js |
| [`docs/`](docs/README.md) | Documentação 
| [`scripts/`](scripts/README.md) | Automação (setup, dev) |

Cada pasta inclui um **README** com tarefas de implementação e **comandos** sugeridos para executar localmente.