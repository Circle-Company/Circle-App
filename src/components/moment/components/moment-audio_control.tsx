import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import ButtonStandart from "@/components/buttons/button-standart"
import PersistedContext from "@/contexts/Persisted"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"
import React from "react"

export default function MomentAudioControl() {
    const { session } = React.useContext(PersistedContext)

    const isMuted = session?.preferences?.content?.muteAudio || false

    const handlePress = () => {
        // Atualizar a preferência global
        if (session?.preferences?.setMuteAudio) {
            session.preferences.setMuteAudio(!isMuted)
        }
    }

    return (
        <ButtonStandart
            style={{
                marginRight: sizes.margins["1sm"],
            }}
            square
            margins={false}
            action={handlePress}
            backgroundColor={colors.gray.grey_07}
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
        </ButtonStandart>
    )
}
