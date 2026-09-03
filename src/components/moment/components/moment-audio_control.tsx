import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { Animated, Pressable, StyleSheet, View } from "react-native"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import MomentContext from "../context"

export default function MomentAudioControl({ size = 40 }: { size?: number }) {
    const { session } = React.useContext(PersistedContext)
    const { data } = React.useContext(MomentContext)

    const isMuted = session?.preferences?.content?.muteAudio || false
    const animatedScale = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])

    const handlePress = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
        if (session?.preferences?.setMuteAudio) {
            session.preferences.setMuteAudio(!isMuted)
        }
    }

    if (data.hasAudio === false) return null

    // Ícone escala proporcionalmente ao tamanho do botão (design base = 46).
    const iconScale = size / 42
    const iconWidth = sizes.icons["2sm"].width * iconScale
    const iconHeight = sizes.icons["2sm"].height * iconScale

    const buttonStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        overflow: "hidden" as const,
    }

    const icon = isMuted ? (
        <InactiveSoundIcon fill={colors.gray.white} width={iconWidth} height={iconHeight} />
    ) : (
        <ActiveSoundIcon fill={colors.gray.white} width={iconWidth} height={iconHeight} />
    )

    return (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Pressable
                onPress={handlePress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isMuted ? "Unmute" : "Mute"}
                accessibilityState={{ selected: !isMuted }}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
                {isLiquidGlassAvailable() ? (
                    <GlassView
                        colorScheme="dark"
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme="dark"
                        style={buttonStyle}
                    >
                        {icon}
                    </GlassView>
                ) : (
                    <View style={[buttonStyle, styles.fallback]}>{icon}</View>
                )}
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    fallback: {
        backgroundColor: colors.gray.grey_08 + "cc",
    },
})
