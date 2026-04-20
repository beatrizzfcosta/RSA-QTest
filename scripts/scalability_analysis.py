import time
import math
import numpy as np
import matplotlib.pyplot as plt
from algorithms.quantum.shor_wrapper import run_shor
from algorithms.classical.brute_factor import factor_by_trial_division

def run_benchmarks():
    test_cases = [
        {"n": 15, "bits": 4},
        {"n": 21, "bits": 5}
    ]
    real_data = []
    print("A medir tempos reais (isto vai demorar alguns segundos)...")
    for case in test_cases:
        # Shor Real
        q_res = run_shor(case["n"], shots=256)
        # Força Bruta Real
        _, _, t_brute = factor_by_trial_division(case["n"])
        
        real_data.append({
            "bits": case["bits"],
            "shor": q_res["time"],
            "brute": t_brute
        })
    return real_data

def plot_extrapolation(real_data):
    # 1. Preparar eixo X (bits) de 4 até 1024 (RSA real)
    bits_range = np.linspace(4, 1024, 100)
    
    # 2. Fórmulas de Complexidade (Normalizadas para os teus dados)
    # Usamos o teu tempo de N=15 como ponto de partida (âncora)
    t0 = real_data[0]["shor"] 
    b0 = real_data[0]["bits"]
    
    # Shor Teórico: T = t0 * (bits / b0)^3
    shor_theory = [t0 * (b / b0)**3 for b in bits_range]
    
    # Clássico (GNFS) Teórico: cresce muito mais rápido
    classic_theory = [real_data[0]["brute"] * math.exp(0.5 * (b - b0)) for b in bits_range]

    # 3. Criar o Gráfico
    plt.figure(figsize=(10, 6))
    
    # Desenhar Projeções
    plt.plot(bits_range, shor_theory, label='Projeção Shor (Polinomial $n^3$)', color='purple', lw=2)
    plt.plot(bits_range, classic_theory, label='Projeção Clássica (Exponencial)', color='red', ls='--', lw=2)
    
    # Adicionar os teus pontos REAIS medidos
    bits_reais = [d["bits"] for d in real_data]
    shor_reais = [d["shor"] for d in real_data]
    plt.scatter(bits_reais, shor_reais, color='black', label='Teus dados reais (Shor)', zorder=5)

    # Configurações de escala
    plt.yscale('log') # Escala Logarítmica é obrigatória aqui
    plt.xlabel('Tamanho da Chave (Bits)')
    plt.ylabel('Tempo de Execução (Segundos - Escala Log)')
    plt.title('Ameaça Quântica: Extrapolação de Escalabilidade')
    plt.legend()
    plt.grid(True, which="both", ls="-", alpha=0.3)
    
    print("A abrir o gráfico...")
    plt.show()

if __name__ == "__main__":
    data = run_benchmarks()
    plot_extrapolation(data)