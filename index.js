/**
 * @format
 */

import React from 'react'
import {AppRegistry, LogBox} from 'react-native';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux'

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
])

LogBox.ignoreLogs([
  "new NativeEventEmitter()",
]);

import App from './App';
import {name as appName} from './app.json';

import authReducer from './src/store/reducers/auth'
import usersReducer from './src/store/reducers/users'

const AppRedux = () => {

  return(
          <App/>  
  )

}

AppRegistry.registerComponent(appName, () => AppRedux);