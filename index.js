import React from "react"
import { AppRegistry, LogBox } from "react-native"

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
    "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.",
])
LogBox.ignoreLogs(["new NativeEventEmitter()"])

import App from "./App"
import { name as appName } from "./app.json"

if (__DEV__) {
    import("react-refresh/runtime")
}

const Aplication = () => {
    return <App />
}

AppRegistry.registerComponent(appName, () => Aplication)
