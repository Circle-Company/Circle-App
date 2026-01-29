import PersistedContext from "@/contexts/Persisted"
import { Button, ButtonVariant, Host, Text } from "@expo/ui/swift-ui"
import React from "react"
import MomentContext from "../context"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export function likeIOS({ isLiked }: { isLiked: boolean }) {
    const { session } = React.useContext(PersistedContext)
    const { data, actions, options } = React.useContext(MomentContext)
    const [likedPressed, setLikedPressed] = React.useState(isLiked ? isLiked : actions.like)

    React.useEffect(() => {
        if (actions.like) setLikedPressed(true)
        else setLikedPressed(false)
    }, [actions.like])

    // When moment regains focus in feed, recover the local like state from context
    React.useEffect(() => {
        if (options.isFocused) {
            setLikedPressed(actions.like)
        }
    }, [options.isFocused])

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

    let variantProminent: ButtonVariant =
        iOSMajorVersion! >= 26 ? "glassProminent" : "borderedProminent"
    let variant: ButtonVariant = iOSMajorVersion! >= 26 ? "glass" : "bordered"

    if (!options.enableLike) return null
    return (
        <Host matchContents>
            <Button
                key={likedPressed ? "liked" : "unliked"}
                onPress={handlePress}
                variant={likedPressed ? variantProminent : variant}
                modifiers={[
                    {
                        $type: "frame",
                        height: 46,
                    },
                    ...(iOSMajorVersion! < 26
                        ? [
                              {
                                  $type: "cornerRadius",
                                  radius: 23,
                              },
                          ]
                        : []),
                    {
                        $type: "background",
                        material: "systemUltraThinMaterialDark",
                        shape: "circle",
                    },
                ]}
                controlSize="large"
                systemImage={"heart.fill"}
                disabled={!options.enableLike}
                color={
                    likedPressed
                        ? colors.red.red_05
                        : iOSMajorVersion! >= 26
                          ? colors.gray.grey_01 + 80
                          : colors.gray.grey_01
                }
            />
        </Host>
    )
}
