import { LanguagesCodesType } from "../../../locales/LanguageTypes"
import { CommentsReciveDataProps } from "../../comment/comments-types"
import { userReciveDataProps } from "../../user_show/user_show-types"
import { MomentOptionsState } from "./momentOptions"

export type MomentDataProps = {
    id: Number
    user: userReciveDataProps
    description: String
    midia: MomentMidiaProps,
    comments: CommentsReciveDataProps
    statistics: MomentStatisticsProps
    tags: TagProps[] 
    language: LanguagesCodesType
    created_at: String
}

export type ExportMomentDataProps = {
    id: number
    userId: number
    tags: TagProps[]
    type: "IMAGE" | "VIDEO",
    language: LanguagesCodesType,
    duration: number
}

export type MomentDataReturnsProps = {
    id: Number
    user: userReciveDataProps
    description: String
    midia: MomentMidiaProps,
    comments: CommentsReciveDataProps
    statistics: MomentStatisticsProps
    tags: TagProps[] 
    language: LanguagesCodesType
    created_at: String
    getComments: ({page, pageSize}: {page: number, pageSize: number}) => Promise<void>
    getStatistics: () => Promise<void>
    getTags: () => Promise<void>
}

export type MomentMidiaProps = {
    content_type: 'IMAGE' | 'VIDEO'
    fullhd_resolution?: String
    nhd_resolution?: String
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
    id: number,
    title: string
} 

export type MomentOptionsProps = {
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
    setShared: (value: boolean) => Promise<void>
    setViewed: (value: boolean) => Promise<void>
    setClickIntoMoment: (value: boolean) => Promise<void>
    setWatchTime: (value: number) => Promise<void>
    setClickProfile: (value: boolean) => Promise<void>
    setCommented: (value: boolean) => Promise<void>
    setLikeComment: (value: boolean) => Promise<void>
    setSkipped: (value: boolean) => Promise<void>
    setShowLessOften: (value: boolean) => Promise<void>
    setReported: (value: boolean) => Promise<void>

    setMomentUserActions: (momentUserActions: MomentUserActionsProps) => void
    injectInteractionsToList: () => void
    handleLikeButtonPressed: ({likedValue}: {likedValue?: boolean}) => void
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

export type MomentContextsData = {
    momentData: MomentDataReturnsProps
    momentSize: MomentSizeProps
    momentOptions: MomentOptionsState
    momentUserActions: MomentUserActionsReturnsProps
}