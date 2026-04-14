import time
from algorithms.classical.rsa import generate_keys, encrypt_text, decrypt_text


def run_rsa_experiment(p: int, q: int, message: str):

    public, private = generate_keys(p, q)

    #ENCRIPT
    start = time.time()
    cipher = encrypt_text(message, public)
    encrypt_time = (time.time() - start) * 1000

    #DECRYPT
    start = time.time()
    decrypted = decrypt_text(cipher, private)
    decrypt_time = (time.time() - start) * 1000

    return {
        "ciphertext": cipher,
        "decrypted": decrypted,
        "metrics": {
            "classic": {
                "timeMs": encrypt_time,
                "operations": len(message), #blocos processados
                "computationalCost": len(message) #cresce linearmente com o tamanho da mensagem
            }
        }
    }