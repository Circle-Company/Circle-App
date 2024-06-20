import React from "react"
import { View, useColorScheme, Animated} from "react-native"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import { colors } from "../../../layout/constants/colors"
import { ProfileDescriptionProps } from "../profile-types"
import { useProfileContext } from "../profile-context"
import ColorTheme from "../../../layout/constants/colors"
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors"

export default function description ({
}: ProfileDescriptionProps) {

    const {user} = useProfileContext()
    const isDarkMode = useColorScheme() === 'dark'

    var animatedScale = React.useRef(new Animated.Value(1)).current
    var animatedOpacity = React.useRef(new Animated.Value(0)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 30,
            useNativeDriver: true,
            delay: 90
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container:any = {
        width: sizes.screens.width,
        marginTop: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderTopWidth: sizes.borders['1md'],
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
        backgroundColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_01,
        transform: [{ scale: animatedScale }],
        opacity: animatedOpacity
    }
    const description_style:any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }

    if(!user.description){
        return null
    }
    
    return (
        <Animated.View style={container}>
            <Text style={description_style}>{user.description}</Text>  
        </Animated.View>
    )
}