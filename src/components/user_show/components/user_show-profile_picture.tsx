import Animated, { FadeIn } from "react-native-reanimated"
import ColorTheme, { colors } from "../../../constants/colors"
import { BackHandler, Pressable, View, useColorScheme } from "react-native"

import Icon from "@/assets/icons/svgs/@2.svg"
import { Image } from "expo-image"
import React from "react"
import { UserProfilePictureProps } from "../user_show-types"
import sizes from "../../../constants/sizes"
import PersistedContext from "../../../contexts/Persisted"
import ProfileContext from "../../../contexts/profile"
import { router, usePathname } from "expo-router"
import { useUserShowContext } from "../user_show-context"

export default function profile_picture({
    displayOnMoment = true,
    pictureDimensions,
    disableAction = false,
}: UserProfilePictureProps) {
    const { user, executeBeforeClick } = useUserShowContext()
    const { session } = React.useContext(PersistedContext)
    const pathname = usePathname()
    const { setUserId, setProfilePreview } = React.useContext(ProfileContext)

    const isDarkMode = useColorScheme() === "dark"
    const outlineSize: number = 0 // Number(Number(pictureDimensions.width) / (displayOnMoment ? 8 : 14)) // /6
    const container: any = {
        marginHorizontal: sizes.paddings["1sm"] / 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: +Number([Number(pictureDimensions.width) + Number(outlineSize)]) / 2,
        backgroundColor: colors.gray.grey_07,
        width: Number(pictureDimensions.width) + Number(outlineSize),
        height: Number(pictureDimensions.height) + Number(outlineSize),
        overflow: "hidden",
    }

    const iconContainer: any = {
        alignSelf: "center",
        justifyContent: "center",
        backgroundColor: colors.gray.grey_07,
    }

    const [profilePicture, setProfilePicture] = React.useState<string>("")
    async function onProfilePictureAction() {
        if (!disableAction) {
            const targetId = String(user.id)
            const myId = String(session.user.id)
            const isSelf = targetId === myId
            const targetPath = isSelf ? `/you/${targetId}` : `/profile/${targetId}`
            if (pathname === targetPath) {
                executeBeforeClick ? executeBeforeClick() : null
                return
            }

            // Inject preview into ProfileContext before navigating
            setProfilePreview({ id: targetId, username: String(user.username || "") })
            setUserId(targetId)

            if (isSelf) {
                router.replace({
                    pathname: "/you/[id]",
                    params: { id: targetId, from: "profile" },
                })
            } else {
                router.replace({ pathname: "/profile/[userId]", params: { userId: targetId } })
            }
            executeBeforeClick ? executeBeforeClick() : null
        }
    }

    React.useEffect(() => {
        // Suportar tanto profilePicture (string) quanto profile_picture (objeto)
        if (user.profilePicture) setProfilePicture(String(user.profilePicture))
        else setProfilePicture("")
    }, [user])

    return (
        <Animated.View entering={FadeIn.duration(200)}>
            <Pressable onPress={async () => await onProfilePictureAction()} style={container}>
                <Image
                    priority={"normal"}
                    cachePolicy={"memory"}
                    recyclingKey={profilePicture}
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
                {!profilePicture && (
                    <View style={iconContainer}>
                        <Icon
                            width={pictureDimensions.width * 0.5}
                            height={pictureDimensions.height * 0.5}
                            fill={isDarkMode ? colors.gray.grey_05 + 90 : colors.gray.grey_04 + 50}
                        />
                    </View>
                )}
            </Pressable>
        </Animated.View>
    )
}
