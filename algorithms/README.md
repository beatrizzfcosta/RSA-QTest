# `algorithms/` — Lógica clássica e quântica

## Objetivo

Centralizar a fatorização clássica, operações RSA e o circuito/algoritmo de Shor (Qiskit), para ser consumido pelo backend via importação Python.

---

## Estrutura

```
algorithms/
├── classical/
│   ├── brute_factor.py        # Fatorização por divisão experimental até √N
│   ├── rsa.py                 # Implementação RSA (geração de chaves, cifra, decifra)
│   └── rsa_experiment.py      # Runner de experiência RSA com métricas
│
└── quantum/
    ├── adder.py               # Circuito somador quântico
    ├── qft.py                 # Quantum Fourier Transform (QFT)
    ├── shor.py                # Implementação do algoritmo de Shor (Qiskit)
    └── shor_wrapper.py        # Wrapper de alto nível: Shor + RSA experiment
```

---

## Dependências

```txt
qiskit>=1.0
qiskit-aer>=0.14
numpy
sympy
```

```bash
pip install qiskit qiskit-aer numpy sympy
```