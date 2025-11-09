import ActiveSoundIcon from "@/assets/icons/svgs/speaker_wave_2_fill.svg"
import ButtonStandart from "../../buttons/button-standart"
import InactiveSoundIcon from "@/assets/icons/svgs/speaker_slash_fill.svg"
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

    return (
        <ButtonStandart
            style={{
                width: 46,
                height: 46,
                marginRight: sizes.margins["1sm"],
                borderWidth: 2,
                borderColor: colors.gray.grey_06,
            }}
            borderRadius={23}
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
