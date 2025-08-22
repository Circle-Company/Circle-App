import React from "react"
import { userReciveDataProps } from "../user_show/user_show-types"

export type CommentObject = {
    id: string
    user: userReciveDataProps
    content: string
    created_at: string
    statistics: {
        total_likes_num: number
    }
    is_liked: boolean
}

export type CommentsReciveDataProps = Array<CommentObject>

export type CommentsMainRootProps = {
    data: CommentsReciveDataProps
    preview?: boolean
    children: React.ReactNode
}
export type CommentsContainerProps = {
    children: React.ReactNode
    focused?: boolean
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
    comment: CommentObject
    preview: boolean
    index: number
}
export type CommentsHeaderLeftProps = {
    children: React.ReactNode
}
export type CommentsInputProps = {
    placeholder?: string
    backgroundColor?: string
    color?: string
    preview?: boolean
    autoFocus: boolean
}
export type CommentsListCommentsProps = {
    preview: boolean
}
