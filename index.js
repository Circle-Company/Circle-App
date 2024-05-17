import React from 'react'
import {AppRegistry, LogBox} from 'react-native'

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
])
LogBox.ignoreLogs(["new NativeEventEmitter()"]);

import App from './App';
import {name as appName} from './app.json';

const Aplication = () => {
  return <App/>  
}

AppRegistry.registerComponent(appName, () => Aplication);