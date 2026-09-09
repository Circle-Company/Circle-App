import React from "react"
import PersistedContext from "../../../contexts/Persisted"
import { apiRoutes } from "../../../api"
import { actionsProps, InteractionPayload, InteractionPayloadMap } from "./types"

export type InteractionType = "LIKE" | "UNLIKE" | "WATCH" | "COMMENT" | "EXCLUDE"

export interface MomentActionsState extends actionsProps {
    setInitialLikedState: React.Dispatch<React.SetStateAction<boolean>>
    // Exposto para o botão de like alinhar este estado ao `likedMoments`
    // persistido: as guardas de LIKE/UNLIKE abaixo dependem de `like`, e sem
    // isso um momento curtido em outra tela não conseguiria ser descurtido.
    setLike: React.Dispatch<React.SetStateAction<boolean>>
    // Resolve com `true` quando a interação foi de fato enviada e aceita, e com
    // `false` quando foi ignorada (payload/token inválido) ou falhou na API.
    // Não rejeita: vários chamadores disparam sem await nem catch.
    registerInteraction: <T extends InteractionType>(
        interactionType: T,
        data?: InteractionPayload<T>,
    ) => Promise<boolean>
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
            if (!momentId || !session.account.userId) {
                console.warn("MomentId ou token não disponível para enviar interação")
                return false
            }

            try {
                const baseParams = {
                    momentId,
                }

                switch (interactionType) {
                    case "LIKE": {
                        if (!like && initialLikedState === false)
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
                            return false
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
                            return false
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
                        /*
                         * ⚠️ Esta guarda compara o id do MOMENT com o id do USUÁRIO — dois
                         * Snowflakes de coisas diferentes, que nunca vão ser iguais. Ou seja,
                         * o `exclude` abaixo é inalcançável.
                         *
                         * Só não causa dano porque nada chama `registerInteraction("EXCLUDE")`:
                         * quem apaga um momento hoje é `apiRoutes.moment.author.exclude`,
                         * chamado direto em `app/(tabs)/you/index.tsx`.
                         *
                         * A guarda correta seria comparar o **dono do momento** com o usuário
                         * logado, mas `useActions(momentId)` não recebe o dono — só o id do
                         * momento. Corrigir de verdade exige passar essa informação para cá, o
                         * que é decisão de quem for reativar o fluxo. O `===` aqui não muda
                         * nada: com `==` a condição já era sempre falsa.
                         */
                        if (String(momentId) === String(session.account.userId)) {
                            await apiRoutes.moment.author.exclude({
                                ...baseParams,
                            })
                        }
                        break
                    }
                    default: {
                        console.warn(`Tipo de interação não reconhecido: ${interactionType}`)
                        return false
                    }
                }
                return true
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.message || error.message || "Erro desconhecido"
                console.error(`Erro ao enviar interação ${interactionType}:`, errorMessage)

                // Reverter estado em caso de erro para like/unlike
                if (interactionType === "LIKE" || interactionType === "UNLIKE") {
                    setLike(interactionType === "UNLIKE")
                }
                return false
            }
        },
        [momentId, session.account.userId],
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
        setInitialLikedState(actions.initialLikedState)
    }

    return {
        like,
        watch,
        comment,
        initialLikedState,
        setInitialLikedState,
        setLike,
        registerInteraction,
        set,
        get,
    }
}
