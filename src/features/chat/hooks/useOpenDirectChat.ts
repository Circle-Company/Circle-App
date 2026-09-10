import React from "react"
import { router } from "expo-router"

import { apiRoutes } from "@/api"
import { ChatUnavailableError, NotFriendsError } from "@/api/chat/chat"
import LanguageContext from "@/contexts/language"
import { useToast } from "@/contexts/Toast"

export type OpenDirectChat = {
    /** Uma abertura em curso — para desabilitar o botão que a disparou. */
    opening: boolean
    open: (targetUserId: string) => void
}

/**
 * Abre a conversa direta com alguém.
 *
 * **Passa sempre pelo nosso backend, mesmo quando a conversa já existe.** É ele que valida a
 * amizade e cria o canal na primeira vez; o app nunca cria canal pelo SDK, porque isso
 * pularia a validação e abriria conversa entre quem não é amigo.
 *
 * O id do canal é determinístico (`dm_<menorId>_<maiorId>`, ids comparados como string), o
 * que tentaria a navegação otimista — mas o endpoint continua obrigatório, então não há o que
 * ganhar em adivinhá-lo.
 */
export function useOpenDirectChat(): OpenDirectChat {
    const { t } = React.useContext(LanguageContext)
    const toast = useToast()
    const [opening, setOpening] = React.useState(false)

    const open = React.useCallback(
        (targetUserId: string) => {
            if (opening) return
            setOpening(true)

            apiRoutes.chat
                .openDirectChannel({ targetUserId: String(targetUserId) })
                .then(({ channelId }) => {
                    router.push(`/(tabs)/chat/${encodeURIComponent(channelId)}`)
                })
                .catch((error: unknown) => {
                    // Cada erro tem uma frase própria porque cada um pede uma ação diferente
                    // de quem lê: refazer a amizade, esperar, ou tentar de novo.
                    if (error instanceof NotFriendsError) {
                        toast.error(t("You are no longer friends."))
                    } else if (error instanceof ChatUnavailableError) {
                        toast.error(t("Chat is unavailable right now."))
                    } else {
                        toast.error(t("It was not possible to open the conversation."))
                    }
                })
                .finally(() => setOpening(false))
        },
        [opening, t, toast],
    )

    return { opening, open }
}
