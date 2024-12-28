import { Text, View } from "@/components/Themed"
import ColorTheme from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"

export function RequestCameraPermissionsPage() {
    const container = {
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
