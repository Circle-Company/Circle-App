import React from "react"
import { View } from "react-native"
import { Text } from "../../Themed"
import { UserRootProps } from "../user_show-types"
import UserShowContext from "../user_show-context"
import api from "../../../services/api"
import AuthContext from "../../../contexts/auth"

export default function root ({children, data}: UserRootProps) {
    const { user } = React.useContext(AuthContext)

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    
    }

    const follow = async(followed_user_id: number) => {
        try{
            const response = api.post('/user/follow', {
                user_id: 1,
                followed_user_id
            })
            .then(function (response) { return response.data })
            .catch(function (error) { console.log(error)})

            return await response          
        } catch(err) {
            console.error(err)
        } 
    }
    const unfollow = async(followed_user_id: number) => {
        try{
            const response = api.post('/user/unfollow', {
                user_id: 1,
                followed_user_id
            })
            .then(function (response) { return response.data })
            .catch(function (error) { console.log(error)})

            return await response          
        } catch(err) {
            console.error(err)
        } 
    }

    const view_profile = async(username: string) => {
        try{
            const response = api.post(`/user/profile/${username}`, {
                user_id: 1,
            })
            .then(function (response) { console.log(response.data) })
            .catch(function (error) { console.log(error)})

            return await response          
        } catch(err) {
            console.error(err)
        } 
    }

    const contextValue = {
        user: data,
        follow,
        unfollow,
        view_profile
    }

    return (
        <UserShowContext.Provider value={contextValue}>
            <View style={container}>
                {children}
            </View>            
        </UserShowContext.Provider>

    )
}