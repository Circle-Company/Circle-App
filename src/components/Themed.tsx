import * as React from "react"

import {
    Text as DefaultText,
    View as DefaultView,
    TextProps as RNTextProps,
    TextStyle as RNTextStyle,
    ViewProps as RNViewProps,
    ViewStyle as RNViewStyle,
} from "react-native"

import ColorTheme from "../constants/colors"

export type { RNTextStyle as TextStyle, RNViewStyle as ViewStyle }

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
