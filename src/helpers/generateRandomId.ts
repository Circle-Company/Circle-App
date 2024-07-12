export function generateRandomId(length: number): number {
    // Gerar um número inteiro aleatório de 20 caracteres
    let randomNumber = ""
    const characters = "0123456789"
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
        randomNumber += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return Number(randomNumber)
}
