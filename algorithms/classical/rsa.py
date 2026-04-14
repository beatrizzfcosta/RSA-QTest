import math


def generate_keys(p: int, q: int):

    if p == q:
        raise ValueError("p e q não podem ser iguais")

    #N
    N = p * q

    #Totiente
    phi = (p - 1) * (q - 1)

    #Escolher e (coprimo com phi)
    e = 3
    while math.gcd(e, phi) != 1:
        e += 2

    #Calcular d (inverso modular)
    d = pow(e, -1, phi)

    return (N, e), (N, d)


def encrypt(message: int, public_key):
  
    N, e = public_key
    return pow(message, e, N)


def decrypt(cipher: int, private_key):
   
    N, d = private_key
    return pow(cipher, d, N)