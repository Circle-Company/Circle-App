import React, { useEffect, useRef } from "react"
import { View, Text, Animated } from "react-native"
import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDescriptionProps } from "../moment-types"
import MomentContext from "../context"

export default function description({ displayOnMoment = true }: MomentDescriptionProps) {
    const { momentData } = React.useContext(MomentContext)

    const container: any = {
        margin: Sizes.margins["1sm"],
    }

    const descriptionStyle: any = {
        lineHeight: 18,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: displayOnMoment ? colors.gray.white : ColorTheme().text,
        textShadowColor: displayOnMoment ? "#00000070" : "#00000000",
        textShadowOffset: displayOnMoment ? { width: 0.3, height: 0.7 } : { width: 0, height: 0 },
        textShadowRadius: displayOnMoment ? 4 : 0,
        justifyContent: "flex-start", // Ajuste para que o texto comece do início
    }
    const animationTime = momentData.description?.length * 700
    const animationToValue = -(momentData.description?.length * 8)
    const needAnimation = momentData.description?.length > 50 ? true : false
    const textAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (needAnimation && displayOnMoment) {
            const animateText = () => {
                Animated.timing(textAnim, {
                    toValue: animationToValue, // Deslocamento horizontal desejado
                    duration: animationTime, // Duração da animação em milissegundos
                    useNativeDriver: true,
                }).start(() => {
                    // Após a animação, reinicie o valor de textAnim para continuar a animação
                    textAnim.setValue(0)
                    animateText() // Chamar a função recursivamente para criar um loop infinito
                })
            }
            animateText()
        }
    }, [])

    return (
        <View style={container}>
            <Text style={descriptionStyle}>{momentData.description}</Text>
        </View>
    )
}
