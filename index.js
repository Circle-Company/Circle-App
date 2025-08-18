import { AppRegistry, LogBox } from "react-native"

import App from "./src/app.native"

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
    "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.",
])
LogBox.ignoreLogs(["new NativeEventEmitter()"])

const Aplication = () => {
    return <App />
}

AppRegistry.registerComponent("main", () => Aplication)
