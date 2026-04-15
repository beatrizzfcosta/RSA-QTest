import math


def generate_keys(p: int, q: int):

    if p == q:
        raise ValueError("p e q não podem ser iguais")

    #N
    N = p * q

    #Totiente φ(N)
    phi = (p - 1) * (q - 1)

    #Escolher e (coprimo com phi)
    e = 3
    while math.gcd(e, phi) != 1:
        e += 2

    #Calcular d (inverso modular)
    d = pow(e, -1, phi)

    return (N, e), (N, d)

#CONVERTER TEXTO

def text_to_numbers(text: str):
    numbers = []
    for c in text.upper():
        if c in ["\n", "\t"]:
            continue 

        if c == " ":
            numbers.append(0) #espaço = 0
        else:
            #1-26 e depois reduz para caber em N
            val = ord(c) - 64 #A=1
            numbers.append(val % 15) #garante < 15

    return numbers

def numbers_to_text(numbers):
    text = ""
    for n in numbers:
        if n == 0:
            text += " "
        else:
            text += chr(n + 64)  #1: A
    return text

def chunk_message(numbers, N):
   #Garante que cada bloco m < N
    chunks = []

    for n in numbers:
        if n >= N:
            raise ValueError(
                f"Valor {n} >= N ({N}). Por favor, usa primos maiores ou reduz mensagem."
            )
        chunks.append(n)

    return chunks


#ENCRYPT
def encrypt(message: int, public_key):
    #Cifra um número

    N, e = public_key
    return pow(message, e, N)


def encrypt_text(text: str, public_key):
    #Cifra uma mensagem de texto
    
    numbers = text_to_numbers(text)
    chunks = chunk_message(numbers, public_key[0])

    encrypted = []

    for m in chunks:
        encrypted.append(encrypt(m, public_key))

    return encrypted

#DECRYPT
def decrypt(cipher: int, private_key):
    #Decifra um número

    N, d = private_key
    return pow(cipher, d, N)


def decrypt_text(cipher_list, private_key):
    #Decifra lista de blocos

    decrypted_numbers = []

    for c in cipher_list:
        decrypted_numbers.append(decrypt(c, private_key))

    return numbers_to_text(decrypted_numbers)

