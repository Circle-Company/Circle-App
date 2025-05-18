import Animated, { FadeIn } from "react-native-reanimated"

import { Text } from "@/components/Themed"
import ColorTheme from "@/layout/constants/colors"
import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        borderWidth: 1,
        elevation: 5,
        margin: 16,
        padding: 16,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    text: {
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
})

export function RenderError() {
    const theme = ColorTheme()
    
    return (
        <Animated.View 
            entering={FadeIn.duration(500).delay(200).withInitialValues({ opacity: 0 })}
            style={[styles.container, { backgroundColor: theme.error, borderColor: theme.error }]}
        >
            <Text style={[styles.text, { color: theme.titleAccent }]}>Erro ao carregar os usuários</Text>
        </Animated.View>
    )
}