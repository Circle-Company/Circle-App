import { View, ViewStyle } from "@/components/Themed"
import sizes from "@/constants/sizes"
import ListSettings from "@/features/settings"
import { SafeAreaView } from "react-native-safe-area-context"

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
