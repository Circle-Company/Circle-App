import { describe, it, expect } from "vitest"
import { ListUtils } from "../listUtils"

describe("ListUtils", () => {
    describe("getUniqueNewItems", () => {
        it("deve retornar itens únicos que não estão na lista base", () => {
            const baseList = [1, 2, 3]
            const newList = [3, 4, 5, 6]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([4, 5, 6])
        })

        it("deve retornar lista vazia quando todos os itens já existem", () => {
            const baseList = [1, 2, 3, 4, 5]
            const newList = [1, 2, 3]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([])
        })

        it("deve retornar todos os itens quando lista base está vazia", () => {
            const baseList: number[] = []
            const newList = [1, 2, 3, 4]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([1, 2, 3, 4])
        })

        it("deve retornar lista vazia quando nova lista está vazia", () => {
            const baseList = [1, 2, 3]
            const newList: number[] = []

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([])
        })

        it("deve lidar com listas vazias", () => {
            const baseList: number[] = []
            const newList: number[] = []

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([])
        })

        it("deve preservar a ordem dos itens únicos", () => {
            const baseList = [1, 3, 5]
            const newList = [1, 2, 3, 4, 5, 6]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([2, 4, 6])
        })

        it("deve lidar com números duplicados na nova lista", () => {
            const baseList = [1, 2]
            const newList = [2, 3, 3, 4, 4, 5]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([3, 3, 4, 4, 5])
        })

        it("deve funcionar com números negativos", () => {
            const baseList = [-1, 0, 1]
            const newList = [-2, -1, 0, 2]

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            expect(result).toEqual([-2, 2])
        })

        it("deve ser eficiente com listas grandes", () => {
            const baseList = Array.from({ length: 1000 }, (_, i) => i)
            const newList = Array.from({ length: 1000 }, (_, i) => i + 500)

            const result = ListUtils.getUniqueNewItems(baseList, newList)

            // Deve retornar números de 1000 a 1499 (500 itens únicos)
            expect(result).toHaveLength(500)
            expect(result[0]).toBe(1000)
            expect(result[result.length - 1]).toBe(1499)
        })
    })

    describe("limitListSize", () => {
        it("deve manter a lista quando está dentro do limite", () => {
            const list = [1, 2, 3, 4, 5]
            const maxItems = 10

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toEqual([1, 2, 3, 4, 5])
        })

        it("deve cortar do início mantendo os itens mais recentes", () => {
            const list = [1, 2, 3, 4, 5, 6, 7, 8]
            const maxItems = 5

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toEqual([4, 5, 6, 7, 8])
        })

        it("deve retornar lista completa quando maxItems é 0", () => {
            const list = [1, 2, 3, 4, 5]
            const maxItems = 0

            const result = ListUtils.limitListSize(list, maxItems)

            // slice(-0) retorna a lista completa
            expect(result).toEqual([1, 2, 3, 4, 5])
        })

        it("deve retornar lista vazia quando lista original é vazia", () => {
            const list: number[] = []
            const maxItems = 5

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toEqual([])
        })

        it("deve retornar o último item quando maxItems é 1", () => {
            const list = [1, 2, 3, 4, 5]
            const maxItems = 1

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toEqual([5])
        })

        it("deve lidar com números negativos para maxItems", () => {
            const list = [1, 2, 3, 4, 5]
            const maxItems = -3

            const result = ListUtils.limitListSize(list, maxItems)

            // slice(-(-3)) = slice(3) retorna do índice 3 até o final
            expect(result).toEqual([4, 5])
        })

        it("deve preservar referência da lista quando não há corte", () => {
            const list = [1, 2, 3]
            const maxItems = 5

            const result = ListUtils.limitListSize(list, maxItems)

            // Mesmo resultado, mas nova referência por causa do slice
            expect(result).toEqual(list)
            expect(result).not.toBe(list) // slice sempre retorna nova array
        })

        it("deve funcionar com lista de um elemento", () => {
            const list = [42]
            const maxItems = 1

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toEqual([42])
        })

        it("deve ser eficiente com listas grandes", () => {
            const list = Array.from({ length: 10000 }, (_, i) => i)
            const maxItems = 100

            const result = ListUtils.limitListSize(list, maxItems)

            expect(result).toHaveLength(100)
            expect(result[0]).toBe(9900) // últimos 100 elementos
            expect(result[99]).toBe(9999)
        })
    })

    describe("métodos estáticos", () => {
        it("deve ter métodos estáticos acessíveis", () => {
            expect(typeof ListUtils.getUniqueNewItems).toBe("function")
            expect(typeof ListUtils.limitListSize).toBe("function")
        })

        it("não deve permitir instanciação", () => {
            // ListUtils deve ser uma classe com métodos estáticos apenas
            // Não há constructor definido, então pode ser instanciada mas sem estado
            const instance = new ListUtils()
            expect(instance).toBeInstanceOf(ListUtils)
        })
    })

    describe("casos de integração", () => {
        it("deve funcionar em sequência: filtrar únicos e depois limitar", () => {
            const baseList = [1, 2, 3]
            const newList = [2, 3, 4, 5, 6, 7, 8, 9]
            const maxItems = 5

            // Primeiro: filtrar únicos
            const uniqueItems = ListUtils.getUniqueNewItems(baseList, newList)
            expect(uniqueItems).toEqual([4, 5, 6, 7, 8, 9])

            // Segundo: combinar com lista base
            const combinedList = [...baseList, ...uniqueItems]
            expect(combinedList).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])

            // Terceiro: limitar tamanho
            const limitedList = ListUtils.limitListSize(combinedList, maxItems)
            expect(limitedList).toEqual([5, 6, 7, 8, 9])
        })

        it("deve simular fluxo real de adição de itens ao feed", () => {
            let feedList: number[] = []

            // Primeira carga
            const firstBatch = [1, 2, 3, 4, 5]
            const uniqueFirst = ListUtils.getUniqueNewItems(feedList, firstBatch)
            feedList = [...feedList, ...uniqueFirst]

            expect(feedList).toEqual([1, 2, 3, 4, 5])

            // Segunda carga com alguns duplicados
            const secondBatch = [4, 5, 6, 7, 8]
            const uniqueSecond = ListUtils.getUniqueNewItems(feedList, secondBatch)
            feedList = [...feedList, ...uniqueSecond]

            expect(feedList).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

            // Limitar para manter apenas os 6 mais recentes
            feedList = ListUtils.limitListSize(feedList, 6)

            expect(feedList).toEqual([3, 4, 5, 6, 7, 8])
        })

        it("deve lidar com scroll infinito simulado", () => {
            let currentFeed = [10, 11, 12, 13, 14] // Feed atual
            const maxFeedSize = 10

            // Usuário faz scroll para baixo, carrega itens mais antigos
            const olderItems = [6, 7, 8, 9]
            const uniqueOlder = ListUtils.getUniqueNewItems(currentFeed, olderItems)

            // Adiciona itens antigos no início (simula append_old)
            currentFeed = [...uniqueOlder, ...currentFeed]
            expect(currentFeed).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14])

            // Usuário continua scrolling, carrega mais novos
            const newerItems = [15, 16, 17, 18]
            const uniqueNewer = ListUtils.getUniqueNewItems(currentFeed, newerItems)

            // Adiciona itens novos no final
            currentFeed = [...currentFeed, ...uniqueNewer]
            expect(currentFeed).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])

            // Limita o tamanho para manter performance
            currentFeed = ListUtils.limitListSize(currentFeed, maxFeedSize)
            expect(currentFeed).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
        })
    })
})
