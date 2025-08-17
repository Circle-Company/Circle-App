import { Comments } from "@/components/comment"
import MomentContext from "@/components/moment/context"
import React from "react"

export default function RenderCommentFull() {
    const { momentData, momentOptions } = React.useContext(MomentContext)
    return (
        <Comments.MainRoot data={momentData.comments} preview={false}>
            <Comments.Container focused={momentOptions.isFocused}>
                <Comments.CenterRoot>
                    <Comments.ListComments />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}
