import { View, ViewStyle } from "@/components/Themed"
import ListLanguagesSelector from "@/features/language.selector"
import sizes from "@/constants/sizes"

export default function LanguageScreen() {
    const container: ViewStyle = {
        alignItems: "center",
        paddingHorizontal: sizes.paddings["1md"],
        width: sizes.screens.width,
        flex: 1,
    }

    return (
        <View style={container}>
            <ListLanguagesSelector />
        </View>
    )
}
