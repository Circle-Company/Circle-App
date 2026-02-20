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
import { useUnlockMutation } from "@/queries/user.block"

export function BlockingCard() {
    const { t } = React.useContext(LanguageContext)
    const { user } = useProfileContext()
    const [isLoading, setIsLoading] = React.useState(false)
    const [unlocked, setUnlocked] = React.useState(false)
    const unlockMutation = useUnlockMutation({ userId: String(user.id) })
    const handleUnlock = async () => {
        if (isLoading) return
        try {
            setIsLoading(true)
            await unlockMutation.mutateAsync()
            setUnlocked(true)
        } finally {
            setIsLoading(false)
        }
    }

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
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }
    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        marginTop: sizes.margins["1md"],
        maxWidth: sizes.buttons.width,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonLabel: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.2,
        color: colors.gray.black,
    }

    if (user.interactions?.isBlocking && !user.interactions?.isBlockedBy && !unlocked)
        return (
            <Animated.View style={container}>
                <Text style={title}>{t("You blocked this user")} 🙅‍♂️</Text>
                <Text style={description}>
                    {t("You can't see any content from @{{username}} until you unlock it.", {
                        username: user.username,
                    })}
                </Text>

                <ButtonStandart style={buttonContainer} margins={false} action={handleUnlock}>
                    <Text style={buttonLabel}>{isLoading ? t("Loading") : t("Unlock")}</Text>
                </ButtonStandart>
            </Animated.View>
        )
    else return null
}
