import { Text, View } from "@/components/Themed"
import ColorTheme from "@/constants/colors"
import sizes from "@/constants/sizes"
import { ViewStyle } from "react-native"

export function RequestCameraPermissionsPage() {
    const container: ViewStyle = {
        width: sizes.screens.width,
        height: sizes.screens.height,
        backgroundColor: ColorTheme().background,
        alignItems: "center",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <Text>Camera Permissions Page</Text>
        </View>
    )
}
