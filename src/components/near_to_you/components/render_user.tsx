import { Text } from "@/components/Themed"
import ColorTheme from "@/layout/constants/colors"
import { useDistanceFormatter } from "@/lib/hooks/useDistanceFormatter"
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native"
import React from "react"
import { Animated, Pressable, TextStyle, View, ViewStyle } from "react-native"
import Reanimated, { FadeInDown } from "react-native-reanimated"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { UserShow } from "../../user_show"
import { RenderItemReciveDataObjectProps } from "../types"
export default function render_user({ user }: RenderItemReciveDataObjectProps) {
    const bounciness = 8
    const animationScale = 0.9

    const navigation: NavigationProp<ParamListBase> = useNavigation()

    const animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
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
        height: sizes.sizes["2lg"],
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
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
        paddingRight: sizes.paddings["1sm"] * 0.2,
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Bold,
    }
    const container_center: ViewStyle = {
        flex: 1,
        marginLeft: sizes.margins["1md"],
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "center",
    }
    const inner_container_left: ViewStyle = {
        top: 25,
        marginLeft: -30,
        paddingHorizontal: sizes.paddings["1sm"] * 0.8,
        paddingVertical: sizes.paddings["1sm"] * 0.4,
        backgroundColor: "#7B61FF",
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderWidth: 3,
        borderColor: ColorTheme().background,
    }

    return (
        <Reanimated.View entering={FadeInDown.duration(100)} style={container}>
            <Animated.View style={{ transform: [{ scale: animatedScale }], flex: 1 }}>
                <Pressable style={container} onPressIn={HandlePressIn} onPressOut={HandlePressOut}>
                    <UserShow.Root data={user}>
                        <View style={container_left}>
                            <UserShow.ProfilePicture
                                pictureDimensions={{ width: 50, height: 50 }}
                                displayOnMoment={false}
                            />
                            <View style={inner_container_left}>
                                <Text style={container_left_text}>
                                    {useDistanceFormatter(user.distance_km)}
                                </Text>
                            </View>
                        </View>
                        <View style={container_center}>
                            <UserShow.Username
                                margin={0}
                                truncatedSize={20}
                                fontSize={fonts.size.body}
                                displayOnMoment={false}
                                fontFamily={fonts.family.Medium}
                            />

                            <Text
                                style={{
                                    fontSize: fonts.size.body,
                                    fontFamily: fonts.family.Medium,
                                }}
                            >
                                {user.name}
                            </Text>
                        </View>
                        <View
                            style={{
                                marginRight: sizes.margins["2sm"],
                                alignItems: "flex-end",
                                justifyContent: "flex-end",
                                flexDirection: "row",
                            }}
                        >
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
