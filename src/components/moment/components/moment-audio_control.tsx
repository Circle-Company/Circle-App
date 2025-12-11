import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import ButtonStandart from "../../buttons/button-standart"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import LinearGradient from "react-native-linear-gradient"
import PersistedContext from "../../../contexts/Persisted"
import React from "react"
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

    const gradientColors = [colors.gray.grey_06, colors.gray.grey_08]

    return (
        <ButtonStandart
            style={{
                width: 46,
                height: 46,
                marginRight: sizes.margins["1sm"],
                padding: 0,
                overflow: "hidden",
            }}
            borderRadius={23}
            square
            margins={false}
            action={handlePress}
            backgroundColor="transparent"
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                    width: "100%",
                    height: "100%",
                    padding: 1,
                    borderRadius: 23,
                }}
            >
                <LinearGradient
                    colors={[colors.gray.grey_07, colors.gray.grey_07]}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
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
                </LinearGradient>
            </LinearGradient>
        </ButtonStandart>
    )
}
