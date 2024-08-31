import { useEffect, useState } from "react"

export const useKeyboard = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false)

    useEffect(() => {
        const showListener = () => setKeyboardVisible(true)
        const hideListener = () => setKeyboardVisible(false)

        // Add listeners for keyboard events (e.g., on Android/iOS)
        // Keyboard.addListener("keyboardDidShow", showListener)
        // Keyboard.addListener("keyboardDidHide", hideListener)

        return () => {
            // Cleanup listeners
            // Keyboard.removeListener("keyboardDidShow", showListener)
            // Keyboard.removeListener("keyboardDidHide", hideListener)
        }
    }, [])

    return {
        isKeyboardVisible,
        setKeyboardVisible,
    }
}
