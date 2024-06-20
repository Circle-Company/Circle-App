import React from "react"
import { Pressable, View } from "react-native"
import { CommentsRenderCommentProps } from "../comments-types"
import { UserShow } from "../../user_show"
import { Text } from "../../Themed"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import HeartIcon from '../../../assets/icons/svgs/heart_2.svg'
import HeartIconOutline from '../../../assets/icons/svgs/heart_2-outline.svg'
import { timeDifferenceConverter } from "../../../algorithms/dateConversor"
import MomentContext from "../../moment/context"
import api from "../../../services/api"
import PersistedContext from "../../../contexts/Persisted"

export default function render_comment ({comment, index, preview}: CommentsRenderCommentProps) {
    const { session } = React.useContext(PersistedContext)
    const { momentUserActions, momentData} = React.useContext(MomentContext)


    const [like, setLike] = React.useState(false)
    
    const container:any = {
        flexDirection: 'row',
        marginTop: preview? sizes.margins["1sm"]*0.8 : sizes.margins["1md"],
        marginBottom:  preview? sizes.margins["1sm"]*0.5 : sizes.margins["2sm"],
    }
    const container_left:any = {
        left: -2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: sizes.margins["1sm"]/2,
    }
    const container_center:any = {
        top: preview? 0 : -4,
        left: -2,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    }
    const container_right: any = {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: sizes.margins["3sm"],
        paddingTop: sizes.margins["2sm"] * 0.7,
    }
    const like_container: any = {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizes.paddings["1sm"]/5
    }
    const container_center_top:any = {
        flexDirection: 'row',
        marginBottom: sizes.margins["1sm"]*0.5
    }
    const content_style = {
        marginTop: preview? -2 : 0,
        fontSize: preview? fonts.size.body*0.9 : fonts.size.body,
        fontFamily: 'RedHatDisplay-Medium',

    }
    const date_style = {
        marginLeft: 5,
        fontSize: preview? fonts.size.caption1 : fonts.size.caption1*1.1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled
    }

    const likesNum = like? comment.statistics.total_likes_num + 1 : comment.statistics.total_likes_num 
    const likeLabel = likesNum == 1? 'like' : 'likes'
    
    async function handleLikePress() {
        if(like){
            momentUserActions.setLikeComment(false)
            setLike(false)
            await api.post('/moment/unlike-comment', {
                user_id: session.user.id,
                comment_id: comment.id
            }).catch((error) => console.log(error))
        } else {
            momentUserActions.setLikeComment(true)
            setLike(true)
            await api.post('/moment/like-comment', {
                user_id: session.user.id,
                comment_id: comment.id
            }).catch((error) => console.log(error))
        }
    }

    return (
        <View style={container}>
            <View style={container_left}>
                <UserShow.Root data={comment.user}>
                <UserShow.ProfilePicture
                    pictureDimensions={{width: preview? 28: 32, height:preview? 28: 32}}
                    displayOnMoment={false}
                />
                </UserShow.Root>
            </View>
            <View style={container_center}>
                <View style={container_center_top}>
                    <UserShow.Root data={comment.user}>
                        <UserShow.Username
                            displayOnMoment={false}
                            truncatedSize={18}
                            color={ColorTheme().textDisabled}
                            fontFamily={fonts.family.Medium}
                            fontSize={preview? fonts.size.caption1 : fonts.size.caption1*1.1}
                            margin={0}
                        />
                    </UserShow.Root>    
                    <Text style={date_style}>•</Text>
                    <Text style={date_style}>{timeDifferenceConverter({date: String(comment.created_at)})}</Text>
                    <Text style={date_style}>{likesNum>0? '•': null}</Text>
                    <Text style={date_style}>{likesNum>0? likesNum +' ' + likeLabel : null}</Text>           
                </View>
                <Text style={content_style}>{comment.content}</Text>                    
            </View>
            <Pressable onPress={handleLikePress} style={container_right}>
                <View style={like_container}>
                    {like?
                        <HeartIcon fill={ColorTheme().like.toString()} width={15} height={15}/> :
                        <HeartIconOutline fill={`${ColorTheme().textDisabled}60`} width={15} height={15}/>
                    }                    
                </View>

            </Pressable>

        </View>
    )
}