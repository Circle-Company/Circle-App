import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Pressable, useColorScheme, View } from "react-native"
import FastImage from "react-native-fast-image"
import Animated, { FadeIn } from "react-native-reanimated"
import Icon from "../../../assets/icons/svgs/@2.svg"
import ViewProfileContext from "../../../contexts/viewProfile"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { UserShowActions } from "../user_show-actions"
import { useUserShowContext } from "../user_show-context"
import { UserProfilePictureProps } from "../user_show-types"

export default function profile_picture({
    displayOnMoment = true,
    disableAnalytics = false,
    pictureDimensions,
}: UserProfilePictureProps) {
    const { user, view_profile, executeBeforeClick } = useUserShowContext()
    const { setProfile } = React.useContext(ViewProfileContext)
    const navigation = useNavigation()

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
        executeBeforeClick ? executeBeforeClick() : null
        if (disableAnalytics == false) {
            UserShowActions.ProfilePicturePressed({
                user_id: Number(user.id),
                action: view_profile,
                user,
            })
            await setProfile(user.id)
            navigation.navigate("ProfileNavigator")
        }
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
            <Pressable onPress={onProfilePictureAction} style={container}>
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
