import React from "react"
import { StyleSheet } from "react-native"
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { useCameraContext } from "../context"

interface Props {
    /** Minimum publishable clip length in seconds — parent's constant. */
    minPublishableSec: number
    /** Auto-stop cap in seconds — parent's constant. */
    maxRecordingSec: number
}

// Seconds before max that we start warning "will stop soon".
const NEAR_MAX_THRESHOLD_SEC = 5

/**
 * Small hint line rendered under the camera preview. Message picks up
 * automatically based on the current recording lifecycle:
 *
 *   - torch on, idle      → tells the user the flash will fire
 *   - idle                → generic "press and hold" prompt
 *   - recording < 5s      → countdown to the publishable threshold
 *   - recording 5s..25s   → "release to publish"
 *   - recording last 5s   → "will stop soon"
 */
export function CameraStatusLine({
    minPublishableSec,
    maxRecordingSec,
}: Props): React.ReactElement {
    const { t } = React.useContext(LanguageContext)
    const { isRecording, recordingTime, torch, isHandsFree } = useCameraContext()

    let message: string
    let emphasis = false

    if (isHandsFree) {
        // Hands-free copy takes priority: the near-max countdown still fires
        // so the user knows the auto-stop is coming, but "hold" language is
        // replaced with "tap" wherever it would otherwise apply.
        if (isRecording) {
            const remainingToMax = maxRecordingSec - recordingTime
            if (remainingToMax <= NEAR_MAX_THRESHOLD_SEC) {
                message = t("Hands-free • Stops in {{seconds}}s", {
                    seconds: Math.max(1, Math.ceil(remainingToMax)),
                })
                emphasis = true
            } else {
                message = t("Tap to stop record")
                emphasis = true
            }
        } else {
            message = t("Tap to start record")
        }
    } else if (isRecording) {
        const remainingToPublish = minPublishableSec - recordingTime
        const remainingToMax = maxRecordingSec - recordingTime
        if (remainingToPublish > 0) {
            message = t("Hold {{seconds}}s more to publish", {
                seconds: Math.max(1, Math.ceil(remainingToPublish)),
            })
            emphasis = true
        } else if (remainingToMax <= NEAR_MAX_THRESHOLD_SEC) {
            message = t("Recording stops in {{seconds}}s", {
                seconds: Math.max(1, Math.ceil(remainingToMax)),
            })
            emphasis = true
        } else {
            message = t("Release to publish")
        }
    } else if (torch === "on") {
        message = t("Flash will fire while recording")
    } else {
        message = t("Press and hold to record")
    }

    // Fade in/out whenever the message text changes so state transitions
    // don't look like a hard swap.
    const opacity = useSharedValue(1)
    React.useEffect(() => {
        opacity.value = 0
        opacity.value = withTiming(1, { duration: 180 })
    }, [message, opacity])

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

    return (
        <Reanimated.View pointerEvents="none" style={[styles.wrap, animatedStyle]}>
            <Text style={[styles.text, emphasis && styles.emphasis]} numberOfLines={1}>
                {message}
            </Text>
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginTop: 20,
    },
    text: {
        color: colors.gray.grey_04,
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        letterSpacing: 0.2,
        textAlign: "center",
    },
    emphasis: {
        color: colors.gray.white,
        fontFamily: fonts.family.Semibold,
    },
})
