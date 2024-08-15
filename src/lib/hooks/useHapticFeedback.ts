import ReactNativeHapticFeedback from "react-native-haptic-feedback"

const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
}

ReactNativeHapticFeedback.trigger("impactMedium", options)
