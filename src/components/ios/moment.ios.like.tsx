import PersistedContext from "@/contexts/Persisted"
import { Button, Host } from "@expo/ui/swift-ui"
import React from "react"
import MomentContext from "../moment/context"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { colors } from "@/constants/colors"
import LikeIcon from "@/assets/icons/svgs/heart_2.svg"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Text } from "react-native"
import fonts from "@/constants/fonts"
import { TextStyle } from "react-native"
import sizes from "@/constants/sizes"
import NumberConversor from "@/helpers/numberConversor"

export function likeIOS({ isLiked }: { isLiked: boolean }) {
    const { session } = React.useContext(PersistedContext)
    const { data, actions, options } = React.useContext(MomentContext)
    const [likedPressed, setLikedPressed] = React.useState(isLiked ? isLiked : actions.like)

    const likeDifference = actions.like
        ? actions.initialLikedState
            ? 0
            : 1 // Se está curtido, não soma se já estava curtido, senão soma 1
        : actions.initialLikedState
          ? -1
          : 0 // Se não está curtido, subtrai 1 se estava curtido, senão não muda

    const totalLikes = data?.metrics?.totalLikes ?? 0
    const adjustedLikes = totalLikes + likeDifference
    const displayLikes = NumberConversor(adjustedLikes)

    React.useEffect(() => {
        if (actions.like) setLikedPressed(true)
        else setLikedPressed(false)
    }, [actions.like])

    const like_text_pressed: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Black,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }
    const like_text: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
        marginLeft: sizes.margins["1sm"],
    }

    async function onLikeAction() {
        try {
            Vibrate("effectClick")
            actions.registerInteraction("LIKE", {
                momentId: data.id,
                authorizationToken: session.account.jwtToken,
            })
        } catch (error) {
            console.error("Erro ao processar like:", error)
        }
    }
    async function onUnlikeAction() {
        try {
            Vibrate("effectTick")
            actions.registerInteraction("UNLIKE", {
                momentId: data.id,
                authorizationToken: session.account.jwtToken,
            })
        } catch (error) {
            console.error("Erro ao processar unlike:", error)
        }
    }

    async function handlePress() {
        if (likedPressed) await onUnlikeAction()
        else await onLikeAction()
    }

    const like_fill: string = String(colors.gray.white)

    if (!options.enableLike) return null
    if (iOSMajorVersion! >= 26) {
        return (
            <Host matchContents>
                <Button
                    key={likedPressed ? "liked" : "unliked"}
                    onPress={handlePress}
                    variant="glass"
                    modifiers={[
                        {
                            $type: "frame",
                            width: 46,
                            height: 46,
                        },
                        {
                            $type: "background",
                            material: "systemUltraThinMaterialDark",
                            shape: "circle",
                        },
                    ]}
                >
                    <LikeIcon fill={like_fill} width={20} height={20} />
                    <Text style={likedPressed ? like_text_pressed : like_text}>{displayLikes}</Text>
                </Button>
            </Host>
        )
    }
}
