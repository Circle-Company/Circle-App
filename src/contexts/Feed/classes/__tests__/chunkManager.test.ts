import { describe, it, expect, vi, beforeEach } from "vitest"
import { ChunkManager } from "../chunkManager"

// Mock do helper calculeChunksMaxSize
vi.mock("../../helpers/calculeChunksMaxSize", () => ({
    calculeChunksMaxSize: vi.fn(() => 10), // Tamanho máximo de 10 para facilitar os testes
}))

describe("ChunkManager", () => {
    let chunkManager: ChunkManager

    beforeEach(() => {
        vi.clearAllMocks()
        chunkManager = new ChunkManager()
    })

    describe("constructor", () => {
        it("deve inicializar com lista vazia e histórico vazio", () => {
            expect(chunkManager).toBeDefined()
            // Não podemos testar diretamente propriedades privadas, mas podemos testar o comportamento
        })
    })

    describe("apply - comando RESET", () => {
        it("deve resetar lista vazia com payload vazio", () => {
            const result = chunkManager.apply("RESET")

            expect(result.updatedList).toEqual([])
            expect(result.removedItems).toEqual([])
        })

        it("deve resetar lista com novo payload", () => {
            // Primeiro adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3])

            // Depois resetar com novos itens
            const result = chunkManager.apply("RESET", [4, 5, 6])

            expect(result.updatedList).toEqual([4, 5, 6])
            expect(result.removedItems).toEqual([1, 2, 3])
        })

        it("deve resetar lista grande com nova lista", () => {
            // Adicionar lista completa
            chunkManager.apply("ADD", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

            // Resetar com nova lista
            const result = chunkManager.apply("RESET", [11, 12])

            expect(result.updatedList).toEqual([11, 12])
            expect(result.removedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        })
    })

    describe("apply - comando ADD", () => {
        it("deve lançar erro se payload não fornecido", () => {
            expect(() => {
                chunkManager.apply("ADD")
            }).toThrow("Payload é obrigatório para comando ADD")
        })

        it("deve adicionar itens à lista vazia", () => {
            const result = chunkManager.apply("ADD", [1, 2, 3])

            expect(result.updatedList).toEqual([1, 2, 3])
            expect(result.removedItems).toEqual([])
        })

        it("deve adicionar itens à lista existente", () => {
            // Primeiro adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3])

            // Adicionar mais itens
            const result = chunkManager.apply("ADD", [4, 5])

            expect(result.updatedList).toEqual([1, 2, 3, 4, 5])
            expect(result.removedItems).toEqual([])
        })

        it("deve limitar tamanho da lista e remover itens antigos", () => {
            // Adicionar itens até o limite (10)
            chunkManager.apply("ADD", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

            // Adicionar mais itens que excedem o limite
            const result = chunkManager.apply("ADD", [11, 12, 13])

            expect(result.updatedList).toHaveLength(10)
            expect(result.updatedList).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
            expect(result.removedItems).toEqual([1, 2, 3])
        })

        it("deve lidar com adição que excede muito o limite", () => {
            const result = chunkManager.apply(
                "ADD",
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            )

            expect(result.updatedList).toHaveLength(10)
            expect(result.updatedList).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
            expect(result.removedItems).toEqual([1, 2, 3, 4, 5])
        })
    })

    describe("apply - comando APPEND_OLD", () => {
        it("deve lançar erro se payload não fornecido", () => {
            expect(() => {
                chunkManager.apply("APPEND_OLD")
            }).toThrow("Payload é obrigatório para comando APPEND_OLD")
        })

        it("deve adicionar itens antigos no início da lista", () => {
            // Começar com alguns itens
            chunkManager.apply("ADD", [4, 5, 6])

            // Adicionar itens antigos no início
            const result = chunkManager.apply("APPEND_OLD", [1, 2, 3])

            expect(result.updatedList).toEqual([1, 2, 3, 4, 5, 6])
            expect(result.removedItems).toEqual([])
        })

        it("deve limitar tamanho ao adicionar itens antigos", () => {
            // Começar com lista próxima ao limite
            chunkManager.apply("ADD", [6, 7, 8, 9, 10])

            // Adicionar itens antigos que excedem o limite
            const result = chunkManager.apply("APPEND_OLD", [1, 2, 3, 4, 5])

            expect(result.updatedList).toHaveLength(10)
            expect(result.updatedList).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            expect(result.removedItems).toEqual([])
        })
    })

    describe("apply - comando REMOVE", () => {
        it("deve lançar erro se payload não fornecido", () => {
            expect(() => {
                chunkManager.apply("REMOVE")
            }).toThrow("Payload é obrigatório para comando REMOVE")
        })

        it("deve remover item específico da lista", () => {
            // Adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3, 4, 5])

            // Remover item específico
            const result = chunkManager.apply("REMOVE", [3])

            expect(result.updatedList).toEqual([1, 2, 4, 5])
            expect(result.removedItems).toEqual([3])
        })

        it("deve remover múltiplos itens da lista", () => {
            // Adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3, 4, 5])

            // Remover múltiplos itens
            const result = chunkManager.apply("REMOVE", [2, 4])

            expect(result.updatedList).toEqual([1, 3, 5])
            expect(result.removedItems).toEqual([2, 4])
        })

        it("deve lidar com remoção de item inexistente", () => {
            // Adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3])

            // Tentar remover item inexistente
            const result = chunkManager.apply("REMOVE", [99])

            expect(result.updatedList).toEqual([1, 2, 3])
            expect(result.removedItems).toEqual([99])
        })

        it("deve lidar com remoção de lista vazia", () => {
            const result = chunkManager.apply("REMOVE", [1])

            expect(result.updatedList).toEqual([])
            expect(result.removedItems).toEqual([1])
        })
    })

    describe("rollback", () => {
        it("deve voltar ao estado anterior após ADD", () => {
            // Estado inicial: adicionar alguns itens
            chunkManager.apply("ADD", [1, 2, 3])

            // Fazer uma operação que queremos desfazer
            chunkManager.apply("ADD", [4, 5])

            // Rollback deve voltar ao estado anterior
            const rolledBack = chunkManager.rollback()

            expect(rolledBack).toEqual([1, 2, 3])
        })

        it("deve voltar ao estado anterior após REMOVE", () => {
            // Estado inicial
            chunkManager.apply("ADD", [1, 2, 3, 4, 5])

            // Operação que queremos desfazer
            chunkManager.apply("REMOVE", [3])

            // Rollback
            const rolledBack = chunkManager.rollback()

            expect(rolledBack).toEqual([1, 2, 3, 4, 5])
        })

        it("deve voltar ao estado anterior após RESET", () => {
            // Estado inicial
            chunkManager.apply("ADD", [1, 2, 3])

            // Reset que queremos desfazer
            chunkManager.apply("RESET", [4, 5, 6])

            // Rollback
            const rolledBack = chunkManager.rollback()

            expect(rolledBack).toEqual([1, 2, 3])
        })

        it("deve manter estado atual se não há histórico", () => {
            // Fazer rollback sem histórico
            const rolledBack = chunkManager.rollback()

            expect(rolledBack).toEqual([])
        })

        it("deve funcionar com múltiplos rollbacks", () => {
            // Operação 1
            chunkManager.apply("ADD", [1, 2])

            // Operação 2
            chunkManager.apply("ADD", [3, 4])

            // Operação 3
            chunkManager.apply("ADD", [5, 6])

            // Rollback 1: volta para operação 2
            let rolledBack = chunkManager.rollback()
            expect(rolledBack).toEqual([1, 2, 3, 4])

            // Rollback 2: volta para operação 1
            rolledBack = chunkManager.rollback()
            expect(rolledBack).toEqual([1, 2])

            // Rollback 3: volta para estado inicial
            rolledBack = chunkManager.rollback()
            expect(rolledBack).toEqual([])
        })
    })

    describe("cenários de integração", () => {
        it("deve simular fluxo completo de feed", () => {
            // 1. Carregamento inicial
            let result = chunkManager.apply("ADD", [1, 2, 3, 4, 5])
            expect(result.updatedList).toEqual([1, 2, 3, 4, 5])

            // 2. Carregar mais itens
            result = chunkManager.apply("ADD", [6, 7, 8])
            expect(result.updatedList).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

            // 3. Usuário remove um item
            result = chunkManager.apply("REMOVE", [4])
            expect(result.updatedList).toEqual([1, 2, 3, 5, 6, 7, 8])

            // 4. Carregar mais itens até o limite
            result = chunkManager.apply("ADD", [9, 10, 11, 12])
            expect(result.updatedList).toHaveLength(10)
            expect(result.removedItems).toEqual([1])

            // 5. Reset completo (refresh)
            result = chunkManager.apply("RESET", [20, 21, 22])
            expect(result.updatedList).toEqual([20, 21, 22])
            expect(result.removedItems).toHaveLength(10)
        })

        it("deve simular scroll infinito com itens antigos", () => {
            // Feed atual
            chunkManager.apply("ADD", [10, 11, 12, 13, 14])

            // Usuário faz scroll para cima, carrega itens antigos
            let result = chunkManager.apply("APPEND_OLD", [6, 7, 8, 9])
            expect(result.updatedList).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14])

            // Carrega mais itens antigos - deve exceder o limite e remover do final
            result = chunkManager.apply("APPEND_OLD", [1, 2, 3, 4, 5])
            expect(result.updatedList).toHaveLength(10)
            // O resultado deveria ser os últimos 10 itens: remove do final
            expect(result.updatedList).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
            expect(result.removedItems).toEqual([1, 2, 3, 4])
        })

        it("deve lidar com operações mistas e rollbacks", () => {
            // Operações iniciais
            chunkManager.apply("ADD", [1, 2, 3])
            chunkManager.apply("ADD", [4, 5])
            chunkManager.apply("REMOVE", [2])

            // Estado atual deve ser [1, 3, 4, 5]

            // Fazer uma operação arriscada
            let result = chunkManager.apply("RESET", [10, 20, 30])
            expect(result.updatedList).toEqual([10, 20, 30])

            // Se algo der errado, fazer rollback
            const rolledBack = chunkManager.rollback()
            expect(rolledBack).toEqual([1, 3, 4, 5])
        })
    })
})
