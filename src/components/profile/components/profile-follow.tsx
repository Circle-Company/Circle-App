import React from "react"
import { Text } from "@/components/Themed"
import ButtonStandart from "@/components/buttons/button-standart"
import LanguageContext from "@/contexts/language"
import sizes from "@/constants/sizes"
import ColorTheme, { colors } from "@/constants/colors"
import ProfileContext from "@/contexts/profile"
import { useProfileContext } from "../profile-context"
import fonts from "@/constants/fonts"
import { TextStyle } from "react-native"

enum Title {
    FOLLOW = "Follow",
    FOLLOWING = "Following",
    MUTUAL = "You follow each other",
}

interface FollowButtonProps {
    isFollowing: boolean
    isFollowedBy: boolean
    onPress?: () => void
    loading?: boolean
    disabled?: boolean
}

export function FollowButton({
    isFollowing,
    isFollowedBy,
    onPress,
    loading = false,
    disabled = false,
}: FollowButtonProps) {
    const { user } = useProfileContext()
    const { t } = React.useContext(LanguageContext)

    let displayTitleKey: Title

    switch (true) {
        case isFollowing && isFollowedBy:
            displayTitleKey = Title.MUTUAL
            break
        case isFollowing && !isFollowedBy:
            displayTitleKey = Title.FOLLOWING
            break
        default:
            displayTitleKey = Title.FOLLOW
            break
    }

    const label = t(displayTitleKey)
    const isDisabled = disabled || loading

    function handleFollow() {}

    const labelStyle: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family["Black-Italic"],
        color: !isFollowing ? colors.gray.black : colors.gray.grey_04 + "90",
    }

    return (
        <ButtonStandart
            action={isDisabled ? undefined : onPress}
            style={{ opacity: isDisabled ? 0.6 : 1, minWidth: sizes.buttons.width * 0.35 }}
            height={46}
            margins={false}
            backgroundColor={!isFollowing ? colors.gray.white : ColorTheme().backgroundDisabled}
        >
            <Text style={labelStyle}>{label}</Text>
        </ButtonStandart>
    )
}
