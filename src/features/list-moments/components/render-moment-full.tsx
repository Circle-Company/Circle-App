import React from 'react'
import sizes from '../../../layout/constants/sizes'
import { Moment } from '../../../components/moment'
import { UserShow } from '../../../components/user_show'
import { Comments } from '../../../components/comment'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import { ScrollView, View} from 'react-native'
import { Text } from '../../../components/Themed'
import fonts from '../../../layout/constants/fonts'
import MomentContext from '../../../components/moment/context'
import RenderTagsList from './render-tags-list'
import AuthContext from '../../../contexts/auth'
import { Loading } from '../../../components/loading'
import { MomentDataProps } from '../../../components/moment/context/types'
import RenderCommentFull from './render-comment-full'

type renderMomentProps = {
    momentData: MomentDataProps
    isFocused: boolean
    fromFeed: boolean
    fromAccount: boolean
}

export default function render_moment_full ({momentData, isFocused, fromFeed, fromAccount}: renderMomentProps) {
    const { user } = React.useContext(AuthContext)
    const {} = React.useContext(MomentContext)
    const [ loading, setLoading ] = React.useState(false)

    let userDataRender: any

    if(momentData.user) {
        if(momentData.user?.id == user.id) {
            userDataRender = user
            fromAccount = true
        } else {
            userDataRender = momentData.user
            fromAccount = false
        }
    } else {
        userDataRender = user
        fromAccount = true
    }
    
    const image_container: any = {
        backgroundColor: colors.gray.black,
        borderBottomLeftRadius: sizes.moment.full.borderBottomLeftRadius,
        borderBottomRightRadius: sizes.moment.full.borderBottomRightRadius
    }

    const bottom_container: any = {
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings['2sm'],
        paddingTop: sizes.paddings['2sm'],
        paddingBottom: sizes.paddings['1sm'],
        borderBottomWidth: 1,
        borderColor: ColorTheme().backgroundDisabled
    }

    const descriptionStyle: any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        flexDirection: 'row',
        justifyContent: 'flex-start', // Ajuste para que o texto comece do início
    }

    const informations_container: any = {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: sizes.paddings['2sm'],
        paddingBottom: sizes.paddings['1sm'] * 0.3,
    }
    const description_container: any = {
        margin: sizes.margins["1sm"],
        marginBottom: sizes.margins['1sm']*0.7
    }

    const in_moment_bottom_container: any = {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    }

    const in_moment_button_left_container: any = {
        flex: 1,
        alignItems: 'flex-end',
        flexDirection: 'row',
        marginRight: sizes.margins['2sm']
    }

    if(loading) return <Loading.Container><Loading.ActivityIndicator/></Loading.Container>

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <Moment.Root.Main momentData={momentData} isFeed={fromFeed} isFocused={true} sizes={{...sizes.moment.full, width: sizes.screens.width}}>
                <View style={image_container}>
                    <Moment.Container contentRender={momentData.midia}>
                        <Moment.Root.Center/>
                        <Moment.Root.Bottom>
                            <Comments.MainRoot data={momentData.comments}>
                        </Comments.MainRoot>
                                 
                            <View style={in_moment_bottom_container}>
                                <View style={in_moment_button_left_container}>
                                    <UserShow.Root data={userDataRender}>
                                        <UserShow.ProfilePicture pictureDimensions={{width: 30, height: 30}}/>
                                        <UserShow.Username/>
                                        {!fromAccount &&
                                            <UserShow.FollowButton isFollowing={false} displayOnMoment={true}/>
                                        }
                                        
                                    </UserShow.Root>
                                </View>
                                {!fromAccount &&
                                    <Moment.LikeButton
                                        isLiked={false}
                                        paddingHorizontal={0}
                                        margin={0}
                                    />                                       
                                }
                            </View>
                        </Moment.Root.Bottom>
                    </Moment.Container>                       
                </View>

                <View style={bottom_container}>
                    <View style={description_container}>
                        <Text style={descriptionStyle}>{momentData.description}</Text>  
                        <View style={informations_container}>
                            <Moment.Date color={ColorTheme().text.toString()} paddingHorizontal={0}/>
                            {momentData.statistics &&
                                <>
                                    <View style={{marginLeft: sizes.margins['1md']}}>
                                        <Moment.Full.Views views={momentData.statistics.total_views_num}/>
                                    </View>

                                    <View style={{marginLeft: sizes.margins['1md']}}>
                                        <Moment.Full.Comments comments={momentData.statistics.total_comments_num}/>
                                    </View>
                                    {fromAccount &&
                                        <View style={{marginLeft: sizes.margins['1md']}}>
                                            <Moment.Full.Shares shares={momentData.statistics.total_shares_num}/>
                                        </View>
                                    }              
                                </> 
                            }                            
                        </View>
                    </View>             
                    <RenderTagsList/>
                </View>
                <RenderCommentFull/>
            </Moment.Root.Main>    
        </ScrollView>

    )
}