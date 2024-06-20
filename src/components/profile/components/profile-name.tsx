import React from "react"
import { View, Animated } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { ProfileNameProps } from "../profile-types"
import ShareIcon from '../../../assets/icons/svgs/arrow_shape_right.svg'
import ButtonStandart from "../../buttons/button-standart"
import { useProfileContext } from "../profile-context"
import { Text } from "../../Themed"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"

export default function name ({
    color = String(ColorTheme().text),
    fontSize = fonts.size.title3,
    fontFamily = fonts.family.Bold,
    margin = sizes.margins["1sm"],
    scale = 1
}: ProfileNameProps) {

    const { user } = useProfileContext()

    var animatedOpacity = React.useRef(new Animated.Value(0.2)).current

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 0.5,
            useNativeDriver: true,
            delay: 60
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: any = {
        marginHorizontal: margin * scale,
        flexDirection: 'row',
        alignitems: 'center',
        justifyContent: 'center',
        opacity: animatedOpacity
    }

    const text_style: any = {
        fontSize: fontSize * scale,
        fontFamily: fontFamily,
        color: color
    }
    if(!user.name){
        return null
    }
    return (
        <Animated.View style={container}>
            <Text style={text_style}>{user.name}</Text>
        </Animated.View>
        
    )
}