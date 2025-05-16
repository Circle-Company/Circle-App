import React from "react"
import { Animated, Pressable, StyleProp, ViewStyle } from "react-native"
import ColorTheme from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"

/**
 * Interface de propriedades para o componente ButtonStandart
 *
 * @property {StyleProp<ViewStyle>} style - Estilo adicional para customização do botão
 * @property {string} testID - ID para testes
 * @property {number} bounciness - Intensidade do efeito de mola na animação (0-20)
 * @property {number} animationScale - Escala final da animação quando pressionado (0-1)
 * @property {number} width - Largura do botão (se não for fornecida, adapta-se ao conteúdo)
 * @property {number} height - Altura do botão
 * @property {string} backgroundColor - Cor de fundo do botão
 * @property {React.ReactNode} children - Conteúdo do botão
 * @property {boolean} margins - Se o botão deve ter margem direita
 * @property {number} borderRadius - Raio da borda do botão
 * @property {boolean} square - Se deve ter largura igual à altura quando width não é fornecido
 * @property {Function} action - Função executada ao pressionar o botão
 * @property {Function} vibrate - Função opcional para feedback háptico
 */
export interface ButtonStandartProps {
    style?: StyleProp<ViewStyle>
    testID?: string
    bounciness?: number
    animationScale?: number
    width?: number
    height?: number
    backgroundColor?: string
    children: React.ReactNode
    margins?: boolean
    borderRadius?: number
    square?: boolean
    action(): void
    vibrate?: () => void
}

/**
 * Componente de botão padrão com animação de escala ao pressionar
 *
 * Este botão possui uma animação de mola ao ser pressionado e liberado,
 * e pode ter tamanho fixo ou adaptar-se ao seu conteúdo.
 *
 * @example
 * <ButtonStandart
 *    action={() => console.log('Botão pressionado')}
 *    backgroundColor="#0088FF"
 * >
 *    <Text>Pressione-me</Text>
 * </ButtonStandart>
 */
export default function ButtonStandart({
    style,
    bounciness = 12,
    animationScale = 0.8,
    width,
    height = sizes.buttons.height * 0.5,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    children,
    margins = true,
    borderRadius = typeof height === "number" ? height / 2 : 50,
    square = false,
    testID,
    action,
    vibrate,
}: ButtonStandartProps) {
    // Referência para a animação de escala
    const animatedScale = React.useRef(new Animated.Value(1)).current

    // Certifica-se que o botão começa com sua escala normal
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [animatedScale])

    const handleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const handlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true,
        }).start()
    }

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: backgroundColor,
        marginRight: margins ? sizes.margins["3sm"] : 0,
        height: height,
        borderRadius: borderRadius,
        paddingHorizontal: sizes.paddings["1md"],
        // Comportamento de width:
        // - Quando width é fornecido: usa o tamanho fixo especificado
        // - Quando width não é fornecido e square=true: width = height (formato quadrado)
        // - Quando width não é fornecido e square=false: ocupa apenas o espaço necessário
        ...(width
            ? { width, alignSelf: "center" }
            : square
                ? { width: height, aspectRatio: 1, alignSelf: "center" }
                : { alignSelf: "flex-start", flexShrink: 1 }),
        ...(style as ViewStyle),
    }

    async function onPress() {
        handleButtonAnimation()
        if (vibrate) vibrate()
        action()
    }

    return (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Pressable
                testID={testID}
                style={container}
                onPressIn={handlePressIn}
                onPressOut={handleButtonAnimation}
                onPress={onPress}
            >
                {children}
            </Pressable>
        </Animated.View>
    )
}
