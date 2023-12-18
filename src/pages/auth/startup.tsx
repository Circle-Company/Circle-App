import React, { useEffect, useCallback } from 'react'
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch } from 'react-redux'

import * as authActions from '../../store/actions/auth'

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

const StartScreen = () => {

    const dispatch = useDispatch()
    
    const tryLogin = async () => {
        const userData = await AsyncStorage.getItem('userData')
        if (!userData) {
            dispatch(authActions.setDidTryAutoLogin())
            return
        }else{
            const transformedData = JSON.parse(userData)
            const { token, user } = transformedData

            dispatch(authActions.authenticate(user, token))            
        }

    }
     
    useEffect(() => {
        tryLogin()
    }, [])//dispatch])


    return null
}

export default StartScreen