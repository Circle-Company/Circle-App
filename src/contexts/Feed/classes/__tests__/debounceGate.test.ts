import { describe, it, expect, vi, beforeEach } from "vitest"
import { DebounceGate } from "../debounceGate"

// Mock da constante DEBOUNCE_TIME
vi.mock("../../constants", () => ({
    DEBOUNCE_TIME: 1000,
}))

describe("DebounceGate", () => {
    let debounceGate: DebounceGate

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe("constructor", () => {
        it("deve usar tempo padrão se não especificado", () => {
            debounceGate = new DebounceGate()
            expect(debounceGate).toBeDefined()
        })

        it("deve usar tempo customizado quando especificado", () => {
            debounceGate = new DebounceGate(500)
            expect(debounceGate).toBeDefined()
        })
    })

    describe("canProceed", () => {
        it("deve permitir primeira execução", () => {
            debounceGate = new DebounceGate(1000)

            expect(debounceGate.canProceed()).toBe(true)
        })

        it("deve bloquear execução antes do tempo de debounce", () => {
            debounceGate = new DebounceGate(1000)

            // Primeira execução
            debounceGate.mark()

            // Avançar menos que o tempo de debounce
            vi.advanceTimersByTime(500)

            expect(debounceGate.canProceed()).toBe(false)
        })

        it("deve permitir execução após tempo de debounce", () => {
            debounceGate = new DebounceGate(1000)

            // Primeira execução
            debounceGate.mark()

            // Avançar mais que o tempo de debounce
            vi.advanceTimersByTime(1001)

            expect(debounceGate.canProceed()).toBe(true)
        })

        it("deve permitir execução exatamente no tempo de debounce", () => {
            debounceGate = new DebounceGate(1000)

            // Primeira execução
            debounceGate.mark()

            // Avançar exatamente o tempo de debounce
            vi.advanceTimersByTime(1000)

            expect(debounceGate.canProceed()).toBe(true)
        })
    })

    describe("mark", () => {
        it("deve marcar o tempo atual", () => {
            debounceGate = new DebounceGate(1000)

            const initialTime = Date.now()
            debounceGate.mark()

            // Verificar que foi marcado (indiretamente através do comportamento)
            expect(debounceGate.canProceed()).toBe(false)
        })

        it("deve atualizar o tempo a cada chamada", () => {
            debounceGate = new DebounceGate(1000)

            // Primeira marcação
            debounceGate.mark()

            // Avançar um pouco
            vi.advanceTimersByTime(500)

            // Segunda marcação
            debounceGate.mark()

            // Ainda deve estar bloqueado
            expect(debounceGate.canProceed()).toBe(false)

            // Avançar mais 1000ms (desde a segunda marcação)
            vi.advanceTimersByTime(1000)

            // Agora deve estar liberado
            expect(debounceGate.canProceed()).toBe(true)
        })
    })

    describe("cenários de uso real", () => {
        it("deve funcionar com múltiplas chamadas rápidas", () => {
            debounceGate = new DebounceGate(1000)

            // Primeira chamada
            expect(debounceGate.canProceed()).toBe(true)
            debounceGate.mark()

            // Chamadas rápidas subsequentes
            for (let i = 0; i < 5; i++) {
                vi.advanceTimersByTime(100) // Total: 100, 200, 300, 400, 500ms
                expect(debounceGate.canProceed()).toBe(false)
            }

            // Após o tempo de debounce
            vi.advanceTimersByTime(600) // Total: 1100ms
            expect(debounceGate.canProceed()).toBe(true)
        })

        it("deve funcionar com tempo de debounce customizado pequeno", () => {
            debounceGate = new DebounceGate(100)

            debounceGate.mark()

            vi.advanceTimersByTime(50)
            expect(debounceGate.canProceed()).toBe(false)

            vi.advanceTimersByTime(51)
            expect(debounceGate.canProceed()).toBe(true)
        })

        it("deve funcionar com tempo de debounce zero", () => {
            debounceGate = new DebounceGate(0)

            debounceGate.mark()

            // Com debounce zero, deve sempre permitir
            expect(debounceGate.canProceed()).toBe(true)
        })

        it("deve simular comportamento real de feed com requisições frequentes", () => {
            debounceGate = new DebounceGate(1000)

            // Simulação de usuário fazendo scroll rápido
            const results = []

            // Primeira requisição
            results.push(debounceGate.canProceed()) // true
            debounceGate.mark()

            // Scroll rápido - múltiplas tentativas
            for (let i = 0; i < 10; i++) {
                vi.advanceTimersByTime(50) // 50ms entre cada tentativa
                results.push(debounceGate.canProceed()) // todas false
            }

            // Usuário para de fazer scroll
            vi.advanceTimersByTime(1000)
            results.push(debounceGate.canProceed()) // true novamente

            expect(results).toEqual([
                true, // primeira
                false,
                false,
                false,
                false,
                false, // scroll rápido
                false,
                false,
                false,
                false,
                false, // scroll rápido continua
                true, // após parar
            ])
        })
    })
})
