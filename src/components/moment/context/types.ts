import { CommentObject, CommentsReciveDataProps } from "../../comment/comments-types"
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
    LIKE: { momentId: string; authorizationToken: string }
    UNLIKE: { momentId: string; authorizationToken: string }
    WATCH: { momentId: string; authorizationToken: string; watchTime: number }
    COMMENT: {
        momentId: string
        authorizationToken: string
        content: string
        mentions?: string[]
        parentId?: string
    }
    EXCLUDE: { momentId: string; authorizationToken: string }
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

export interface dataProps {
    id: string
    user: {
        id: string
        username: string
        profilePicture: string
    }
    media: string
    thumbnail: string
    duration: number
    size: string
    hasAudio: boolean
    description: string
    ageRestriction: boolean
    contentWarning: boolean
    metrics: MomentMetricsProps
    publishedAt: string
    topComment?: CommentObject
    isLiked?: boolean
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
