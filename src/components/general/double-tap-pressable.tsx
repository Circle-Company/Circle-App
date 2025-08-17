import { Pressable, PressableProps } from "react-native"
import React, { useRef } from "react"

interface DoubleTapPressableProps extends PressableProps {
    onSingleTap?: () => void
    onDoubleTap: () => void
    delay?: number
}

const DoubleTapPressable: React.FC<DoubleTapPressableProps> = ({
    onSingleTap,
    onDoubleTap,
    delay,
    ...props
}) => {
    const lastTap = useRef<number | null>(null)
    const tapTimeout = useRef<NodeJS.Timeout | null>(null)

    const handlePress = () => {
        const now = Date.now()

        if (lastTap.current && now - lastTap.current < 300) {
            // Double tap detected
            if (tapTimeout.current) {
                clearTimeout(tapTimeout.current)
            }
            onDoubleTap()
        } else {
            // Single tap detected, but we need to wait to see if it's a double tap
            lastTap.current = now
            tapTimeout.current = setTimeout(
                () => {
                    onSingleTap ? onSingleTap() : null
                    lastTap.current = null
                },
                delay ? delay : 300
            ) // Adjust this delay as needed
        }
    }

    return (
        <Pressable {...props} onPress={handlePress} style={props.style}>
            {props.children}
        </Pressable>
    )
}

export default DoubleTapPressable
