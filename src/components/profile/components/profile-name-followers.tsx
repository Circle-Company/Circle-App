import React from "react"
import { Animated } from "react-native"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { Text } from "../../Themed"
import LanguageContext from "@/contexts/Preferences/language"
import { useProfileContext as UseProfileContext } from "../profile-context"
import { ProfileNameProps } from "../profile-types"
import { textLib } from "@/shared/circle.text.library"

export default function Name({
    color = String(ColorTheme().text),
    fontSize = fonts.size.title3,
    fontFamily = fonts.family.Bold,
    margin = sizes.margins["1sm"],
    scale = 1,
}: ProfileNameProps) {
    const { user } = UseProfileContext()
    const { t } = React.useContext(LanguageContext)

    const followsNum = user.statistics.total_followers_num
    const animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 0.5,
            useNativeDriver: true,
            delay: 60,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: any = {
        marginHorizontal: margin * scale,
        flexDirection: "row",
        alignitems: "center",
        justifyContent: "center",
        opacity: animatedOpacity,
    }

    const text_style: any = {
        fontSize: fontSize * scale,
        fontFamily: fontFamily,
        color: color,
    }
    if (!user?.name) {
        return null
    }
    return (
        <Animated.View style={container}>
            <Text style={text_style}>{user?.name}</Text>
            {followsNum > 0 && (
                <Text style={text_style}>
                    <Text style={text_style}>, </Text>
                    {textLib.conversor.formatNumWithDots(followsNum)}{" "}
                    {followsNum > 1 ? t("Followers") : t("Follower")}
                </Text>
            )}
        </Animated.View>
    )
}
