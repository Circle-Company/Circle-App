import { Pressable, View, Text, Animated} from 'react-native';
import ColorTheme, { colors } from '../../layout/constants/colors';
import fonts from '../../layout/constants/fonts';
type BadgeIconProps = {
    active: boolean,
    number: number,
}

export function BadgeIcon({
    active, number
}: BadgeIconProps) {

    const badge_style_with_number: any = {
        zIndex: 10,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 23,
        height: 23,
        top: -3,
        right: -7,
        borderRadius: 50,
        backgroundColor: ColorTheme().error,
        borderWidth: 2,
        borderColor: ColorTheme().background
    }

    const badge_text_style:any = {
        top: -0.2,
        left: 0.2,
        fontSize: fonts.size.caption1*0.95,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white
    }

    if(!active) return null
    return (
        <View style={badge_style_with_number}>
            <Text style={badge_text_style}>{number}</Text>
        </View>
    )
}