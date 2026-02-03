import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import LinearGradient from "react-native-linear-gradient"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { Animated, Pressable, View, ViewStyle, Platform } from "react-native"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import BlurredBackground from "../../general/blurred-background"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { Button, Host, Text } from "@expo/ui/swift-ui"
import { VectorIcon } from "expo-router/unstable-native-tabs"
import MomentContext from "../context"

export default function MomentAudioControl() {
    const { session } = React.useContext(PersistedContext)
    const { data } = React.useContext(MomentContext)

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
        console.log("mute clieckeeeeeees")
        if (session?.preferences?.setMuteAudio) {
            session.preferences.setMuteAudio(!isMuted)
        }
    }

    if (data.hasAudio === false) return null
    return (
        <Host matchContents>
            <Button
                key={isMuted ? "muted" : "unmuted"}
                onPress={handlePress}
                variant={iOSMajorVersion! >= 26 ? "glass" : "bordered"}
                modifiers={[
                    {
                        $type: "frame",
                        width: 46,
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
                color={iOSMajorVersion! >= 26 ? colors.gray.grey_01 + 80 : colors.gray.grey_01}
            >
                {isMuted ? (
                    <InactiveSoundIcon
                        fill={colors.gray.white + 80}
                        width={sizes.icons["2sm"].width}
                        height={sizes.icons["2sm"].height}
                    />
                ) : (
                    <ActiveSoundIcon
                        fill={colors.gray.white + 80}
                        width={sizes.icons["2sm"].width}
                        height={sizes.icons["2sm"].height}
                    />
                )}
            </Button>
        </Host>
    )

    /**
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
*/
}
