import { describe, expect, it } from "vitest"
import { flattenViewers, latestStats } from "../moment.viewers.helpers"
import type { MomentViewer, MomentViewersResponse } from "@/api/moment/moment.types"

function viewer(userId: string, overrides: Partial<MomentViewer> = {}): MomentViewer {
    return {
        userId,
        username: `user_${userId}`,
        name: null,
        profilePictureUrl: null,
        lastViewedAt: "2026-09-03T18:24:11.000Z",
        viewCount: 1,
        hasCompleted: false,
        hasLiked: false,
        ...overrides,
    }
}

function page(viewers: MomentViewer[], total = viewers.length): MomentViewersResponse {
    return {
        success: true,
        viewers,
        total,
        stats: {
            totalViews: total,
            uniqueViewers: total,
            completedViews: 0,
            averageWatchSeconds: null,
            lastViewedAt: null,
        },
    }
}

describe("flattenViewers", () => {
    it("retorna lista vazia sem dados", () => {
        expect(flattenViewers(undefined)).toEqual([])
    })

    it("preserva a ordem das páginas", () => {
        const data = {
            pages: [page([viewer("1"), viewer("2")]), page([viewer("3")])],
            pageParams: [0, 2],
        }
        expect(flattenViewers(data).map((v) => v.userId)).toEqual(["1", "2", "3"])
    })

    it("não repete quem subiu para o topo entre uma página e outra", () => {
        // Paginação por offset: novas views durante a navegação empurram alguém
        // da primeira página para dentro da segunda.
        const data = {
            pages: [page([viewer("1"), viewer("2")]), page([viewer("2"), viewer("3")])],
            pageParams: [0, 2],
        }
        expect(flattenViewers(data).map((v) => v.userId)).toEqual(["1", "2", "3"])
    })
})

describe("latestStats", () => {
    it("é nulo sem páginas", () => {
        expect(latestStats(undefined)).toBeNull()
        expect(latestStats({ pages: [], pageParams: [] })).toBeNull()
    })

    it("usa os números da última página que chegou", () => {
        const first = page([viewer("1")], 1)
        const second = page([viewer("2")], 9)
        const data = { pages: [first, second], pageParams: [0, 1] }
        expect(latestStats(data)?.uniqueViewers).toBe(9)
    })
})
