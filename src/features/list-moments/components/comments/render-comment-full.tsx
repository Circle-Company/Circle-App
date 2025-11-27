import { Comments } from "../../../../components/comment"
import MomentContext from "../../../../components/moment/context"
import React from "react"

export default function RenderCommentFull() {
    const { momentData, momentOptions } = React.useContext(MomentContext)
    const comments = Array.isArray(momentData.comments) ? momentData.comments : []
    return (
        <Comments.MainRoot data={comments} preview={false}>
            <Comments.Container focused={momentOptions.isFocused}>
                <Comments.CenterRoot>
                    <Comments.ListComments comment={comments} />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}
