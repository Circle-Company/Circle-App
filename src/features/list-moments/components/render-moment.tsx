import React from 'react'
import sizes from '../../../layout/constants/sizes'
import { Moment } from '../../../components/moment'
import { UserShow } from '../../../components/user_show'
import { Comments } from '../../../components/comment'
import { momentReciveDataProps } from '../../../components/moment/moment-types'
import RenderComment from './render-comment'
import { truncated } from '../../../algorithms/processText'
import { MomentActions } from '../../../components/moment/moment-actions'

type renderMomentProps = {
    moment: momentReciveDataProps,
    focused: boolean,
    viewed: boolean
}

export default function render_moment ({moment, focused, viewed}: renderMomentProps) {
    
    if(viewed) MomentActions.View({moment_id: Number(moment.id)})
    return (
        <Moment.MainRoot data={moment} sizes={sizes.moment.standart}>
            <Moment.Container contentRender={moment.midia} focused={focused}>
            <Moment.TopRoot>
                <Moment.TopLeftRoot>
                <UserShow.Root data={moment.user}>
                    <UserShow.ProfilePicture pictureDimensions={{width: 30, height: 30}}/>
                    <UserShow.Username truncatedSize={8}/>                        
                    <UserShow.FollowButton isFollowing={false}/>
                </UserShow.Root>          
                </Moment.TopLeftRoot>  
                <Moment.TopRightRoot>
                <Moment.LikeButton isLiked={false}/>
                </Moment.TopRightRoot> 
            </Moment.TopRoot>  

            <Moment.CenterRoot>
                <Moment.Description/>
            </Moment.CenterRoot>
               
            <Moment.BottomRoot>
                <Comments.MainRoot data={moment.comments}>
                    <Comments.Input placeholder={`react to @${truncated({text:moment.user.username, size: 20})}`}/>
                </Comments.MainRoot>
            </Moment.BottomRoot>
            </Moment.Container>

            <RenderComment moment={moment} focused={focused}/>
        </Moment.MainRoot>
    )
}