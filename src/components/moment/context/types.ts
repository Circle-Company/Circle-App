import { Moment } from "@/contexts/Feed/types"
import { CommentsReciveDataProps } from "../../comment/comments-types"
import { MomentOptionsState } from "./moment.options"
import { MomentVideoState } from "./moment.video"
import { MomentActionsState } from "./moment.actions"

export type MomentMetricsProps = {
    totalViews: number
    totalLikes: number
    totalComments: number
}

export type MomentOptionsProps = {
    enableReport: boolean
    enableLike: boolean
    enableComment: boolean
    enableContentWarning: boolean
    enableWatch: boolean
    isHidden: boolean
    isFeed: boolean
    isFocused: boolean
    showReportModal: boolean
}

export type actionsProps = {
    like: boolean
    watch: number
    comment: boolean
    initialLikedState: boolean
}

export type InteractionPayloadMap = {
    LIKE: { momentId: string }
    UNLIKE: { momentId: string }
    WATCH: { momentId: string; watchTime: number }
    COMMENT: {
        momentId: string
        content: string
        mentions?: string[]
        parentId?: string
    }
    EXCLUDE: { momentId: string }
}

export type InteractionPayload<T extends "LIKE" | "UNLIKE" | "WATCH" | "COMMENT" | "EXCLUDE"> =
    T extends "LIKE"
        ? InteractionPayloadMap["LIKE"]
        : T extends "UNLIKE"
          ? InteractionPayloadMap["UNLIKE"]
          : T extends "WATCH"
            ? InteractionPayloadMap["WATCH"]
            : T extends "COMMENT"
              ? InteractionPayloadMap["COMMENT"]
              : T extends "EXCLUDE"
                ? InteractionPayloadMap["EXCLUDE"]
                : never

export interface sizeProps {
    width: number
    height: number
    paddingTop?: number
    padding: number
    borderRadius: number
    borderTopLeftRadius?: number
    borderTopRightRadius?: number
    borderBottomLeftRadius?: number
    borderBottomRightRadius?: number
}

export interface MomentVideoProps {
    currentTime: number
    duration: number
    isPaused: boolean
    isMuted: boolean
    shadow?: {
        top?: boolean
        bottom?: boolean
    }
}

/**
 * O que o `MomentProvider` precisa para renderizar.
 *
 * É o `Moment` do feed. Os dois estavam escritos campo a campo em arquivos diferentes,
 * com exatamente a mesma forma — e o `MomentProvider` repassa o que recebe para o
 * `useData`, que já é tipado como `Moment`. Duas declarações da mesma coisa só criam a
 * chance de divergirem sem ninguém perceber; derivar de uma delas fecha isso.
 *
 * O único acréscimo são os campos de relação que o `UserShow.Root` consome
 * (`userReciveDataProps`): assim a tela monta **um** objeto que serve ao mesmo tempo o
 * contexto do momento e o cabeçalho do autor, sem cast no meio.
 */
export interface dataProps extends Omit<Moment, "user"> {
    user: Moment["user"] & {
        verified?: boolean
        youFollow?: boolean
        followYou?: boolean
    }
}

export interface dataReturnsProps extends dataProps {
    comments: CommentsReciveDataProps
    getComments: ({ page, pageSize }: { page: number; pageSize: number }) => Promise<void>
}

export type MomentProviderProps = {
    isFeed: boolean
    isFocused: boolean
    size?: sizeProps
    data: dataProps
    shadow?: MomentVideoProps["shadow"]
    children: React.ReactNode
}

export type MomentContextsData = {
    data: dataReturnsProps
    size: sizeProps
    options: MomentOptionsState
    actions: MomentActionsState
    video: MomentVideoState
}
