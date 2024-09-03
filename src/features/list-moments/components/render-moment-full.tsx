import React from "react"
import { Animated, View } from "react-native"
import { Text } from "../../../components/Themed"
import { Loading } from "../../../components/loading"
import { Moment } from "../../../components/moment"
import { MomentDataProps } from "../../../components/moment/context/types"
import { UserShow } from "../../../components/user_show"
import { userReciveDataProps } from "../../../components/user_show/user_show-types"
import FeedContext from "../../../contexts/Feed"
import PersistedContext from "../../../contexts/Persisted"
import ProfileContext from "../../../contexts/profile"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import RenderCommentFull from "./render-comment-full"
import RenderTagsList from "./render-tags-list"

type renderMomentProps = {
    momentData: MomentDataProps
    isFocused: boolean
    fromFeed: boolean
    fromAccount: boolean
}

export default function render_moment_full({
    momentData,
    fromFeed,
    fromAccount,
    isFocused,
}: renderMomentProps) {
    const { session } = React.useContext(PersistedContext)
    const { setFocusedChunkItemFunc } = React.useContext(FeedContext)
    const [loading, setLoading] = React.useState(false)
    const scrollY = React.useRef(new Animated.Value(0)).current

    const imageScale = scrollY.interpolate({
        inputRange: [0, sizes.moment.full.width], // Faixa de entrada
        outputRange: [1, 0.75], // Faixa de saída (escala de 1 a 0.5)
        extrapolate: "clamp", // Impedir valores fora do range
    })

    const imageY = scrollY.interpolate({
        inputRange: [0, 800], // Faixa de entrada
        outputRange: [0, 160], // Faixa de saída (translada de 0 a -50)
        extrapolate: "clamp", // Impedir valores fora do range
    })

    const imageOpacity = scrollY.interpolate({
        inputRange: [1, 1], // Faixa de entrada
        outputRange: [1, 0.9], // Faixa de saída (escala de 1 a 0.5)
        extrapolate: "clamp", // Impedir valores fora do range
    })

    let userDataRender: userReciveDataProps
    if (momentData.user) {
        if (momentData.user?.id == session.user.id) {
            userDataRender = session.user
            fromAccount = true
        } else {
            userDataRender = momentData.user
            fromAccount = false
        }
    } else {
        userDataRender = session.user
        fromAccount = true
    }
    console.log("render_moment_full: ", userDataRender)
    const bottom_container: any = {
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["2sm"],
        paddingTop: sizes.paddings["2sm"],
        paddingBottom: sizes.paddings["1sm"],
        borderBottomWidth: 1,
        borderColor: ColorTheme().backgroundDisabled,
    }

    const descriptionStyle: any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        flexDirection: "row",
        justifyContent: "flex-start", // Ajuste para que o texto comece do início
    }

    const informations_container: any = {
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingTop: sizes.paddings["2sm"],
        paddingBottom: sizes.paddings["1sm"] * 0.3,
    }
    const description_container: any = {
        margin: sizes.margins["1sm"],
        marginBottom: sizes.margins["1sm"] * 0.7,
    }

    const in_moment_bottom_container: any = {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    }

    const in_moment_button_left_container: any = {
        flex: 1,
        alignItems: "flex-end",
        flexDirection: "row",
        marginRight: sizes.margins["2sm"],
    }

    if (loading)
        return (
            <Loading.Container>
                <Loading.ActivityIndicator />
            </Loading.Container>
        )

    React.useEffect(() => {
        console.log(JSON.stringify(momentData))
        setFocusedChunkItemFunc({ id: momentData.id })
    }, [])
    return (
        <Animated.ScrollView
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true } // Use o driver nativo para melhor performance
            )}
            scrollEventThrottle={16} // Frequência de atualização da animação
            showsVerticalScrollIndicator={false}
        >
            <Moment.Root.Main
                momentData={momentData}
                isFeed={fromFeed}
                isFocused={true}
                momentSize={{ ...sizes.moment.full, width: sizes.screens.width }}
            >
                <Animated.View
                    style={{ transform: [{ scale: imageScale }, { translateY: imageY }] }}
                >
                    <Moment.Container contentRender={momentData.midia}>
                        <Moment.Root.Center />
                        <Moment.Root.Bottom>
                            <View style={in_moment_bottom_container}>
                                <View style={in_moment_button_left_container}>
                                    <UserShow.Root data={userDataRender}>
                                        <UserShow.ProfilePicture
                                            pictureDimensions={{ width: 30, height: 30 }}
                                        />
                                        <UserShow.Username />
                                        {!fromAccount && (
                                            <UserShow.FollowButton
                                                isFollowing={Boolean(momentData.user.you_follow)}
                                                displayOnMoment={true}
                                            />
                                        )}
                                    </UserShow.Root>
                                </View>
                                {!fromAccount && (
                                    <Moment.LikeButton
                                        isLiked={false}
                                        paddingHorizontal={0}
                                        margin={0}
                                    />
                                )}
                            </View>
                        </Moment.Root.Bottom>
                    </Moment.Container>
                </Animated.View>

                <View style={bottom_container}>
                    <Animated.View style={{ opacity: imageOpacity }}>
                        <View style={description_container}>
                            <Text style={descriptionStyle}>{momentData.description}</Text>
                            <View style={informations_container}>
                                <Moment.Date
                                    color={ColorTheme().text.toString()}
                                    paddingHorizontal={0}
                                />
                                {momentData.statistics.total_comments_num && (
                                    <Moment.Full.Comments
                                        comments={momentData.statistics.total_comments_num}
                                    />
                                )}
                                {momentData.statistics.total_views_num && (
                                    <Moment.Full.Views
                                        views={momentData.statistics.total_views_num}
                                    />
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    <RenderTagsList />
                </View>

                <RenderCommentFull />
            </Moment.Root.Main>
        </Animated.ScrollView>
    )
}
