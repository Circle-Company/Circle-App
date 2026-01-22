import PersistedContext from "@/contexts/Persisted"
import { Button, Host, Text } from "@expo/ui/swift-ui"
import React from "react"
import MomentContext from "../context"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import fonts from "@/constants/fonts"
import { TextStyle } from "react-native"
import sizes from "@/constants/sizes"

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
            setLikedPressed(true)
            Vibrate("effectHeavyClick")
            console.log(session.account.jwtToken)
            actions
                .registerInteraction("LIKE", {
                    momentId: data.id,
                    authorizationToken: session.account.jwtToken,
                })
                .then(() => {})
        } catch (error) {
            setLikedPressed(false)
            Vibrate("notificationError")
        }
    }
    async function onUnlikeAction() {
        try {
            setLikedPressed(false)
            Vibrate("notificationError")
            actions.registerInteraction("UNLIKE", {
                momentId: data.id,
                authorizationToken: session.account.jwtToken,
            })
        } catch (error) {
            setLikedPressed(true)
            console.error("Erro ao processar unlike:", error)
        }
    }

    async function handlePress() {
        if (likedPressed) await onUnlikeAction()
        else await onLikeAction()
    }

    if (!options.enableLike) return null
    if (iOSMajorVersion! >= 26) {
        return (
            <Host matchContents>
                <Button
                    key={likedPressed ? "liked" : "unliked"}
                    onPress={handlePress}
                    variant={likedPressed ? "glassProminent" : "glass"}
                    modifiers={[
                        {
                            $type: "frame",
                            height: 46,
                        },
                        {
                            $type: "background",
                            material: "systemUltraThinMaterialDark",
                            shape: "circle",
                        },
                    ]}
                    controlSize="large"
                    systemImage={"heart.fill"}
                    disabled={!options.enableLike}
                    color={likedPressed ? colors.red.red_05 : colors.gray.grey_01 + 80}
                />
            </Host>
        )
    }
}
