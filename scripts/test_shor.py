from algorithms.quantum.shor_wrapper import run_shor
import json

# Teste com N=15
print("A iniciar simulação quântica (Shor)")
result = run_shor(15, shots=1024)

# Imprimir de forma legível
print(json.dumps(result, indent=4))

if result["success"]:
    print(f"\nSucesso! Fator encontrado: {result['factor']}")
    print(f"Tempo de execução: {result['time']:.4f} segundos")
else:
    print(f"\nFalha na fatorização: {result.get('error', 'Tentativa probabilística falhou')}")