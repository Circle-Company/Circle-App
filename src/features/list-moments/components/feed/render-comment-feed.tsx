import { Animated, Text, TextStyle, View, ViewStyle } from "react-native"

import AddIcon from "@/assets/icons/svgs/plus_circle-outline.svg"
import ColorTheme from "@/layout/constants/colors"
import { CommentObject } from "@/components/comment/comments-types"
import { Comments } from "@/components/comment"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/Preferences/language"
import { MomentProps } from "@/contexts/Feed/types"
import React from "react"
import ViewMorebutton from "@/components/buttons/view_more"

type renderCommentFeedProps = {
    moment: MomentProps
    focused: boolean
}

export default function RenderCommentFeed({ moment, focused }: renderCommentFeedProps) {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible } =
        React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))
    
    React.useEffect(() => {
        if (focused) {
            Animated.timing(animatedOpacityValue, {
                toValue: commentEnabled ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            }).start()
            if (!commentEnabled) {
                Animated.timing(animatedOpacityValue, {
                    delay: 0,
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start()
            }
        } else {
            // Quando não está focado, esconder os comentários
            Animated.timing(animatedOpacityValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start()
        }
    }, [commentEnabled, focused, animatedOpacityValue])

    // Se não está focado, não renderizar nada
    if (!focused) {
        return null
    }

    const animated_header_container: ViewStyle = {
        opacity: animatedOpacityValue,
    }

    const iconStyle = { top: 0.6 }

    const commentCountStyle: TextStyle = {
        fontSize: 12, 
        color: ColorTheme().textDisabled,
        fontFamily: "RedHatDisplay-Medium"
    }

    const viewMoreContainerStyle: ViewStyle = {
        justifyContent: "center", 
        alignItems: "center", 
        marginTop: 8
    }

    const viewMoreTextStyle: TextStyle = {
        fontSize: 12, 
        color: ColorTheme().textDisabled,
        fontFamily: "RedHatDisplay-Medium"
    }

    function handlePress() {
        if (commentEnabled) setCommentEnabled(false)
        else setCommentEnabled(true)
        setKeyboardVisible(true)
    }

    // Adaptar os dados do feed para o formato esperado pelo componente Comments
    const commentsData: CommentObject[] = moment.lastComment ? [{
        id: moment.lastComment.id,
        user: {
            id: String(moment.lastComment.user.id),
            username: moment.lastComment.user.username,
            verifyed: moment.lastComment.user.verifyed,
            profile_picture: {
                small_resolution: moment.lastComment.user.profile_picture.small_resolution,
                tiny_resolution: moment.lastComment.user.profile_picture.tiny_resolution
            },
            you_follow: moment.lastComment.user.isFollowing
        },
        content: moment.lastComment.content,
        created_at: moment.lastComment.created_at,
        statistics: moment.lastComment.statistics,
        is_liked: false
    }] : []

    const commentsCount = moment.comments_count || 0

    return (
        <Comments.MainRoot data={commentsData} preview={true}>
            <Comments.Container focused={true}>
                <Animated.View style={animated_header_container}>
                    <Comments.TopRoot>
                        <Comments.TopLeftRoot>
                            <Comments.HeaderLeft>
                                <Text style={commentCountStyle}>
                                    {commentsCount > 0 ? `${commentsCount} comentários` : "Sem comentários"}
                                </Text>
                            </Comments.HeaderLeft>
                        </Comments.TopLeftRoot>
                        <Comments.TopRightRoot>
                            <ViewMorebutton
                                action={handlePress}
                                text={t("Add Comment")}
                                icon={
                                    <AddIcon
                                        style={iconStyle}
                                        fill={ColorTheme().primary.toString()}
                                        width={12}
                                        height={12}
                                    />
                                }
                            />
                        </Comments.TopRightRoot>
                    </Comments.TopRoot>
                </Animated.View>

                <Comments.CenterRoot>
                    <Comments.ListComments />
                </Comments.CenterRoot>

                {commentsCount > 1 && (
                    <View style={viewMoreContainerStyle}>
                        <Text style={viewMoreTextStyle}>
                            Ver mais {commentsCount - 1} comentários
                        </Text>
                    </View>
                )}
            </Comments.Container>
        </Comments.MainRoot>
    )
} 