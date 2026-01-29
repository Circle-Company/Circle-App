import PersistedContext from "@/contexts/Persisted"
import { Button, ButtonVariant, Host, Text } from "@expo/ui/swift-ui"
import React from "react"
import MomentContext from "../context"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { storage, safeSet, safeDelete } from "@/store"

const LIKE_NS = "@circle:like:pressed:"

;(function clearLikePressedNamespaceOnce() {
    try {
        const anyStorage = storage as any
        const keys: string[] =
            typeof anyStorage.getAllKeys === "function" ? anyStorage.getAllKeys() : []
        for (const k of keys) {
            if (typeof k === "string" && k.startsWith(LIKE_NS)) {
                safeDelete(k)
            }
        }
    } catch {
        // noop
    }
})()

export function likeIOS({ isLiked }: { isLiked: boolean }) {
    const { session } = React.useContext(PersistedContext)
    const { data, actions, options } = React.useContext(MomentContext)
    const [likedPressed, setLikedPressed] = React.useState(isLiked ? isLiked : actions.like)
    const likeKey = React.useMemo(() => `${LIKE_NS}${data.id}`, [data.id])

    React.useEffect(() => {
        try {
            const persisted = (storage as any)?.getString?.(likeKey)
            if (persisted === "1" || persisted === "0") {
                // respect persisted transient likePressed; don't override
                return
            }
        } catch {}
        if (actions.like) setLikedPressed(true)
        else setLikedPressed(false)
    }, [actions.like, likeKey])

    // When moment regains focus in feed, recover from MMKV if present, otherwise from context
    React.useEffect(() => {
        if (options.isFocused) {
            try {
                const persisted = (storage as any)?.getString?.(likeKey)
                if (persisted === "1") setLikedPressed(true)
                else if (persisted === "0") setLikedPressed(false)
                else setLikedPressed(actions.like)
            } catch {
                setLikedPressed(actions.like)
            }
        }
    }, [options.isFocused, actions.like, likeKey])

    async function onLikeAction() {
        try {
            setLikedPressed(true)
            safeSet(likeKey, "1")
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
            safeSet(likeKey, "0")
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
