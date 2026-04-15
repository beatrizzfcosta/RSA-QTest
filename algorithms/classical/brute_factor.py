"""Fatoração clássica por tentativa (divisores até √N), com tempo e contagem reais."""

from __future__ import annotations

import math
import time


def factor_by_trial_division(N: int) -> tuple[int | None, int, float]:
    """
    Procura um divisor não trivial de N.

    Devolve (fator, tentativas_de_divisão, segundos_gastos).
    Se N for primo, fator é None e tentativas é o número de d testados.
    """
    if N < 2:
        return None, 0, 0.0
    t0 = time.perf_counter()
    trials = 0
    limit = math.isqrt(N)
    for d in range(2, limit + 1):
        trials += 1
        if N % d == 0:
            return d, trials, time.perf_counter() - t0
    return None, trials, time.perf_counter() - t0
