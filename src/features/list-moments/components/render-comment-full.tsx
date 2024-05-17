import React from 'react'
import { Comments } from '../../../components/comment'
import MomentContext from '../../../components/moment/context'

export default function render_comment_full () {
    const { momentData, momentOptions } = React.useContext(MomentContext)
    return (
        <Comments.MainRoot data={momentData.comments}>
            <Comments.Container focused={momentOptions.isFocused}>
                <Comments.TopRoot>
                    <Comments.TopLeftRoot>
                        <Comments.HeaderLeft/>
                    </Comments.TopLeftRoot>
                </Comments.TopRoot>
                <Comments.CenterRoot>
                    <Comments.ListComments preview={false}/>                    
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>      
    )
}