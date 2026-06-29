import { View, ViewStyle } from "@/components/Themed"
import ListSettings from "@/features/settings"

export default function SettingsScreen() {
    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    return (
        <View style={container}>
            <ListSettings />
        </View>
    )
}
