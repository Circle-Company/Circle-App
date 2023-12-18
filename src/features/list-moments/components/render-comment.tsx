import React from 'react'
import sizes from '../../../layout/constants/sizes'
import { Moment } from '../../../components/moment'
import { UserShow } from '../../../components/user_show'
import { Comments } from '../../../components/comment'
import { momentReciveDataProps } from '../../../components/moment/moment-types'
import { Text } from '../../../components/Themed'

import ViewMorebutton from '../../../components/buttons/view_more'
type renderCommentProps = {
    moment: momentReciveDataProps,
    focused: boolean,
}

export default function render_comment ({moment, focused}: renderCommentProps) {
    return (
        <Comments.MainRoot data={moment.comments}>
            <Comments.Container focused={focused}>
                <Comments.TopRoot>
                    <Comments.TopLeftRoot>
                        <Comments.HeaderLeft/>
                    </Comments.TopLeftRoot>
                    <Comments.TopRightRoot>
                        <ViewMorebutton navigateTo='' text='View All'/>
                    </Comments.TopRightRoot>
                    
                </Comments.TopRoot>
                <Comments.CenterRoot>
                    <Comments.ListComments/>                    
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>      
    )
}