import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import ButtonStandart from "../../buttons/button-standart"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import LinearGradient from "react-native-linear-gradient"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { Pressable, View, ViewStyle } from "react-native"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"

export default function MomentAudioControl() {
    const { session } = React.useContext(PersistedContext)

    const isMuted = session?.preferences?.content?.muteAudio || false

    const handlePress = () => {
        // Atualizar a preferência global
        if (session?.preferences?.setMuteAudio) {
            session.preferences.setMuteAudio(!isMuted)
        }
    }

    const borderWidth = 1
    const borderRadiusValue = 23
    const gradientColors = [colors.gray.grey_06, colors.gray.grey_08]

    const gradient_border: ViewStyle = {
        borderRadius: borderRadiusValue,
        padding: borderWidth,
        overflow: "hidden",
        width: 46,
        height: 46,
        marginRight: sizes.margins["1sm"],
    }

    const blur_container: ViewStyle = {
        flex: 1,
        borderRadius: borderRadiusValue - borderWidth,
        overflow: "hidden",
        backgroundColor: colors.gray.grey_07,
        alignItems: "center",
        justifyContent: "center",
    }

    const pressable_container: ViewStyle = {
        overflow: "hidden",
        borderRadius: borderRadiusValue,
        width: "100%",
        height: "100%",
    }

    return (
        <Pressable onPress={handlePress} style={pressable_container}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={gradient_border}
            >
                <View style={blur_container}>
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
            </LinearGradient>
        </Pressable>
    )
}
