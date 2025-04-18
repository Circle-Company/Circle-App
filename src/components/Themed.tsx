import * as React from "react"
import {
    Text as DefaultText,
    View as DefaultView,
    TextProps as RNTextProps,
    ViewProps as RNViewProps,
} from "react-native"

import ColorTheme from "../layout/constants/colors"

export function Text(props: RNTextProps) {
    const { style, ...otherProps } = props

    return <DefaultText style={[{ color: ColorTheme().text }, style]} {...otherProps} />
}

export function View(props: RNViewProps) {
    const { style, ...otherProps } = props

    return (
        <DefaultView
            style={[{ backgroundColor: ColorTheme().background }, style]}
            {...otherProps}
        />
    )
}
