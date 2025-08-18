import React from "react"
import { Animated, FlatList, Keyboard, StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import SelectMomentsContext from "../../../contexts/selectMoments"
import TitleInput from "../../../features/select-moments/components/input-title"
import RenderMemory from "../../../features/select-moments/components/render-memory"
import RenderMoment from "../../../features/select-moments/components/render-moments"

export default function NewMemoryTitleScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { memory_moments, selectedMoments } = React.useContext(SelectMomentsContext)
    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false)
    const [animation] = React.useState(new Animated.Value(0))
    const [renderMemoryScale] = React.useState(new Animated.Value(1))
    const container = {
        alignItems: "center",
        justifyContent: "center",
        top: keyboardIsVisible ? -sizes.sizes["2md"] : sizes.sizes["1xxl"] * 0.1,
    }

    const moment_list_container = {
        marginTop: keyboardIsVisible ? sizes.margins["1md"] : sizes.margins["1xxl"] * 0.6,
        width: sizes.screens.width,
    }

    const memory_container = {
        left: (memory_moments.length == 1 && 10) || (memory_moments.length == 2 && 6),
    }

    const title_input_container = {
        marginTop: keyboardIsVisible ? -sizes.margins["1xxl"] * 0.6 : sizes.margins["2sm"],
    }

    const sub_title = {
        fontSize: fonts.size.caption2,
        marginLeft: sizes.margins["1xxl"] * 0.6,
        marginBottom: sizes.margins["2sm"],
        color: ColorTheme().textDisabled,
    }

    const animateRenderMemoryScaleAndTranslate = (toScale: number, toTranslate: number) => {
        Animated.parallel([
            Animated.timing(renderMemoryScale, {
                toValue: toScale,
                duration: 300, // Ajuste conforme necessário
                useNativeDriver: true,
            }),
            Animated.timing(animation, {
                toValue: toTranslate,
                duration: 300, // Ajuste conforme necessário
                useNativeDriver: true,
            }),
        ]).start()
    }

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardIsVisible(true)
            animateRenderMemoryScaleAndTranslate(0.7, -100) // Altere o valor de translação conforme necessário
        })

        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardIsVisible(false)
            animateRenderMemoryScaleAndTranslate(1, 0) // Reinicie a posição quando o teclado estiver oculto
        })

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    return (
        <View style={container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />

            <Animated.View
                style={{ transform: [{ scale: renderMemoryScale }], ...memory_container }}
            >
                <RenderMemory memory={{ moments: memory_moments }} scale={0.7} />
            </Animated.View>
            <Animated.View style={title_input_container}>
                <TitleInput />
            </Animated.View>

            <View style={moment_list_container}>
                <Text style={sub_title}>*Moments that will be added</Text>
                <FlatList
                    data={selectedMoments}
                    horizontal
                    scrollEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item: any) => item.id}
                    ListHeaderComponent={({ item }) => {
                        return <View style={{ width: sizes.margins["1xxl"] * 0.5 }}></View>
                    }}
                    ListFooterComponent={({ item }) => {
                        return <View style={{ width: sizes.margins["1xxl"] * 0.5 }}></View>
                    }}
                    renderItem={({ item }) => {
                        return (
                            <RenderMoment
                                moment={item}
                                preview={true}
                                marginTop={0}
                                scale={0.4}
                                marginLeft={10}
                                borderRadius={25}
                            />
                        )
                    }}
                />
            </View>
        </View>
    )
}
