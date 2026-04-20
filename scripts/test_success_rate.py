import matplotlib.pyplot as plt
from algorithms.quantum.shor_wrapper import run_shor

def analyze_shots(N=15):
    # Lista de shots para testar
    shot_list = [1, 2, 4, 8, 16, 32, 64, 128, 256]
    results = []

    print(f"Analisando Taxa de Sucesso para N={N}...")
    
    for s in shot_list:
        success_count = 0
        iterations = 10  # Corremos 10 vezes cada configuração para ter uma média
        
        for _ in range(iterations):
            res = run_shor(N, shots=s)
            if res["success"]:
                success_count += 1
        
        rate = (success_count / iterations) * 100
        results.append(rate)
        print(f"Shots: {s:3} | Taxa de Sucesso: {rate:5.1f}%")

    # Gerar o Gráfico
    plt.figure(figsize=(10, 5))
    plt.plot(shot_list, results, marker='o', color='purple', linestyle='-')
    plt.title(f'Impacto dos Shots na Taxa de Sucesso (N={N})')
    plt.xlabel('Número de Shots')
    plt.ylabel('Taxa de Sucesso (%)')
    plt.grid(True, alpha=0.3)
    plt.show()

if __name__ == "__main__":
    analyze_shots()