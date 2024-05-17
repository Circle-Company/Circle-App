import { Text } from "../../../../components/Themed";
import { View } from 'react-native'
import ColorTheme from "../../../../layout/constants/colors";
import fonts from "../../../../layout/constants/fonts";
import sizes from "../../../../layout/constants/sizes";


type EndReachedProps = {
    text: string,
    width?: number,
    height?: number,
    style?: HTMLDivElement
}
export default function endReached ({
    text,
    width = sizes.screens.width,
    height = sizes.headers.height,
    style
}: EndReachedProps) {
    const container: any = {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        ...style
    }

    const title: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().textDisabled
    }

    return (
        <View style={container}>
            <Text style={title}>{text}</Text>
        </View>
    )
}