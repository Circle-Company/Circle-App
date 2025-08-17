<<<<<<< Updated upstream
import 'react-native-gesture-handler';
import { AppRegistry } from "react-native"
import { name as appName } from  "./app.json"
import App from "./App"

AppRegistry.registerComponent(appName, () => App)
=======
import { AppRegistry, LogBox } from "react-native"
import { name as appName } from "./app.config"
import App from "./src/app.native"

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
    "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.",
])
LogBox.ignoreLogs(["new NativeEventEmitter()"])

const Aplication = () => {
    return <App />
}

AppRegistry.registerComponent(appName, () => Aplication)
>>>>>>> Stashed changes
