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

/**
 * @param momentId Id do momento sobre o qual as interações são registradas.
 * @param ownerId  Id do **dono** do momento. Só o `EXCLUDE` o usa, e é o que permite negar
 *                 a exclusão de um momento de outra pessoa — ver a guarda no `switch`.
 */
export function useActions(momentId?: string, ownerId?: string): MomentActionsState {
    const { session } = React.useContext(PersistedContext)

    // Estados para interações
    const [like, setLike] = React.useState<boolean>(false)
    const [watch, setWatch] = React.useState<number>(0)
    const [comment, setComment] = React.useState<boolean>(false)
    const [initialLikedState, setInitialLikedState] = React.useState<boolean>(false)

    /*
     * Interações de like em voo, por momento.
     *
     * Um toque duplo antes de a primeira resposta voltar disparava **dois** POST do mesmo
     * like: `like` só vira `true` dentro do `.then()`, então a segunda chamada ainda
     * encontrava a guarda `!like` aberta. O segundo POST é recusado — o like já existe —
     * e, como o botão trata a recusa como falha, ele revertia o coração de um like que na
     * verdade tinha sido registrado.
     */
    const inFlightRef = React.useRef<Set<string>>(new Set())

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
                        if (!like && initialLikedState === false) {
                            const key = `LIKE:${momentId}`
                            // Já há um POST desta curtida em voo: o estado final pretendido
                            // é o mesmo, então isto é sucesso — devolver `false` faria o
                            // botão desfazer o like que está sendo enviado.
                            if (inFlightRef.current.has(key)) return true
                            inFlightRef.current.add(key)
                            try {
                                await apiRoutes.moment.actions.like(baseParams)
                                setLike(true)
                            } finally {
                                inFlightRef.current.delete(key)
                            }
                        }
                        break
                    }
                    case "UNLIKE": {
                        if (like) {
                            const key = `UNLIKE:${momentId}`
                            if (inFlightRef.current.has(key)) return true
                            inFlightRef.current.add(key)
                            try {
                                await apiRoutes.moment.actions.unlike(baseParams)
                                setLike(false)
                            } finally {
                                inFlightRef.current.delete(key)
                            }
                        }
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
                         * Só o dono apaga o próprio momento.
                         *
                         * A guarda anterior comparava `momentId` com `session.account.userId`
                         * — o id do MOMENTO com o id do USUÁRIO, dois Snowflakes de coisas
                         * diferentes que nunca são iguais. O efeito era o `exclude` ficar
                         * inalcançável: parecia uma checagem de permissão e era, na prática,
                         * um `return` disfarçado.
                         *
                         * O dono agora chega por parâmetro (`ownerId`), vindo de
                         * `data.user.id` no `MomentProvider`. Sem ele a exclusão é **negada**:
                         * numa ação destrutiva o default seguro é recusar, não presumir posse.
                         *
                         * `String()` dos dois lados porque o id às vezes chega como número do
                         * backend, e aí `===` puro reprovaria o próprio dono.
                         */
                        const isOwner =
                            !!ownerId && String(ownerId) === String(session.account.userId)

                        if (!isOwner) {
                            console.warn(
                                "EXCLUDE negado: o momento não pertence ao usuário logado",
                                JSON.stringify({ momentId, hasOwnerId: !!ownerId }),
                            )
                            return false
                        }

                        await apiRoutes.moment.author.exclude({
                            ...baseParams,
                        })
                        break
                    }
                    default: {
                        console.warn(`Tipo de interação não reconhecido: ${interactionType}`)
                        return false
                    }
                }
                return true
            } catch (error: any) {
                /*
                 * O corpo da resposta entra no log, e não só `data.message`.
                 *
                 * Um 400 do backend traz o motivo em campos que variam conforme a camada que
                 * recusou (`message`, `error`, `code`, `details`, erro de validação em
                 * lista). Lendo só `message`, tudo isso caía no texto genérico do axios —
                 * "Request failed with status code 400" —, que não diz o que foi recusado e
                 * torna a falha indiagnosticável a partir do log do device.
                 */
                let body = ""
                try {
                    body = JSON.stringify(error?.response?.data) ?? ""
                } catch {
                    body = "[unserializable]"
                }
                console.error(
                    `Erro ao enviar interação ${interactionType}:`,
                    JSON.stringify({
                        status: error?.response?.status,
                        momentId,
                        message: error?.response?.data?.message || error?.message,
                        body: body.slice(0, 500),
                    }),
                )

                // Reverter estado em caso de erro para like/unlike
                if (interactionType === "LIKE" || interactionType === "UNLIKE") {
                    setLike(interactionType === "UNLIKE")
                }
                return false
            }
        },
        [momentId, ownerId, session.account.userId],
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
