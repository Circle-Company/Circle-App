import { CommentsReciveDataProps } from "../../comment/comments-types"
import { LanguagesCodesType } from "../../../locales/LanguageTypes"
import { MomentOptionsState } from "./momentOptions"
import { MomentVideoState } from "./momentVideo"
import { userReciveDataProps } from "../../user_show/user_show-types"

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

export type MomentProviderProps = {
    isFeed: boolean
    isFocused: boolean
    momentSize?: MomentSizeProps
    momentData: MomentDataProps
    children: React.ReactNode
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
    liked: boolean
    shared: boolean
    viewed: boolean
    clickIntoMoment: boolean
    watchTime: number
    clickProfile: boolean
    commented: boolean
    likeComment: boolean
    skipped: boolean
    showLessOften: boolean
    reported: boolean
    initialLikedState: boolean
}

export type MomentUserActionsReturnsProps = {
    liked: boolean
    shared: boolean
    viewed: boolean
    clickIntoMoment: boolean
    watchTime: number
    clickProfile: boolean
    commented: boolean
    likeComment: boolean
    skipped: boolean
    showLessOften: boolean
    reported: boolean
    initialLikedState: boolean

    setShared: React.Dispatch<React.SetStateAction<boolean>>
    setViewed: React.Dispatch<React.SetStateAction<boolean>>
    setClickIntoMoment: React.Dispatch<React.SetStateAction<boolean>>
    setWatchTime: React.Dispatch<React.SetStateAction<number>>
    setClickProfile: React.Dispatch<React.SetStateAction<boolean>>
    setCommented: React.Dispatch<React.SetStateAction<boolean>>
    setLikeComment: React.Dispatch<React.SetStateAction<boolean>>
    setSkipped: React.Dispatch<React.SetStateAction<boolean>>
    setShowLessOften: React.Dispatch<React.SetStateAction<boolean>>
    setReported: React.Dispatch<React.SetStateAction<boolean>>
    setInitialLikedState: React.Dispatch<React.SetStateAction<boolean>>

    setMomentUserActions: (momentUserActions: MomentUserActionsProps) => void
    injectInteractionsToList: () => void
    handleLikeButtonPressed: ({ likedValue }: { likedValue?: boolean }) => void
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

export type MomentContextsData = {
    momentData: MomentDataReturnsProps
    momentSize: MomentSizeProps
    momentOptions: MomentOptionsState
    momentUserActions: MomentUserActionsReturnsProps
    momentVideo: MomentVideoState
}
