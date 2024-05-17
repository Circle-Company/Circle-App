import React from "react"
import { userReciveDataProps } from "../user_show/user_show-types"
import { MidiaReciveDataProps } from "../midia_render/midia_render-types"


export type CommentObject = {
    id: number
    user: userReciveDataProps
    content: String,
    created_at: String,
    statistics: {
        total_likes_num: number
    }
}

export type CommentsReciveDataProps = Array<CommentObject>

export type CommentsMainRootProps = {
    data: CommentsReciveDataProps
    children: React.ReactNode
}
export type CommentsContainerProps = {
    children: React.ReactNode,
    focused?: boolean,
}
export type CommentsTopRootProps = {
    children: React.ReactNode
}
export type CommentsTopLeftRootProps = {
    children: React.ReactNode
}
export type CommentsTopRightRootProps = {
    children: React.ReactNode
}
export type CommentsCenterRootProps = {
    children: React.ReactNode
}
export type CommentsRenderCommentProps = {
    comment: CommentObject,
    preview: boolean,
    index: number
}
export type CommentsHeaderLeftProps = {
}
export type CommentsInputProps = {
    placeholder?: string,
    backgroundColor?: string,
    color?: string,
    preview?: boolean,
    autoFocus?: boolean
}
export type CommentsListCommentsProps = {
    preview: boolean
}
