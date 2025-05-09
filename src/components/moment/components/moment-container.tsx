import PersistedContext from "@/contexts/Persisted"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated"
import FeedContext from "../../../contexts/Feed"
import ColorTheme from "../../../layout/constants/colors"
import DoubleTapPressable from "../../general/double-tap-pressable"
import { MidiaRender } from "../../midia_render"
import { UserShow } from "../../user_show"
import MomentContext from "../context"
import { MomentContainerProps } from "../moment-types"
export default function Container({
    children,
    contentRender,
    isFocused = true,
    fromFullMomentScreen = false,
}: MomentContainerProps) {
    const { momentData, momentUserActions, momentSize, momentOptions } =
        React.useContext(MomentContext)
    const { session } = React.useContext(PersistedContext)
    const { commentEnabled, setFocusedMoment } = React.useContext(FeedContext)
    const navigation: any = useNavigation()

    const container: any = {
        ...momentSize,
        overflow: "hidden",
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    const content_container: any = {
        flex: 1,
        position: "absolute",
        width: momentSize.width,
        height: momentSize.height,
        zIndex: 0,
    }

    const tiny_container: any = {
        width: momentSize.width * 0.31,
        height: momentSize.height * 0.31,
        position: "absolute",
        alignItems: "flex-start",
        flexDirection: "row",
        top: 190,
        left: 120,
        flex: 1,
        zIndex: 1,
        transform: [{ scale: 3 }],
    }

    async function handleDoublePress() {
        if (momentData.user.id != session.user.id) momentUserActions.handleLikeButtonPressed({})
    }

    async function handleSinglePress() {
        if (!commentEnabled && momentOptions.isFeed) {
            if (!fromFullMomentScreen && isFocused) {
                momentUserActions.setClickIntoMoment(true)
                setFocusedMoment({
                    id: momentData.id,
                    user: momentData.user,
                    description: momentData.description,
                    midia: momentData.midia,
                    comments: momentData.comments,
                    statistics: momentData.statistics,
                    tags: momentData.tags,
                    language: momentData.language,
                    created_at: momentData.created_at,
                    is_liked: momentUserActions.liked,
                })
            }
            navigation.navigate("MomentNavigator", { screen: "DetailScreen" })
        }
    }

    return (
        <View style={container}>
            <View style={content_container}>
                <DoubleTapPressable onSingleTap={handleSinglePress} onDoubleTap={handleDoublePress}>
                    <MidiaRender.Root data={contentRender} content_sizes={momentSize}>
                        <MidiaRender.RenderImage
                            isFeed={momentOptions.isFeed}
                            enableBlur={true}
                            blur={!isFocused}
                        />
                    </MidiaRender.Root>
                </DoubleTapPressable>
            </View>
            {!commentEnabled ? (
                isFocused ? (
                    children
                ) : null
            ) : (
                <Reanimated.View
                    style={tiny_container}
                    entering={FadeIn.delay(300).duration(200)}
                    exiting={FadeOut.duration(100)}
                >
                    <UserShow.Root data={momentData.user}>
                        <View style={{ top: 1 }}>
                            <UserShow.ProfilePicture
                                disableAnalytics={true}
                                pictureDimensions={{ width: 15, height: 15 }}
                            />
                        </View>
                        <UserShow.Username
                            scale={0.8}
                            disableAnalytics={true}
                            margin={0}
                            truncatedSize={8}
                        />
                    </UserShow.Root>
                </Reanimated.View>
            )}
        </View>
    )
}
