import { Animated, View, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../constants/colors"

import { AnimatedVerticalScrollView } from "../../../../lib/hooks/useAnimatedScrollView"
import FeedContext from "../../../../contexts/Feed"
import { Loading } from "../../../../components/loading"
import { Moment } from "../../../../components/moment"
import { MomentDataProps } from "../../../../components/moment/context/types"
import PersistedContext from "../../../../contexts/Persisted"
import React from "react"
import RenderCommentFull from "../comments/render-comment-full"
import { Text } from "../../../../components/Themed"
import { UserShow } from "../../../../components/user_show"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"
import { userReciveDataProps } from "../../../../components/user_show/user_show-types"

type RenderMomentFullProps = {
    momentData: MomentDataProps
    isFocused: boolean
    fromFeed: boolean
    fromAccount: boolean
}

const RenderMomentFull: React.FC<RenderMomentFullProps> = ({
    momentData,
    fromFeed,
    fromAccount: initialFromAccount,
}: RenderMomentFullProps) => {
    const { session } = React.useContext(PersistedContext)
    const { setFocusedChunkItemFunc } = React.useContext(FeedContext)
    const [loading, setLoading] = React.useState(false)
    const [fromAccount, setFromAccount] = React.useState(initialFromAccount)
    const isDarkMode = useColorScheme() === "dark"
    const scrollY = React.useRef(new Animated.Value(0)).current
    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [fadeAnim])

    React.useEffect(() => {
        setFocusedChunkItemFunc({ id: String(momentData.id) })
    }, [momentData.id, setFocusedChunkItemFunc])

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, 400],
        outputRange: [1, 0.7],
        extrapolate: "clamp",
    })

    const contentTranslateY = scrollY.interpolate({
        inputRange: [0, 400],
        outputRange: [0, -30],
        extrapolate: "clamp",
    })

    const userDataRender = React.useMemo<userReciveDataProps>(() => {
        if (momentData.user) {
            if (momentData.user?.id === session.user.id) {
                setFromAccount(true)
                return {
                    ...session.user,
                    youFollow: false,
                }
            }
            setFromAccount(false)
            return momentData.user
        }
        setFromAccount(true)
        return {
            ...session.user,
            youFollow: false,
        }
    }, [momentData.user, session.user])

    const styles = {
        bottom_container: {
            width: sizes.screens.width - sizes.margins["1md"] * 2,
            marginHorizontal: sizes.margins["1md"],
            marginTop: sizes.margins["1md"],
            paddingHorizontal: sizes.paddings["2sm"],
            paddingTop: sizes.paddings["2sm"],
            paddingBottom: sizes.paddings["1sm"],
            borderRadius: sizes.borderRadius["1md"],
            backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        },
        descriptionStyle: {
            lineHeight: 18,
            fontSize: fonts.size.body,
            fontFamily: fonts.family.Semibold,
            flexDirection: "row" as const,
            justifyContent: "flex-start" as const,
        },
        informations_container: {
            flexDirection: "row" as const,
            justifyContent: "flex-start" as const,
            paddingTop: sizes.paddings["2sm"],
            paddingBottom: sizes.paddings["1sm"] * 0.3,
        },
        description_container: {
            margin: sizes.margins["1sm"],
            marginBottom: sizes.margins["1sm"] * 0.7,
        },
        in_moment_bottom_container: {
            flexDirection: "row" as const,
            justifyContent: "flex-end" as const,
            alignItems: "center" as const,
        },
        in_moment_button_left_container: {
            flex: 1,
            alignItems: "flex-end" as const,
            flexDirection: "row" as const,
            marginRight: sizes.margins["2sm"],
        },
    }

    if (loading) {
        return (
            <Loading.Container>
                <Loading.ActivityIndicator />
            </Loading.Container>
        )
    }

    return (
        <AnimatedVerticalScrollView
            handleRefresh={() => {}}
            onEndReachedThreshold={0.1}
            showRefreshSpinner={false}
            onEndReached={async () => {
                await Promise.resolve()
            }}
        >
            <Moment.Root.Main
                momentData={momentData}
                isFeed={fromFeed}
                isFocused={true}
                momentSize={{
                    ...sizes.moment.standart,
                    width: sizes.screens.width,
                    height: sizes.screens.width * sizes.moment.aspectRatio,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: sizes.moment.full.borderRadius,
                    borderBottomRightRadius: sizes.moment.full.borderRadius,
                }}
            >
                <Moment.Container contentRender={momentData.midia}>
                    <Moment.Root.Center />
                    <Moment.Root.Bottom>
                        <View style={styles.in_moment_bottom_container}>
                            <View style={styles.in_moment_button_left_container}>
                                <UserShow.Root data={userDataRender}>
                                    <UserShow.ProfilePicture
                                        pictureDimensions={{ width: 30, height: 30 }}
                                    />
                                    <UserShow.Username />
                                    {!fromAccount && (
                                        <UserShow.FollowButton
                                            isFollowing={Boolean(momentData.user.youFollow)}
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

                <Animated.View
                    style={[
                        styles.bottom_container,
                        {
                            opacity: imageOpacity,
                            transform: [{ translateY: contentTranslateY }],
                        },
                    ]}
                >
                    <View style={styles.description_container}>
                        <Text style={styles.descriptionStyle}>{momentData.description}</Text>
                        <View style={styles.informations_container}>
                            <Moment.Date
                                color={ColorTheme().text.toString()}
                                paddingHorizontal={0}
                            />
                        </View>
                    </View>
                </Animated.View>

                <RenderCommentFull />
            </Moment.Root.Main>
        </AnimatedVerticalScrollView>
    )
}

export default RenderMomentFull
