# algorithms/quantum/shor_wrapper.py

"""
Shor Algorithm Wrapper for RSA-QTest

Based on:
https://github.com/benjamin-assel/qiskit-shor

This module provides a simplified interface to run Shor's algorithm
using Qiskit simulators.
"""

import time
import math
from qiskit.primitives import StatevectorSampler
from qiskit.transpiler import PassManager

# Import from your copied files
from algorithms.quantum.shor import find_order


def run_shor(N: int, A: int = None, shots: int = 100):
    """
    Runs Shor's algorithm to factor N.

    Args:
        N (int): Number to factor
        A (int, optional): Base for order finding
        shots (int): Number of executions

    Returns:
        dict: Results including factor, time and success
    """

    # Setup quantum backend (simulator)
    sampler = StatevectorSampler()
    pass_manager = PassManager()

    # If A not provided, choose a valid one
    if A is None:
        for candidate in range(2, N):
            if math.gcd(candidate, N) == 1:
                A = candidate
                break

    start_time = time.time()

    try:
        # Step 1: Find order r
        order, distribution = find_order(
            A,
            N,
            sampler,
            pass_manager,
            num_shots=shots,
            one_control_circuit=False
        )

        # Step 2: Compute factors (classical part)
        if order is None or order % 2 != 0:
            return {
                "N": N,
                "A": A,
                "order": order,
                "factor": None,
                "time": time.time() - start_time,
                "success": False,
                "error": "Invalid order (None or odd)"
            }

        factor1 = math.gcd(pow(A, order // 2) - 1, N)
        factor2 = math.gcd(pow(A, order // 2) + 1, N)

        # Validate factors
        if factor1 in [1, N] and factor2 in [1, N]:
            success = False
            factor = None
        else:
            success = True
            factor = factor1 if factor1 not in [1, N] else factor2

        return {
            "N": N,
            "A": A,
            "order": order,
            "factor": factor,
            "time": time.time() - start_time,
            "success": success,
            "distribution": distribution
        }

    except Exception as e:
        return {
            "N": N,
            "A": A,
            "factor": None,
            "time": time.time() - start_time,
            "success": False,
            "error": str(e)
        }