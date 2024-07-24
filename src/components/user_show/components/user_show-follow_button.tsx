import React from "react"
import { Animated, Pressable } from "react-native"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { Text } from "../../Themed"
import { UserShowActions } from "../user_show-actions"
import { useUserShowContext } from "../user_show-context"
import { UserFollowButtonProps } from "../user_show-types"

export default function follow_button({
    isFollowing = false,
    hideOnFollowing = true,
    displayOnMoment = false,
}: UserFollowButtonProps) {
    const { session } = React.useContext(PersistedContext)
    const { user, follow, unfollow } = useUserShowContext()
    const { t } = React.useContext(LanguageContext)

    const [followPressed, setFollowPressed] = React.useState(isFollowing)

    const animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const container_unpressed: any = {
        width: sizes.buttons.width / 4.4,
        height: sizes.buttons.height / 2.8,
        borderRadius: Number([sizes.buttons.width / 4.4]) / 2,
        backgroundColor: ColorTheme().text,
        margin: sizes.margins["1sm"],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: sizes.borders["1md"],
        borderColor: colors.blue.blue_03 + "50",
    }
    const container_pressed: any = {
        width: sizes.buttons.width / 4.4,
        height: sizes.buttons.height / 2.8,
        borderRadius: Number([sizes.buttons.width / 4.4]) / 2,
        backgroundColor: displayOnMoment
            ? ColorTheme().backgroundDisabled + "99"
            : ColorTheme().backgroundDisabled,
        margin: sizes.margins["1sm"],
        alignItems: "center",
        justifyContent: "center",
    }
    const username_pressed: any = {
        fontSize: fonts.size.body * 0.76,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text + "90",
    }
    const username_unpressed: any = {
        fontSize: fonts.size.body * 0.85,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().background,
    }
    async function ButtonAction() {
        if (followPressed) {
            HandleButtonAnimation()
            setFollowPressed(false)
            UserShowActions.UnfollowPressed({ user_id: Number(user.id), action: unfollow })
        } else {
            HandleButtonAnimation()
            setFollowPressed(true)
            UserShowActions.FollowPressed({ user_id: Number(user.id), action: follow })
        }
    }

    if (user.id == session.user.id) return null
    if (isFollowing && hideOnFollowing) return null
    if (isFollowing && hideOnFollowing == false) {
        if (followPressed) {
            return (
                <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_pressed} onPress={() => ButtonAction()}>
                        <Text style={username_pressed}>{t("Following")}</Text>
                    </Pressable>
                </Animated.View>
            )
        } else {
            return (
                <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_unpressed} onPress={() => ButtonAction()}>
                        <Text style={username_unpressed}>{t("Follow")}</Text>
                    </Pressable>
                </Animated.View>
            )
        }
    } else {
        if (followPressed) {
            return (
                <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_pressed} onPress={() => ButtonAction()}>
                        <Text style={username_pressed}>{t("Following")}</Text>
                    </Pressable>
                </Animated.View>
            )
        } else {
            return (
                <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                    <Pressable style={container_unpressed} onPress={() => ButtonAction()}>
                        <Text style={username_unpressed}>{t("Follow")}</Text>
                    </Pressable>
                </Animated.View>
            )
        }
    }
}
