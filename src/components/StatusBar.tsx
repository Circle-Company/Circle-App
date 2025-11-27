import { StatusBar as RNStatusBar, useColorScheme } from "react-native"

import ColorTheme from "@/constants/colors"
import React from "react"

interface StatusBarProps {
    backgroundColor?: string
    barStyle?: "default" | "light-content" | "dark-content"
    translucent?: boolean
}

export const StatusBar: React.FC<StatusBarProps> = ({
    backgroundColor,
    barStyle,
    translucent = true,
}) => {
    const isDarkMode = useColorScheme() === "dark"
    const colors = ColorTheme()

    // Cor padrão da status bar baseada no tema
    const defaultBackgroundColor = isDarkMode ? colors.background : colors.backgroundAccent
    const defaultBarStyle = isDarkMode ? "light-content" : "dark-content"

    return (
        <RNStatusBar
            backgroundColor={backgroundColor || defaultBackgroundColor}
            barStyle={barStyle || defaultBarStyle}
            translucent={translucent}
        />
    )
}

export default StatusBar
