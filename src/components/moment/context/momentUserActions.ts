import { MomentUserActionsProps } from "./types"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { apiRoutes } from "../../../services/Api"

export type InteractionType =
    | "LIKE"
    | "CLICK"
    | "UNLIKE"
    | "PARTIAL_VIEW"
    | "COMPLETE_VIEW"
    | "HIDE"
    | "UNHIDE"
    | "SHARE"
    | "COMMENT"
    | "REPORT"
    | "SHOW_LESS_OFTEN"
    | "LIKE_COMMENT"

export interface MomentUserActionsState extends MomentUserActionsProps {
    setShare: React.Dispatch<React.SetStateAction<boolean>>
    setClick: React.Dispatch<React.SetStateAction<boolean>>
    setComment: React.Dispatch<React.SetStateAction<boolean>>
    setLikeComment: React.Dispatch<React.SetStateAction<boolean>>
    setShowLessOften: React.Dispatch<React.SetStateAction<boolean>>
    setReport: React.Dispatch<React.SetStateAction<boolean>>
    setInitialLikedState: React.Dispatch<React.SetStateAction<boolean>>
    setPartialView: React.Dispatch<React.SetStateAction<boolean>>
    setCompleteView: React.Dispatch<React.SetStateAction<boolean>>
    setMomentUserActions: (momentUserActions: MomentUserActionsProps) => void
    exportMomentUserActions: () => MomentUserActionsProps
    handleLikePressedWithServerSync: ({ likedValue }: { likedValue?: boolean }) => void
    registerInteraction: (interactionType: InteractionType, data?: any) => Promise<void>
}

export function useMomentUserActions(momentId?: string): MomentUserActionsState {
    const { session } = React.useContext(PersistedContext)

    // Estados para interações
    const [like, setLike] = React.useState<boolean>(false)
    const [share, setShare] = React.useState<boolean>(false)
    const [click, setClick] = React.useState<boolean>(false)
    const [comment, setComment] = React.useState<boolean>(false)
    const [likeComment, setLikeComment] = React.useState<boolean>(false)
    const [showLessOften, setShowLessOften] = React.useState<boolean>(false)
    const [report, setReport] = React.useState<boolean>(false)
    const [initialLikedState, setInitialLikedState] = React.useState<boolean>(false)
    const [partialView, setPartialView] = React.useState<boolean>(false)
    const [completeView, setCompleteView] = React.useState<boolean>(false)

    // Função para enviar interação para o servidor
    const registerInteraction = React.useCallback(
        async (interactionType: InteractionType, data?: any) => {
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
                    case "LIKE":
                        await apiRoutes.moment.actions.like(baseParams)
                        break
                    case "LIKE_COMMENT":
                        await apiRoutes.moment.actions.likeComment(baseParams)
                        break
                    case "UNLIKE":
                        await apiRoutes.moment.actions.unlike(baseParams)
                        break
                    case "PARTIAL_VIEW":
                        await apiRoutes.moment.actions.partialView(baseParams)
                        break
                    case "COMPLETE_VIEW":
                        await apiRoutes.moment.actions.completeView(baseParams)
                        break
                    case "SHARE":
                        await apiRoutes.moment.actions.share(baseParams)
                        break
                    case "COMMENT":
                        await apiRoutes.moment.actions.comment(baseParams)
                        break
                    case "REPORT":
                        await apiRoutes.moment.actions.report(baseParams)
                        break
                    case "SHOW_LESS_OFTEN":
                        await apiRoutes.moment.actions.showLessOften(baseParams)
                        break
                    case "HIDE":
                        await apiRoutes.moment.author.hide(baseParams)
                        break
                    case "UNHIDE":
                        await apiRoutes.moment.author.unhide(baseParams)
                        break
                    default:
                        console.warn(`Tipo de interação não reconhecido: ${interactionType}`)
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
        [momentId, session.account.jwtToken]
    )

    const setPartialViewWithServerSync = React.useCallback(() => {
        if (!partialView) {
            setPartialView(true)
            registerInteraction("PARTIAL_VIEW")
        }
    }, [partialView, registerInteraction])

    const setCompleteViewWithServerSync = React.useCallback(() => {
        if (!completeView) {
            setCompleteView(true)
            // Envia view novamente para indicar visualização completa
            registerInteraction("COMPLETE_VIEW")
        }
    }, [completeView, registerInteraction])

    const setClickWithServerSync = React.useCallback(() => {
        if (!completeView) {
            setCompleteView(true)
            // Envia view novamente para indicar visualização completa
            registerInteraction("COMPLETE_VIEW")
        }
    }, [completeView, registerInteraction])

    const setCommentWithServerSync = React.useCallback(() => {
        if (!completeView) {
            setCompleteView(true)
            // Envia view novamente para indicar visualização completa
            registerInteraction("COMPLETE_VIEW")
        }
    }, [completeView, registerInteraction])

    const setLikeCommentWithServerSync = React.useCallback(() => {
        if (!completeView) {
            setCompleteView(true)
            // Envia view novamente para indicar visualização completa
            registerInteraction("COMPLETE_VIEW")
        }
    }, [completeView, registerInteraction])

    const setSharedWithServerSync = React.useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            const newValue = typeof value === "function" ? value(share) : value

            if (newValue && !share) {
                // Só envia se ainda não foi compartilhado
                registerInteraction("SHARE")
            }

            setShare(newValue)
        },
        [share, registerInteraction]
    )

    const setReportedWithServerSync = React.useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            const newValue = typeof value === "function" ? value(report) : value

            if (newValue && !report) {
                // Só envia se ainda não foi reportado
                registerInteraction("REPORT")
            }

            setReport(newValue)
        },
        [report, registerInteraction]
    )

    const setShowLessOftenWithServerSync = React.useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            const newValue = typeof value === "function" ? value(showLessOften) : value

            if (newValue && !showLessOften) {
                // Só envia se ainda não foi mostrado menos frequentemente
                registerInteraction("SHOW_LESS_OFTEN")
            }

            setShowLessOften(newValue)
        },
        [showLessOften, registerInteraction]
    )

    function exportMomentUserActions(): MomentUserActionsProps {
        return {
            like,
            share,
            click,
            comment,
            likeComment,
            showLessOften,
            report,
            initialLikedState,
            partialView,
            completeView,
        }
    }

    function handleLikePressedWithServerSync({ likedValue }: { likedValue?: boolean } = {}) {
        const newLikedValue = likedValue !== undefined ? likedValue : !like

        if (newLikedValue !== like) {
            setLike(newLikedValue)

            // Envia automaticamente para o servidor
            const interactionType = newLikedValue ? "LIKE" : "UNLIKE"
            registerInteraction(interactionType)
        }
    }

    function setMomentUserActions(momentUserActions: MomentUserActionsProps) {
        setLike(momentUserActions.like)
        setShare(momentUserActions.share)
        setClick(momentUserActions.click)
        setComment(momentUserActions.comment)
        setComment(momentUserActions.comment)
        setLikeComment(momentUserActions.likeComment)
        setShowLessOften(momentUserActions.showLessOften)
        setReport(momentUserActions.report)
        setInitialLikedState(momentUserActions.like)
        setPartialView(momentUserActions.partialView || false)
        setCompleteView(momentUserActions.completeView || false)
    }

    return {
        like,
        share,
        click,
        comment,
        likeComment,
        showLessOften,
        report,
        completeView,
        partialView,
        initialLikedState,
        setShare: setSharedWithServerSync,
        setClick: setClickWithServerSync,
        setComment: setCommentWithServerSync,
        setLikeComment: setLikeCommentWithServerSync,
        setShowLessOften: setShowLessOftenWithServerSync,
        setReport: setReportedWithServerSync,
        setPartialView: setPartialViewWithServerSync,
        setCompleteView: setCompleteViewWithServerSync,
        setInitialLikedState,
        setMomentUserActions,
        exportMomentUserActions,
        handleLikePressedWithServerSync,
        registerInteraction,
    }
}
