import { Animated, View, useColorScheme } from "react-native"

import React from "react"
import { useKeyboardAnimation } from "react-native-keyboard-controller"
import { Moment } from "../../../../../../components/moment"
import ReportButton from "../../../../../../components/moment/components/moment-report-button"
import { UserShow } from "../../../../../../components/user_show"
import { colors } from "../../../../../../constants/colors"
import sizes from "../../../../../../constants/sizes"
import FeedContext from "../../../../../../contexts/Feed"
import { MomentProps } from "../../../../../../contexts/Feed/types"
import { LanguagesCodesType } from "../../../../../../locales/LanguageTypes"
import RenderCommentFeed from "./render-comment-feed"

type renderMomentProps = {
    momentData: MomentProps
    isFocused: boolean
    isFeed: boolean
}

export default function RenderMomentFeed({ momentData, isFocused, isFeed }: renderMomentProps) {
    const { height, progress } = useKeyboardAnimation()
    const { commentEnabled } = React.useContext(FeedContext)
    const [animatedValue] = React.useState(new Animated.Value(0))
    const [commentValue] = React.useState(new Animated.Value(0))
    const [opacityValue] = React.useState(new Animated.Value(1))
    const isDarkMode = useColorScheme() === "dark"

    // Adaptar MomentProps para MomentDataProps
    const adaptedMomentData = {
        id: String(momentData.id),
        user: {
            ...momentData.user,
            id: String(momentData.user.id),
            you_follow: momentData.user.isFollowing,
        },
        description: momentData.description,
        midia: momentData.midia,
        comments: [], // Será preenchido pelo contexto se necessário
        statistics: {
            total_likes_num: momentData.likes_count,
            total_comments_num: momentData.comments_count,
            total_shares_num: 0,
            total_views_num: 0,
        },
        tags: [], // Tags não estão disponíveis no MomentProps
        language: "pt" as LanguagesCodesType, // Idioma padrão
        created_at: momentData.created_at,
        is_liked: momentData.isLiked,
    }

    React.useEffect(() => {
        if (isFocused) {
            if (commentEnabled) {
                Animated.timing(commentValue, {
                    toValue: 1,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
            } else {
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()

                Animated.timing(commentValue, {
                    toValue: 0,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
            }
        } else {
            if (commentEnabled) {
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
            } else {
                Animated.timing(opacityValue, {
                    delay: 100,
                    toValue: 1,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
                Animated.timing(commentValue, {
                    toValue: 0,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
            }
        }
    }, [commentEnabled])

    React.useEffect(() => {
        if (isFocused) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 100, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(animatedValue, {
                toValue: 0.043,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(opacityValue, {
                toValue: isDarkMode ? 0.4 : 0.55,
                duration: 400, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
        }
    }, [isFocused])

    const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -175], // Adjust the value as needed
    })
    const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.34], // Adjust the value as needed
    })

    const scale2 = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.5], // Adjust the value as needed
    })

    const translateCommentsY = height.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1.08], // Adjust the value as needed
    })

    const animated_container = {
        opacity: opacityValue,
        transform: [
            { translateY: isFocused ? translateY : 0 },
            { scale: commentEnabled ? scale : 1 },
            { scale: scale2 },
        ],
    }

    const animated_comment_container = {
        transform: [{ translateY: isFocused ? translateCommentsY : 0 }],
    }
    return (
        <Moment.Root.Main
            momentData={adaptedMomentData}
            isFeed={isFeed}
            isFocused={isFocused}
            momentSize={sizes.moment.standart}
        >
            <Animated.View style={animated_container}>
                <Moment.Container
                    contentRender={momentData.midia}
                    isFocused={isFocused}
                    blurRadius={30}
                >
                    <Moment.Root.Top>
                        <Moment.Root.TopLeft>
                            <UserShow.Root data={adaptedMomentData.user}>
                                <UserShow.ProfilePicture
                                    pictureDimensions={{ width: 30, height: 30 }}
                                />
                                <UserShow.Username truncatedSize={15} />

                                <UserShow.FollowButton
                                    isFollowing={momentData.user.isFollowing}
                                    displayOnMoment={true}
                                />
                            </UserShow.Root>
                        </Moment.Root.TopLeft>
                        <Moment.Root.TopRight>
                            <ReportButton color={colors.gray.white} />
                        </Moment.Root.TopRight>
                    </Moment.Root.Top>

                    <Moment.Root.Center>
                        <View style={{ marginBottom: sizes.margins["2sm"], width: "100%" }}>
                            <Moment.Description />
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={{ flex: 1 }}>
                                    <Moment.LikeButton isLiked={false} />
                                </View>
                                <View>
                                    <Moment.AudioControl />
                                </View>
                            </View>
                        </View>
                    </Moment.Root.Center>
                </Moment.Container>
            </Animated.View>

            <Animated.View style={animated_comment_container}>
                <RenderCommentFeed moment={momentData} focused={isFocused} />
            </Animated.View>
        </Moment.Root.Main>
    )
}
