import React from "react"
import PersistedContext from "@/contexts/Persisted"
import api from "@/api"

import { momentsProps } from "@/api/account/account.types"
interface profileProps {
    success: boolean
    profile: {
        id: string
        username: string
        name: string | null
        profilePicture: string | null
        description: string | null
        status: {
            verified: boolean
        }
        metrics: {
            totalMomentsCreated: number
            totalFollowers: number
        }
        interactions: {
            isFollowing: boolean
            isFollowedBy: boolean
            isBlockedBy: boolean
            isBlocking: boolean
        }
    }
    error?: string
}

type ProfileProviderProps = { children: React.ReactNode }
type pagination = { page: number; limit: number; userId?: string }

export type ProfileContextsData = {
    isLoadingProfile: boolean
    isLoadingMoments: boolean
    setIsLoadingProfile: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoadingMoments: React.Dispatch<React.SetStateAction<boolean>>
    profile: profileProps["profile"]
    moments: momentsProps["moments"]
    getProfile: (userId?: string) => Promise<profileProps["profile"]>
    getMoments: ({ page, limit, userId }: pagination) => Promise<momentsProps["moments"]>
    setUserId: React.Dispatch<React.SetStateAction<string>>
    setProfilePreview: (payload: { id?: string; username?: string }) => void
    totalMoments: number
    setMoments: React.Dispatch<React.SetStateAction<momentsProps["moments"]>>
    setTotalMoments: React.Dispatch<React.SetStateAction<number>>
    cleanProfile: () => void
}

const ProfileContext = React.createContext<ProfileContextsData>({} as ProfileContextsData)

export function Provider({ children }: ProfileProviderProps) {
    const { session } = React.useContext(PersistedContext)

    const [isLoadingProfile, setIsLoadingProfile] = React.useState(false)
    const [isLoadingMoments, setIsLoadingMoments] = React.useState(false)
    const [moments, setMoments] = React.useState<momentsProps["moments"]>(
        [] as momentsProps["moments"],
    )
    const [profile, setProfile] = React.useState<profileProps["profile"]>(
        {} as profileProps["profile"],
    )
    const [totalMoments, setTotalMoments] = React.useState<number>(0)

    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(20)
    const [userId, setUserId] = React.useState<string>(session?.user?.id || "")
    // Guarda o último userId solicitado para evitar condições de corrida
    const lastRequestedUserIdRef = React.useRef<string>("")

    function transformUserToProfilePayload(payload: any): profileProps["profile"] {
        // Normaliza diferentes formatos retornados pela API:
        // - payload.profile ou payload.user ou o próprio payload
        const root = (payload && (payload.profile || payload.user)) || payload || {}

        // Extrai id de múltiplas chaves possíveis
        const rawId =
            root.id ??
            root.userId ??
            root.pk ??
            root._id ??
            (typeof root.getId === "function" ? root.getId() : "")

        // Extrai username de múltiplas chaves possíveis
        const rawUsername =
            root.username ?? root.handle ?? root.login ?? root.user_name ?? root.nick ?? ""

        // Extrai nome/descrição
        const rawName = root.name ?? root.fullName ?? root.displayName ?? ""
        const rawDescription = root.description ?? root.bio ?? root.about ?? ""

        // Extrai foto de perfil de múltiplas chaves
        const rawProfilePicture =
            root.profilePicture ?? root.avatar ?? root.avatarUrl ?? root.photo ?? root.image ?? ""

        // Status verificado pode vir em root.status.verified ou root.verified
        const statusVerified =
            (root?.status && !!root?.status?.verified) ||
            (typeof root?.verified === "boolean" && root.verified) ||
            false

        // Métricas podem vir em root.metrics ou em root.profile.metrics
        const metricsSrc = root?.metrics || root?.profile?.metrics || {}
        const metrics = {
            totalFollowers: Number(metricsSrc?.totalFollowers ?? 0),
            totalMomentsCreated: Number(metricsSrc?.totalMomentsCreated ?? 0),
        }

        // Normalize interactions from various possible backend shapes
        const interSrc =
            root?.interactions ||
            root?.relationship ||
            root?.relations ||
            root?.follow ||
            root?.social ||
            {}

        const interactions = {
            isFollowing: !!(
                interSrc.isFollowing ??
                interSrc.following ??
                interSrc.youFollow ??
                interSrc.you_are_following
            ),
            isFollowedBy: !!(
                interSrc.isFollowedBy ??
                interSrc.followedBy ??
                interSrc.followYou ??
                interSrc.follows_you
            ),
            isBlockedBy: !!(interSrc.isBlockedBy ?? interSrc.blockedBy ?? interSrc.is_blocked_by),
            isBlocking: !!(
                interSrc.isBlocking ??
                interSrc.blocking ??
                interSrc.you_block ??
                interSrc.you_are_blocking
            ),
        }

        return {
            id: String(rawId ?? ""),
            username: String(rawUsername ?? ""),
            name: String(rawName ?? "") || "",
            description: String(rawDescription ?? "") || "",
            profilePicture: rawProfilePicture ? String(rawProfilePicture) : "",
            status: { verified: statusVerified },
            metrics,
            interactions,
        }
    }

    async function getProfile(requestUserId?: string): Promise<profileProps["profile"]> {
        const targetId = String(requestUserId || userId || "")
        if (!targetId) {
            // Quando não houver ID, retorna o último estado conhecido
            return profile
        }
        const token = session?.account?.jwtToken
        if (!token) {
            console.warn("⚠️ ProfileContext: missing jwtToken, skipping getProfile")
            return profile
        }
        // Marca o último userId solicitado antes de iniciar a request
        lastRequestedUserIdRef.current = targetId
        setIsLoadingProfile(true)
        try {
            const res = await api.get(`/users/${targetId}`, {
                headers: { Authorization: `Bearer ${session.account.jwtToken}` },
            })
            // Garante que a resposta ainda corresponde ao último userId solicitado
            if (lastRequestedUserIdRef.current !== targetId) {
                // Resposta atrasada/obsoleta; ignorar
                return profile
            }
            const acc = transformUserToProfilePayload(res?.data ?? {})
            setProfile(acc)
            return acc
        } catch (error) {
            console.error("Erro ao carregar perfil:", error)
            return profile
        } finally {
            // Apenas limpa o loading se ainda estivermos olhando para o mesmo userId
            if (lastRequestedUserIdRef.current === targetId) {
                setIsLoadingProfile(false)
            }
        }
    }

    async function getMoments({
        page,
        limit,
        userId: reqUserId,
    }: pagination): Promise<momentsProps["moments"]> {
        const targetId = String(reqUserId || userId || "")
        if (!targetId) {
            return moments
        }
        setPageSize(limit)
        setCurrentPage(page)
        const token = session?.account?.jwtToken
        if (!token) {
            console.warn("⚠️ ProfileContext: missing jwtToken, skipping getMoments")
            return moments
        }
        setIsLoadingMoments(true)
        try {
            const res = await api.get(`/users/${targetId}/moments?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${session.account.jwtToken}` },
            })
            const list = (res?.data?.moments ?? res?.data ?? []) as momentsProps["moments"]
            if (page === 1) {
                setMoments(list)
                setTotalMoments(list.length)
            } else {
                setMoments((prev) => [...prev, ...list])
                setTotalMoments((prev) => prev + list.length)
            }
            return list
        } catch (error) {
            console.error("Erro ao carregar momentos do perfil:", error)
            return moments
        } finally {
            setIsLoadingMoments(false)
        }
    }

    function setProfilePreview(payload: { id?: string; username?: string }) {
        setProfile(
            (prev) =>
                ({
                    ...(prev as any),
                    id: payload.id !== undefined ? String(payload.id) : prev.id,
                    username:
                        payload.username !== undefined ? String(payload.username) : prev.username,
                }) as any,
        )
        if (payload.id) setUserId(String(payload.id))
    }

    function cleanProfile() {
        // Reset profile-related state when leaving the profile stack
        lastRequestedUserIdRef.current = ""
        setIsLoadingProfile(false)
        setIsLoadingMoments(false)
        setMoments([] as momentsProps["moments"])
        setProfile({} as profileProps["profile"])
        setTotalMoments(0)
        setCurrentPage(1)
        setPageSize(20)
        // Restore default userId to the session user (prevents leaking viewed userId)
        setUserId(session?.user?.id || "")
    }

    const contextValue: ProfileContextsData = {
        isLoadingProfile,
        isLoadingMoments,
        setIsLoadingProfile,
        setIsLoadingMoments,
        profile,
        moments,
        getProfile,
        getMoments,
        setUserId,
        setProfilePreview,
        totalMoments,
        setTotalMoments,
        setMoments,
        cleanProfile,
    }

    return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}
export default ProfileContext
