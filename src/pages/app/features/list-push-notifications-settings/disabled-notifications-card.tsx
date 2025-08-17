import { openSettings } from "react-native-permissions"
import { Text, View } from "../../../../components/Themed"
import ViewMorebutton from "../../../../components/buttons/view_more"
import ColorTheme from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"

export function DisabledNotificationsCard() {
    const container = {
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 0.8,
        backgroundColor: ColorTheme().backgroundDisabled,
    }

    async function goToSettings() {
        try {
            await openSettings()
        } catch (error) {
            console.error("Failed to open settings:", error)
        }
    }
    return (
        <>
            <View style={container}>
                <Text>
                    As notificações estão desabilitadas no seu dispositivo. Habilite-as nas
                    configurações para receber notificações.
                </Text>
            </View>
            <View style={{ marginTop: sizes.margins["1md"] }}>
                <ViewMorebutton
                    text="Go to Settings"
                    action={goToSettings}
                    fontSize={fonts.size.body * 1.1}
                    animationScale={0.9}
                />
            </View>
        </>
    )
}
