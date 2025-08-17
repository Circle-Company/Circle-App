// __mocks__/ButtonStandart.tsx
import React from "react"
import { TouchableOpacity } from "react-native"

export default function ButtonStandart({ testID, action, children, style }) {
    return (
        <TouchableOpacity testID={testID} onPress={action} style={style}>
            {children}
        </TouchableOpacity>
    )
}
