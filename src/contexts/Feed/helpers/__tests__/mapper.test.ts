import { describe, expect, it } from "vitest"

import { MomentProps } from "../../types"
import { mapper } from "../mapper"

// Mock data para os testes
const mockMoments: MomentProps[] = [
    {
        id: "1",
        user: {
            id: "1",
            username: "user1",
            verifyed: false,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: false,
        },
        description: "Test moment 1",
        content_type: "VIDEO",
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "",
            fullhd_resolution: "",
            nhd_resolution: "",
        },
        comments_count: 0,
        likes_count: 0,
        isLiked: false,
        deleted: false,
        created_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "2",
        user: {
            id: "2",
            username: "user2",
            verifyed: true,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: true,
        },
        description: "Test moment 2",
        content_type: "IMAGE",
        midia: {
            content_type: "IMAGE",
            nhd_thumbnail: "",
            fullhd_resolution: "",
            nhd_resolution: "",
        },
        comments_count: 5,
        likes_count: 10,
        isLiked: true,
        deleted: false,
        created_at: "2024-01-02T00:00:00Z",
    },
    {
        id: "3",
        user: {
            id: "3",
            username: "user3",
            verifyed: false,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: false,
        },
        description: "Test moment 3",
        content_type: "VIDEO",
        midia: {
            content_type: "VIDEO",
            nhd_thumbnail: "",
            fullhd_resolution: "",
            nhd_resolution: "",
        },
        comments_count: 2,
        likes_count: 5,
        isLiked: false,
        deleted: false,
        created_at: "2024-01-03T00:00:00Z",
    },
]

const fallbackMoments: MomentProps[] = [
    {
        id: "4",
        user: {
            id: "4",
            username: "user4",
            verifyed: true,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: true,
        },
        description: "Fallback moment 4",
        content_type: "IMAGE",
        midia: {
            content_type: "IMAGE",
            nhd_thumbnail: "",
            fullhd_resolution: "",
            nhd_resolution: "",
        },
        comments_count: 1,
        likes_count: 3,
        isLiked: false,
        deleted: false,
        created_at: "2024-01-04T00:00:00Z",
    },
    {
        id: "1", // Mesmo ID do primeiro mock, para testar fallback
        user: {
            id: "1",
            username: "user1_fallback",
            verifyed: true,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: true,
        },
        description: "Fallback moment 1",
        content_type: "IMAGE",
        midia: {
            content_type: "IMAGE",
            nhd_thumbnail: "",
            fullhd_resolution: "",
            nhd_resolution: "",
        },
        comments_count: 10,
        likes_count: 20,
        isLiked: true,
        deleted: false,
        created_at: "2024-01-01T12:00:00Z",
    },
]

describe("mapper", () => {
    describe("casos básicos", () => {
        it("deve mapear IDs para momentos correspondentes", () => {
            const ids = ["1", "2"]
            const result = mapper(ids, mockMoments, [])

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual(mockMoments[0])
            expect(result[1]).toEqual(mockMoments[1])
        })

        it("deve retornar array vazio para IDs vazios", () => {
            const result = mapper([], mockMoments, [])

            expect(result).toEqual([])
        })

        it("deve retornar array vazio para momentos vazios", () => {
            const result = mapper(["1", "2"], [], [])

            expect(result).toEqual([])
        })

        it("deve manter ordem dos IDs no resultado", () => {
            const ids = ["3", "1", "2"]
            const result = mapper(ids, mockMoments, [])

            expect(result).toHaveLength(3)
            expect(result[0].id).toBe("3")
            expect(result[1].id).toBe("1")
            expect(result[2].id).toBe("2")
        })
    })

    describe("fallback", () => {
        it("deve usar fallback quando momento não encontrado em moments", () => {
            const ids = ["1", "4"] // ID 4 não existe em mockMoments, mas existe em fallback
            const result = mapper(ids, mockMoments, fallbackMoments)

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual(mockMoments[0]) // Encontrado em moments
            expect(result[1]).toEqual(fallbackMoments[0]) // Encontrado em fallback
        })

        it("deve priorizar moments sobre fallback", () => {
            const ids = ["1"] // ID 1 existe em ambos
            const result = mapper(ids, mockMoments, fallbackMoments)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(mockMoments[0]) // Deve vir de moments, não fallback
            expect(result[0].description).toBe("Test moment 1")
            expect(result[0].description).not.toBe("Fallback moment 1")
        })

        it("deve filtrar IDs que não existem em nenhum lugar", () => {
            const ids = ["1", "999", "2"] // ID 999 não existe
            const result = mapper(ids, mockMoments, fallbackMoments)

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe("1")
            expect(result[1].id).toBe("2")
        })

        it("deve funcionar com fallback vazio", () => {
            const ids = ["1", "999"]
            const result = mapper(ids, mockMoments, [])

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe("1")
        })
    })

    describe("cenários edge cases", () => {
        it("deve lidar com IDs duplicados", () => {
            const ids = ["1", "1", "2", "1"]
            const result = mapper(ids, mockMoments, [])

            expect(result).toHaveLength(4)
            expect(result[0].id).toBe("1")
            expect(result[1].id).toBe("1")
            expect(result[2].id).toBe("2")
            expect(result[3].id).toBe("1")
            // Deve retornar a mesma instância para IDs duplicados
            expect(result[0]).toBe(result[1])
            expect(result[0]).toBe(result[3])
        })

        it("deve lidar com arrays grandes", () => {
            const ids = Array.from({ length: 1000 }, (_, i) => String((i % 3) + 1)) // IDs 1, 2, 3 repetidos
            const result = mapper(ids, mockMoments, [])

            expect(result).toHaveLength(1000)

            // Verificar que todos os momentos são válidos
            result.forEach((moment) => {
                expect(["1", "2", "3"]).toContain(moment.id)
            })
        })

        it("deve manter referências de objeto corretas", () => {
            const ids = ["1", "2"]
            const result = mapper(ids, mockMoments, [])

            // Deve retornar as mesmas instâncias de objeto
            expect(result[0]).toBe(mockMoments[0])
            expect(result[1]).toBe(mockMoments[1])
        })

        it("deve lidar com momentos que têm propriedades undefined/null", () => {
            const momentosComNulls: MomentProps[] = [
                {
                    ...mockMoments[0],
                    lastComment: undefined,
                } as any,
            ]

            const result = mapper(["1"], momentosComNulls, [])

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(momentosComNulls[0])
        })
    })

    describe("performance e otimização", () => {
        it("deve ser eficiente com muitos momentos e poucos IDs", () => {
            const muitosMomentos = Array.from({ length: 10000 }, (_, i) => ({
                ...mockMoments[0],
                id: String(i + 1),
            }))

            const ids = ["1", "5000", "10000"]
            const result = mapper(ids, muitosMomentos, [])

            expect(result).toHaveLength(3)
            expect(result[0].id).toBe("1")
            expect(result[1].id).toBe("5000")
            expect(result[2].id).toBe("10000")
        })

        it("deve ser eficiente com muitos IDs e poucos momentos", () => {
            const muitosIds = Array.from({ length: 1000 }, () =>
                String(Math.floor(Math.random() * 3) + 1),
            )
            const result = mapper(muitosIds, mockMoments, [])

            // Todos os resultados devem ser momentos válidos
            result.forEach((moment) => {
                expect(["1", "2", "3"]).toContain(moment.id)
            })
        })
    })

    describe("casos de integração", () => {
        it("deve simular cenário real de feed com cache", () => {
            // Simular feed atual (fallback) e novos momentos (moments)
            const feedAtual = [mockMoments[0], mockMoments[1]] // IDs 1, 2
            const novosMomentos = [
                {
                    ...mockMoments[2],
                    id: "3",
                },
                {
                    ...mockMoments[0],
                    id: "1",
                    description: "Updated moment 1", // Versão atualizada
                },
            ]

            const idsDesejados = ["1", "2", "3"]
            const result = mapper(idsDesejados, novosMomentos, feedAtual)

            expect(result).toHaveLength(3)
            // ID 1 deve vir dos novos momentos (atualizado)
            expect(result[0].description).toBe("Updated moment 1")
            // ID 2 deve vir do fallback (feed atual)
            expect(result[1]).toBe(feedAtual[1])
            // ID 3 deve vir dos novos momentos
            expect(result[2].id).toBe("3")
        })

        it("deve simular reload completo do feed", () => {
            const feedAntigo = mockMoments
            const feedNovo = [
                {
                    ...mockMoments[0],
                    description: "Updated moment 1",
                },
                {
                    ...mockMoments[1],
                    id: "4",
                    description: "New moment 4",
                },
            ]

            const novosIds = ["1", "4"]
            const result = mapper(novosIds, feedNovo, feedAntigo)

            expect(result).toHaveLength(2)
            expect(result[0].description).toBe("Updated moment 1") // Atualizado
            expect(result[1].description).toBe("New moment 4") // Novo
        })

        it("deve simular cenário de cache miss parcial", () => {
            // Alguns momentos em cache, outros precisam ser buscados
            const cache = [mockMoments[0]] // Apenas ID 1 em cache
            const novosDados = [mockMoments[1], mockMoments[2]] // IDs 2, 3

            const idsNecessarios = ["1", "2", "3"]
            const result = mapper(idsNecessarios, novosDados, cache)

            expect(result).toHaveLength(3)
            expect(result[0]).toBe(cache[0]) // Do cache
            expect(result[1]).toBe(novosDados[0]) // Dos novos dados
            expect(result[2]).toBe(novosDados[1]) // Dos novos dados
        })
    })
})
