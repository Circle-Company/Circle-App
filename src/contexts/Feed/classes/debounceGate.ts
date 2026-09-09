export const DEBOUNCE_TIME = 1000

export class DebounceGate {
    private lastRequestTime = 0
    constructor(private debounceMs: number = DEBOUNCE_TIME) {}

    canProceed(): boolean {
        const now = Date.now()
        return now - this.lastRequestTime >= this.debounceMs
    }

    mark() {
        this.lastRequestTime = Date.now()
    }

    /**
     * Libera a próxima chamada imediatamente.
     *
     * Uma busca que falhou não deve consumir a janela: sem isto, depois de um erro o
     * usuário puxa para atualizar e o gate responde `canProceed() === false` — a tela
     * fica travada no estado de erro por mais um ciclo, sem ter feito request nenhum.
     */
    reset() {
        this.lastRequestTime = 0
    }
}
