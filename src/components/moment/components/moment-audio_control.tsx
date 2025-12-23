import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import LinearGradient from "react-native-linear-gradient"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { Animated, Pressable, View, ViewStyle, Platform } from "react-native"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import BlurredBackground from "../../general/blurred-background"

export default function MomentAudioControl() {
    const { session } = React.useContext(PersistedContext)

    const isMuted = session?.preferences?.content?.muteAudio || false
    const animatedScale = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])

    const handleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const handlePress = () => {
        handleButtonAnimation()
        // Atualizar a preferência global
        if (session?.preferences?.setMuteAudio) {
            session.preferences.setMuteAudio(!isMuted)
        }
    }

    const borderWidth = 1
    const borderRadiusValue = 23
    const gradientColors = [
        Platform.OS === "ios" ? colors.gray.grey_04 + "50" : colors.gray.grey_06,
        Platform.OS === "ios" ? colors.gray.grey_05 + "10" : colors.gray.grey_08,
    ]

    const animated_container: ViewStyle = {
        width: 46,
        height: 46,
        marginRight: sizes.margins["1sm"],
        transform: [{ scale: animatedScale }],
    }

    const pressable_container: ViewStyle = {
        overflow: "hidden",
        borderRadius: borderRadiusValue,
        width: "100%",
        height: "100%",
    }

    const gradient_border: ViewStyle = {
        flex: 1,
        borderRadius: borderRadiusValue,
        padding: borderWidth,
        overflow: "hidden",
    }

    const blur_container: ViewStyle = {
        flex: 1,
        borderRadius: borderRadiusValue - borderWidth,
        overflow: "hidden",
        backgroundColor: colors.gray.grey_07,
    }

    const container: ViewStyle = {
        flex: 1,
        height: "100%",
        borderRadius: borderRadiusValue - borderWidth,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        overflow: "hidden",
    }

    return (
        <Animated.View style={animated_container}>
            <Pressable onPress={handlePress} style={pressable_container}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={gradient_border}
                >
                    {Platform.OS === "ios" ? (
                        <BlurredBackground
                            intensity={30}
                            tint="systemMaterialDark"
                            radius={borderRadiusValue - borderWidth}
                            style={[blur_container, { backgroundColor: "transparent" }]}
                        >
                            <View style={container}>
                                {isMuted ? (
                                    <InactiveSoundIcon
                                        fill={colors.gray.white}
                                        width={sizes.icons["2sm"].width}
                                        height={sizes.icons["2sm"].height}
                                    />
                                ) : (
                                    <ActiveSoundIcon
                                        fill={colors.gray.white}
                                        width={sizes.icons["2sm"].width}
                                        height={sizes.icons["2sm"].height}
                                    />
                                )}
                            </View>
                        </BlurredBackground>
                    ) : (
                        <View style={blur_container}>
                            <View style={container}>
                                {isMuted ? (
                                    <InactiveSoundIcon
                                        fill={colors.gray.white}
                                        width={sizes.icons["2sm"].width}
                                        height={sizes.icons["2sm"].height}
                                    />
                                ) : (
                                    <ActiveSoundIcon
                                        fill={colors.gray.white}
                                        width={sizes.icons["2sm"].width}
                                        height={sizes.icons["2sm"].height}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    )
}
