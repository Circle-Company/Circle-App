import React from "react"
import { Animated, useColorScheme } from "react-native"
import sizes from "../../layout/constants/sizes"
import { colors } from "../../layout/constants/colors"
import { NotificationProps } from "./notification-types"
import RenderNotification from "./components/render-notification"
type GLobalToastProps = {
    lastNotification: NotificationProps
    showNotification: boolean
}
export const GLobalToast = ({ lastNotification, showNotification }: GLobalToastProps) => {
    const position = React.useRef(new Animated.Value(-100)).current // Posição inicial acima da tela (-100)
    const isDarkMode = useColorScheme() === "dark"

    React.useEffect(() => {
        // Animação para mover a notificação para a posição 0
        Animated.timing(position, {
            toValue: 0,
            duration: 500, // Duração da animação em milissegundos
            useNativeDriver: false, // Precisa ser false para animações de layout
        }).start()

        setTimeout(() => {
            Animated.timing(position, {
                toValue: -100, // Recolhe de volta para a posição inicial acima da tela
                duration: 500,
                useNativeDriver: false,
            }).start(() => {
                // Limpar notificação após a animação de recolhimento
            })
        }, 4000)
    }, [showNotification])

    if (showNotification == false) return null

    const container: any = {
        width: sizes.screens.width,
        height: sizes.headers.height * 1.2,
        zIndex: 100,
        elevation: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        borderBottomWidth: 1,
        shadowOpacity: 0,
        shadowColor: "rgba(0, 0, 0, 0)",
        borderColor: isDarkMode ? colors.gray.grey_07 : colors.gray.grey_03,
        backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
    }
    return (
        <Animated.View style={[container, { top: position }]}>
            <RenderNotification notification={lastNotification} />
        </Animated.View>
    )
}
