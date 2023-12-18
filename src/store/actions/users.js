import { GET_USER_BY_ID, UPDATE_USER_PICTURE, FOLLOW, UNFOLLOW, UPDATE_USER_INFORMATIONS, DELETE_USER} from './types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../services/api'

export const getUserById = () => {
    return async dispatch => {

        const userData = await AsyncStorage.getItem('userData')
        const transformedData = JSON.parse(userData)
        const { token } = transformedData
        
        const response = await api.get(`/api/user/find`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
        const resData = await response.data

        dispatch({
            type: GET_USER_BY_ID,
            users: resData
        });
    };
};

/*

export const deleteUser = (user_id) => {
    return async dispatch => {
        const response = await api.delete(`/user/delete/${user_id}`)
        const resData = await response.data

        dispatch({
            type: DELETE_USER,
            deleteUser: resData
        });
    };
};

export const putUserPicture = (user_id, picture) => {
    return async dispatch => {
        const response = await api.put(`/user/picture/update/${user_id}`, {picture: picture})
        const resData = await response.data

        dispatch({
            type: UPDATE_USER_PICTURE,
            pictures: resData
        });
    };
};

export const putUserInformation = (user_id, username, description, phone, email, birthday) => {
    return async dispatch => {
        const response = await api.put(`/user/informations/update/${user_id}`, {
            username: username,
            description: description,
            phone: phone,
            email: email,
            birthday: birthday
        })
        const resData = await response.data

        dispatch({
            type: UPDATE_USER_INFORMATIONS,
            informations: resData
        });
    }
};

export const follow = ( follow_id, fan_id ) => {
    return async dispatch => {
        const response = await api.post(`/user/follow`, {
            follow_id: follow_id,
            fan_id: fan_id  
        })
        const resData = await response.data

        dispatch({
            type: FOLLOW,
            follows: resData
        });
    };
};

export const unfollow = ( follow_id, fan_id ) => {
    return async dispatch => {
        const response = await api.delete(`/user/unfollow/${follow_id}/${fan_id}`)
        const resData = await response.data

        dispatch({
            type: UNFOLLOW,
            unfollows: resData
        });
    };
};
*/