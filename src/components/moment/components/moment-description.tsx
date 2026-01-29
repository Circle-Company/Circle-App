import { Animated, Text, View } from "react-native"
import ColorTheme, { colors } from "../../../constants/colors"
import React, { useEffect, useRef } from "react"

import MomentContext from "../context"
import { MomentDescriptionProps } from "../moment-types"
import Sizes from "../../../constants/sizes"
import fonts from "../../../constants/fonts"

export default function Description({ displayOnMoment = true }: MomentDescriptionProps) {
    const { data } = React.useContext(MomentContext)

    const descriptionStyle: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Bold,
        color: displayOnMoment ? colors.gray.white : ColorTheme().text,
        textShadowColor: displayOnMoment ? "#00000070" : "#00000000",
        textShadowOffset: displayOnMoment ? { width: 0.3, height: 0.7 } : { width: 0, height: 0 },
        textShadowRadius: displayOnMoment ? 4 : 0,
        justifyContent: "flex-start", // Ajuste para que o texto comece do início
    }
    const animationTime = data.description?.length * 700
    const animationToValue = -(data.description?.length * 8)
    const needAnimation = data.description?.length > 50 ? true : false
    const textAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Reinicia a animação ao montar/alterar dependências
        textAnim.setValue(0)
        if (needAnimation && displayOnMoment && (data.description || "").length > 0) {
            const animate = () => {
                Animated.timing(textAnim, {
                    toValue: animationToValue,
                    duration: animationTime,
                    useNativeDriver: true,
                }).start(() => {
                    textAnim.setValue(0)
                    animate()
                })
            }
            animate()
        }
        return () => {
            // Interrompe animações pendentes no unmount
            // @ts-ignore - stopAnimation existe em Animated.Value
            textAnim.stopAnimation && textAnim.stopAnimation()
        }
    }, [
        needAnimation,
        displayOnMoment,
        data.description,
        animationToValue,
        animationTime,
        textAnim,
    ])

    return (
        <View style={{ overflow: "hidden", alignSelf: "flex-start", maxWidth: "95%" }}>
            {needAnimation && displayOnMoment ? (
                <Animated.Text
                    style={[descriptionStyle, { transform: [{ translateX: textAnim }] }]}
                    numberOfLines={1}
                    selectable={false}
                >
                    {data.description}
                </Animated.Text>
            ) : (
                <Text style={descriptionStyle} selectable={false} numberOfLines={2}>
                    {data.description}
                </Text>
            )}
        </View>
    )
}
