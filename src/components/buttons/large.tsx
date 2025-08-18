import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useRef } from "react"
import { Animated, Pressable, Text, View } from "react-native"
import ColorTheme from "../../constants/colors"
import Fonts from "../../constants/fonts"
import Sizes from "../../constants/sizes"

import ArrowRight from "@/assets/icons/svgs/arrow_right.svg"

export default function Buttonlarge(props: any) {
    const navigation = useNavigation()
    const animatedScale = useRef(new Animated.Value(0)).current

    useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    const handleButtonPress = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const container: any = {}
    const buttonContainer: any = {
        backgroundColor: ColorTheme().backgroundAccent,
        ...Sizes.buttons,
    }
    const text: any = {
        fontFamily: Fonts.family["Medium-Italic"],
        fontSize: 16,
        color: ColorTheme().textAccent,
    }
    const textContainer: any = {
        marginLeft: 5,
        justifyContent: "center",
        flex: 1,
    }
    const iconContainer: any = {
        marginLeft: 38,
        width: 28,
        borderRadius: 28 / 2,
        height: 28,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ColorTheme().textAccent,
    }
    return (
        <View style={container}>
            <Pressable
                onPress={() => {
                    handleButtonPress(), navigation.navigate(props.navigateTo)
                }}
            >
                <Animated.View style={[buttonContainer, { transform: [{ scale: animatedScale }] }]}>
                    <View style={textContainer}>
                        <Text style={text}>{props.title}</Text>
                    </View>

                    <View style={iconContainer}>
                        <ArrowRight
                            fill={String(ColorTheme().backgroundAccent)}
                            width={16}
                            height={16}
                        />
                    </View>
                </Animated.View>
            </Pressable>
        </View>
    )
}
