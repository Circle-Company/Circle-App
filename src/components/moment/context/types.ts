import { LanguagesCodesType } from "../../../locales/LanguageTypes"
import { CommentsReciveDataProps } from "../../comment/comments-types"
import { userReciveDataProps } from "../../user_show/user_show-types"
import { MomentOptionsState } from "./momentOptions"
import { MomentVideoState } from "./momentVideo"

export type MomentMidiaProps = {
    content_type: "IMAGE" | "VIDEO"
    fullhd_resolution?: string
    nhd_resolution?: string
    nhd_thumbnail?: string
}

export type MomentStatisticsProps = {
    total_likes_num: number
    total_shares_num: number
    total_views_num: number
    total_comments_num: number
}

export type TagProps = {
    id: number
    title: string
}

export type MomentOptionsProps = {
    enableReport: boolean
    enableLikeButton: boolean
    enableAnalyticsView: boolean
    enableStoreActions: boolean
    enableTranslation: boolean
    enableModeration: boolean
    isFeed: boolean
    isFocused: boolean
}

export type MomentUserActionsProps = {
    like: boolean
    share: boolean
    click: boolean
    comment: boolean
    likeComment: boolean
    showLessOften: boolean
    report: boolean
    initialLikedState: boolean
    partialView?: boolean
    completeView?: boolean
}

export type MomentSizeProps = {
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

export type MomentVideoProps = {
    currentTime: number
    duration: number
    isPaused: boolean
    isMuted: boolean
}

export type MomentDataProps = {
    id: string
    user: userReciveDataProps
    description: string
    midia: MomentMidiaProps
    comments: CommentsReciveDataProps
    statistics: MomentStatisticsProps
    tags: TagProps[]
    language: LanguagesCodesType
    created_at: string
    is_liked: boolean
}

export type ExportMomentDataProps = {
    id: string
    userId: string
    tags: TagProps[]
    type: "IMAGE" | "VIDEO"
    language: LanguagesCodesType
    duration: number
}

export type MomentDataReturnsProps = {
    id: string
    user: userReciveDataProps
    description: string
    midia: MomentMidiaProps
    comments: CommentsReciveDataProps
    statistics: MomentStatisticsProps
    tags: TagProps[]
    language: LanguagesCodesType
    created_at: string
    getComments: ({ page, pageSize }: { page: number; pageSize: number }) => Promise<void>
    getStatistics: () => Promise<void>
    getTags: () => Promise<void>
}

export type MomentProviderProps = {
    isFeed: boolean
    isFocused: boolean
    momentSize?: MomentSizeProps
    momentData: MomentDataProps
    children: React.ReactNode
}

export type MomentUserActionsReturnsProps = {
    like: boolean
    share: boolean
    click: boolean
    comment: boolean
    likeComment: boolean
    showLessOften: boolean
    report: boolean
    initialLikedState: boolean
    shortView?: boolean
    longView?: boolean
    lastError?: string | null
    isLoading?: boolean

    setShared: React.Dispatch<React.SetStateAction<boolean>>
    setClickIntoMoment: React.Dispatch<React.SetStateAction<boolean>>
    setWatchTime: React.Dispatch<React.SetStateAction<number>>
    setClickProfile: React.Dispatch<React.SetStateAction<boolean>>
    setCommented: React.Dispatch<React.SetStateAction<boolean>>
    setLikeComment: React.Dispatch<React.SetStateAction<boolean>>
    setSkipped: React.Dispatch<React.SetStateAction<boolean>>
    setShowLessOften: React.Dispatch<React.SetStateAction<boolean>>
    setReported: React.Dispatch<React.SetStateAction<boolean>>
    setInitialLikedState: React.Dispatch<React.SetStateAction<boolean>>
    setShortView: React.Dispatch<React.SetStateAction<boolean>>
    setLongView: React.Dispatch<React.SetStateAction<boolean>>

    setMomentUserActions: (momentUserActions: MomentUserActionsProps) => void
    injectInteractionsToList: () => void
    handleLikeButtonPressed: ({ likedValue }: { likedValue?: boolean }) => void
    sendInteractionToServer: (interactionType: string, data?: any) => Promise<void>
    resetViewState: () => void
    handleShortView: () => void
    handleLongView: () => void
    updateWatchTime: (newWatchTime: number) => void
}

export type MomentContextsData = {
    momentData: MomentDataReturnsProps
    momentSize: MomentSizeProps
    momentOptions: MomentOptionsState
    momentUserActions: MomentUserActionsReturnsProps
    momentVideo: MomentVideoState
}
