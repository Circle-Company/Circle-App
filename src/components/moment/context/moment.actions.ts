import React from "react"
import PersistedContext from "../../../contexts/Persisted"
import { apiRoutes } from "../../../api"
import { actionsProps, InteractionPayload, InteractionPayloadMap } from "./types"

export type InteractionType = "LIKE" | "UNLIKE" | "WATCH" | "COMMENT" | "EXCLUDE"

export interface MomentActionsState extends actionsProps {
    setInitialLikedState: React.Dispatch<React.SetStateAction<boolean>>
    registerInteraction: <T extends InteractionType>(
        interactionType: T,
        data?: InteractionPayload<T>,
    ) => Promise<void>
    set: (actions: actionsProps) => void
    get: () => actionsProps
}

export function useActions(momentId?: string): MomentActionsState {
    const { session } = React.useContext(PersistedContext)

    // Estados para interações
    const [like, setLike] = React.useState<boolean>(false)
    const [watch, setWatch] = React.useState<number>(0)
    const [comment, setComment] = React.useState<boolean>(false)
    const [initialLikedState, setInitialLikedState] = React.useState<boolean>(false)

    // Função para enviar interação para o servidor
    const registerInteraction = React.useCallback(
        async <T extends InteractionType>(interactionType: T, data?: InteractionPayload<T>) => {
            if (!momentId || !session.account.jwtToken) {
                console.warn("MomentId ou token não disponível para enviar interação")
                return
            }

            try {
                const baseParams = {
                    momentId,
                    authorizationToken: session.account.jwtToken,
                }

                switch (interactionType) {
                    case "LIKE": {
                        if (!like && initialLikedState == false)
                            await apiRoutes.moment.actions.like(baseParams).then(() => {
                                setLike(true)
                            })
                        break
                    }
                    case "UNLIKE": {
                        if (like)
                            await apiRoutes.moment.actions.unlike(baseParams).then(() => {
                                setLike(false)
                            })
                        break
                    }
                    case "WATCH": {
                        const payload = data as InteractionPayloadMap["WATCH"]
                        if (!payload || typeof payload.watchTime !== "number") {
                            console.warn("WATCH requer payload { watchTime: number }")
                            return
                        }
                        await apiRoutes.moment.actions.watch({
                            ...baseParams,
                            watchTime: payload.watchTime,
                        })
                        break
                    }
                    case "COMMENT": {
                        const payload = data as InteractionPayloadMap["COMMENT"]
                        if (
                            !payload ||
                            typeof payload.content !== "string" ||
                            !payload.content.trim()
                        ) {
                            console.warn(
                                "COMMENT requer payload { content: string, mentions?: string[], parentId?: string }",
                            )
                            return
                        }
                        await apiRoutes.moment.actions.comment({
                            ...baseParams,
                            content: payload.content,
                            mentions: payload.mentions ?? [],
                            parentId: payload.parentId ?? "",
                        })
                        break
                    }
                    case "EXCLUDE": {
                        if (momentId == session.user.id) {
                            await apiRoutes.moment.author.exclude({
                                ...baseParams,
                            })
                        }
                        break
                    }
                    default: {
                        console.warn(`Tipo de interação não reconhecido: ${interactionType}`)
                    }
                }
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || "Erro desconhecido"
                console.error(`Erro ao enviar interação ${interactionType}:`, errorMessage)

                // Reverter estado em caso de erro para like/unlike
                if (interactionType === "LIKE" || interactionType === "UNLIKE") {
                    setLike(interactionType === "UNLIKE")
                }
            }
        },
        [momentId, session.account.jwtToken],
    )

    function get(): actionsProps {
        return {
            like,
            watch,
            comment,
            initialLikedState,
        }
    }

    function set(actions: actionsProps) {
        setLike(actions.like)
        setWatch(actions.watch)
        setComment(actions.comment)
        setInitialLikedState(actions.like)
    }

    return {
        like,
        watch,
        comment,
        initialLikedState,
        setInitialLikedState,
        registerInteraction,
        set,
        get,
    }
}
