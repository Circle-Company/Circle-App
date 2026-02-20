import React from "react"
import { Animated, ViewStyle } from "react-native"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"
import { Text } from "@/components/Themed"
import LanguageContext from "@/contexts/language"
import ButtonStandart from "@/components/buttons/button-standart"
import { useProfileContext } from "@/components/profile/profile-context"
import { TextStyle } from "react-native"
import fonts from "@/constants/fonts"

export function BlockedByCard() {
    const { t } = React.useContext(LanguageContext)
    const { user } = useProfileContext()

    const animatedScale = React.useRef(new Animated.Value(1)).current
    const animatedOpacity = React.useRef(new Animated.Value(0)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 30,
            useNativeDriver: true,
            delay: 90,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }

    if (user.interactions?.isBlockedBy)
        return (
            <Animated.View style={container}>
                <Text style={title}>{t("You have been blocked")} 😰</Text>
                <Text style={description}>
                    {t(
                        "You will not be able to see any content from @{{username}} until you are unblocked.",
                        {
                            username: user.username,
                        },
                    )}
                </Text>
            </Animated.View>
        )
    else return null
}
