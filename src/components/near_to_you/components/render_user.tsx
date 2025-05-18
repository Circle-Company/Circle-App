import ColorTheme, { colors } from "@/layout/constants/colors"
import { Animated, Pressable, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import Reanimated, { FadeInDown } from "react-native-reanimated"

import { Text } from "@/components/Themed"
import { useDistanceFormatter } from "@/lib/hooks/useDistanceFormatter"
import React from "react"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { UserShow } from "../../user_show"
import { RenderItemReciveDataObjectProps } from "../types"

export default function RenderUser({ user }: RenderItemReciveDataObjectProps) {
    const bounciness = 8
    const animationScale = 0.9
    const isDarkMode = useColorScheme() === "dark"
    const animatedScale = React.useRef(new Animated.Value(1)).current
    
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [animatedScale, user])
    
    const HandleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }
    const HandlePressOut = () => {
        HandleButtonAnimation()
        /**
         *         navigation.navigate("ProfileNavigator", {
            screen: "Profile",
            params: { findedUserPk: user.id },
        })
         * 
         */
    }

    const HandlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true,
        }).start()
    }

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.margins["2sm"] * 2,
        paddingHorizontal: sizes.paddings["1sm"] * 0.7,
        paddingVertical: sizes.paddings["1sm"],
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09: colors.gray.grey_02,
        borderRadius: sizes.borderRadius["1md"],
        marginBottom: sizes.margins["2sm"]
    }
    const container_left: ViewStyle = {
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
    }
    const container_left_text: TextStyle = {
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        fontSize: fonts.size.body * 0.7,
        fontFamily: fonts.family.Bold,
    }
    const container_center: ViewStyle = {
        flex: 1,
        marginLeft: sizes.margins["1sm"],
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "center",
    }
    const inner_container_left: ViewStyle = {
        paddingHorizontal: sizes.paddings["1sm"] * 0.6,
        paddingVertical: sizes.paddings["1sm"] * 0.4,
        backgroundColor: isDarkMode ? colors.gray.grey_06 : colors.gray.grey_02,
        marginLeft: sizes.margins["1sm"] * 1.2,
        marginRight: sizes.margins["1sm"],
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    }
    const container_right: ViewStyle = {
        alignItems: "flex-end",
        justifyContent: "flex-end",
        flexDirection: "row",
    }

    const animated_container: ViewStyle = {
        transform: [{ scale: animatedScale }],
        flex: 1
    }

    return (
        <Reanimated.View entering={FadeInDown.duration(100)} style={container}>
            <Animated.View style={animated_container}>
                <Pressable onPressIn={HandlePressIn} onPressOut={HandlePressOut}>
                    <UserShow.Root data={{
                        ...user,
                        profile_picture: {
                            small_resolution: user.profile_picture.tiny_resolution || "",
                            tiny_resolution: user.profile_picture.tiny_resolution || ""
                        }
                    }}>
                        <View style={container_left}>
                            <View style={inner_container_left}>
                                <Text style={container_left_text}>
                                    {useDistanceFormatter(user.distance_km)}
                                </Text>
                            </View>                            
                            <UserShow.ProfilePicture
                                pictureDimensions={{ width: 40, height: 40 }}
                                displayOnMoment={false}
                            />

                        </View>
                        <View style={container_center}>
                            <UserShow.Username
                                margin={0}
                                truncatedSize={user.follow_you ? user.verifyed ? 7 : 10 : 14}
                                fontSize={fonts.size.body}
                                displayOnMoment={false}
                                fontFamily={fonts.family.Bold}
                            />

                            <Text
                                style={{
                                    fontSize: fonts.size.body * 0.9,
                                    fontFamily: fonts.family.Semibold,
                                    color: ColorTheme().textDisabled
                                }}
                            >
                                {user.name}
                            </Text>
                        </View>
                        <View style={container_right}>
                            <UserShow.FollowButton
                                followsYou={user.follow_you}
                                isFollowing={user.you_follow}
                                hideOnFollowing={true}
                                displayOnMoment={false}
                            />
                        </View>
                    </UserShow.Root>
                </Pressable>
            </Animated.View>
        </Reanimated.View>
    )
}
