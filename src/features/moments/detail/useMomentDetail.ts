import React from "react"

import type { MomentDetail } from "@/api/moment/moment.types"
import type { dataProps } from "@/components/moment/context/types"
import LanguageContext from "@/contexts/language"
import { asBoolean } from "@/contexts/Persisted/coerce"
import { useMomentQuery } from "@/queries/moment.get"

import { pickMomentUser, seedFromListItem, toMomentData } from "./moment-detail.adapters"

type MomentSource = readonly unknown[] | null | undefined

type UseMomentDetailProps = {
    /** Snowflake do momento. Trafega como string de ponta a ponta — nunca `Number()`. */
    momentId: string
    /**
     * Listas onde o momento pode já estar em memória, em ordem de prioridade: o feed, os
     * momentos persistidos do account, a grade do perfil. A primeira que tiver o id vence.
     */
    sources: readonly MomentSource[]
    /** Autor usado quando o item de lista não o traz — o perfil sendo visitado. */
    userFallback?: unknown
}

export type MomentDetailState = {
    /** Modelo normalizado da API. `undefined` enquanto não há semente nem resposta. */
    detail: MomentDetail | undefined
    /** Pronto para o `MomentContext`, ou `null` quando não há o que renderizar. */
    momentData: dataProps | null
    /** `true` quando a tela deve mostrar o placeholder no lugar do card. */
    isUnavailable: boolean
    /** Mensagem já traduzida para erro **definitivo**; `null` para transitório. */
    errorMessage: string | null
}

/**
 * Todo o caminho de "abrir um momento em tela cheia", num lugar só.
 *
 * As duas telas de detalhe (`/moment/[id]` e `/profile/moment/[momentId]`) faziam
 * exatamente esta sequência — achar a semente na lista de origem, buscar o detalhe, montar
 * o autor, adaptar ao contexto, decidir indisponibilidade e classificar o erro — em cópias
 * que já haviam divergido em cada um dos cinco passos. O que muda entre elas é só de onde
 * vem a semente e quem é o autor de fallback: são os dois parâmetros.
 */
export function useMomentDetail({
    momentId,
    sources,
    userFallback,
}: UseMomentDetailProps): MomentDetailState {
    const { t } = React.useContext(LanguageContext)

    /**
     * Semente **síncrona**, no primeiro render.
     *
     * Sem ela a tela renderiza `null` até o `GET` responder, e isso custa duas coisas ao
     * mesmo tempo: a transição de zoom do iOS mede o retângulo do `Link.AppleZoomTarget`
     * quando ela começa — sem filho montado não há alvo — e o player só nasce depois da
     * animação, que é o "vídeo parou no zoom".
     *
     * Quem navega para uma tela de detalhe quase sempre veio de uma lista que já tem o
     * momento em memória. Ler dali custa zero I/O.
     */
    /*
     * Sem `useMemo` de propósito. A busca é um `find` em listas curtas que **devolve uma
     * referência já existente** — não aloca nada, então a identidade de `seedRaw` se mantém
     * estável entre renders enquanto o item for o mesmo objeto, que é tudo de que as memos
     * abaixo precisam.
     *
     * A versão com memo dependia de `[momentId, ...sources]`, e uma lista de dependências
     * com spread muda de tamanho entre renders — o React não suporta isso, e é erro de
     * `react-hooks`. Tirar a memo resolve a causa em vez de silenciar a regra.
     */
    const seedRaw = (() => {
        if (!momentId) return null
        for (const source of sources) {
            if (!Array.isArray(source)) continue
            const found = source.find((item: any) => String(item?.id) === momentId)
            if (found) return found
        }
        return null
    })()

    const seed = React.useMemo(() => seedFromListItem(seedRaw), [seedRaw])
    const user = React.useMemo(() => pickMomentUser(seedRaw, userFallback), [seedRaw, userFallback])

    const { data: detail, error } = useMomentQuery({ momentId, seed })

    /**
     * O que não pode mudar de valor é `media`: o `MediaRenderVideo` reage a `uri`
     * reexibindo a thumbnail e reanexando a fonte no player, e o `Moment.Container` refaz a
     * resolução de cache. Como a semente e a resposta carregam a mesma URL, a revalidação
     * não toca no player — só nos números.
     */
    const momentData = React.useMemo(
        () =>
            detail
                ? toMomentData(detail, user, { isLiked: asBoolean((seedRaw as any)?.isLiked) })
                : null,
        [detail, user, seedRaw],
    )

    /**
     * Um `200` não significa conteúdo vivo: moments com soft delete e moments ainda em
     * processamento respondem normalmente, os últimos com `media` vazio (§7.2). Mídia
     * ausente é "indisponível", não "carregando".
     */
    const isUnavailable = !momentData || !detail?.media

    /**
     * `not-found` e `forbidden` são definitivos — sem botão de tentar de novo. O retry do
     * transitório já acontece dentro do `useMomentQuery`, então `unknown` não vira mensagem.
     *
     * Um moment público que volta `forbidden` pode não ser permissão: quando o perfil do
     * autor do comentário em destaque não é encontrado, o backend aborta a resposta inteira
     * (§7.3). Daí a mensagem não afirmar que o conteúdo é privado.
     */
    const errorMessage = React.useMemo(() => {
        if (!error || momentData) return null
        if (error.kind === "not-found") return t("This moment is no longer available")
        if (error.kind === "forbidden") return t("You don't have access to this moment")
        return null
    }, [error, momentData, t])

    return { detail, momentData, isUnavailable, errorMessage }
}
