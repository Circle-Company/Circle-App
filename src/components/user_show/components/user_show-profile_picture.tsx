import Animated, { FadeIn } from "react-native-reanimated"
import ColorTheme, { colors } from "@/layout/constants/colors"
import { Pressable, View, useColorScheme } from "react-native"

import FastImage from "react-native-fast-image"
import Icon from "@/assets/icons/svgs/@2.svg"
import React from "react"
import { UserProfilePictureProps } from "../user_show-types"
import sizes from "@/layout/constants/sizes"
import { useNavigation } from "@react-navigation/native"
import { useUserShowContext } from "../user_show-context"

export default function profile_picture({
    displayOnMoment = true,
    pictureDimensions,
}: UserProfilePictureProps) {
    const { user, executeBeforeClick } = useUserShowContext()
    const navigation: any = useNavigation()

    const isDarkMode = useColorScheme() === "dark"
    const outlineSize: number = Number(Number(pictureDimensions.width) / (displayOnMoment ? 8 : 14)) // /6
    const container: any = {
        marginHorizontal: sizes.paddings["1sm"] / 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: +Number([Number(pictureDimensions.width) + Number(outlineSize)]) / 2,
        backgroundColor: displayOnMoment
            ? ColorTheme().blur_display_color
            : isDarkMode
              ? colors.gray.grey_07
              : colors.gray.grey_02,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
        overflow: "hidden",
    }

    const iconContainer: any = {
        alignSelf: "center",
        justifyContent: "center",
    }

    const [profilePicture, setProfilePicture] = React.useState<string>("")
    async function onProfilePictureAction() {
        await navigation.navigate("ProfileNavigator", {
            screen: "Profile",
            params: { findedUserPk: user.id },
        })
        executeBeforeClick ? executeBeforeClick() : null
    }

    React.useEffect(() => {
        if (user.profile_picture?.small_resolution == undefined) {
            setProfilePicture(String(user.profile_picture?.tiny_resolution))
        } else {
            setProfilePicture(String(user.profile_picture?.small_resolution))
        }
    }, [])

    return (
        <Animated.View entering={FadeIn.duration(200)}>
            <Pressable onPress={async () => await onProfilePictureAction()} style={container}>
                <FastImage
                    source={{ uri: String(profilePicture) || "" }}
                    style={{
                        width: Number(pictureDimensions.width),
                        height: Number(pictureDimensions.height),
                        borderRadius: Number(pictureDimensions.width) / 2,
                        position: "absolute",
                        top: Number(outlineSize) / 2,
                        left: Number(outlineSize) / 2,
                    }}
                />
                {!user.profile_picture?.tiny_resolution &&
                    !user.profile_picture?.small_resolution && (
                        <View style={iconContainer}>
                            <Icon
                                width={pictureDimensions.width * 0.5}
                                height={pictureDimensions.height * 0.5}
                                fill={
                                    isDarkMode ? colors.gray.grey_05 + 90 : colors.gray.grey_04 + 50
                                }
                            />
                        </View>
                    )}
            </Pressable>
        </Animated.View>
    )
}
