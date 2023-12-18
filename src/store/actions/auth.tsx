import { AUTHENTICATE, LOGOUT, SET_DID_TRY_AUTO_LOGIN } from './types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../services/api'

import profileData from '../../data/profile'

export const setDidTryAutoLogin = () => {
    return{
        type: SET_DID_TRY_AUTO_LOGIN
    };
};
export const authenticate = (user: number, token: String) => {
    return dispatch => {
        dispatch({
            type: AUTHENTICATE,
            user : user,
            token: token
        });
    }
};
export const signin = (username: String, password: String) => {
    return async dispatch => {
        const response = await api.post('/api/auth/authenticate',
        {   
            username: username,
            password: password
        })
        const resData = await response.data

        await dispatch(authenticate(profileData, profileData.id))
        saveDataToStorage(profileData)
    };
}
export const signup = (username: String, password: String) => {
    return async dispatch => {

        const response = await api.post('/api/auth/register',
        {
            username: username,
            password: password
        })
        const resData = await response.data
        await saveDataToStorage(resData)

        await dispatch(authenticate(profileData, profileData.id))
        
    };
};
export const logout = () => {
    AsyncStorage.removeItem('userData')
    return {
        type: LOGOUT
    }
}
const saveDataToStorage = (resData) => {
    AsyncStorage.removeItem('userData')
    AsyncStorage.setItem('userData', JSON.stringify({
        token: resData.token,
        user: resData.user
    }))
}
