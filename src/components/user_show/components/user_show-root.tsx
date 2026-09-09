import PersistedContext from "../../../contexts/Persisted"
import React from "react"
import { UserRootProps } from "../user_show-types"
import UserShowContext from "../user_show-context"
import { View } from "react-native"
import api from "../../../api"

export default function UserShowRoot({ children, data, executeBeforeClick }: UserRootProps) {
    const { session } = React.useContext(PersistedContext)
    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const follow = async (followed_user_id: string) => {
        try {
            const response = await api
                .post("/user/follow", {
                    user_id: session.account.userId,
                    followed_user_id,
                })
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })

            return await response
        } catch (err) {
            console.error(err)
        }
    }
    const unfollow = async (followed_user_id: string) => {
        try {
            const response = await api
                .post("/user/unfollow", {
                    user_id: session.account.userId,
                    followed_user_id,
                })
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })

            return await response
        } catch (err) {
            console.error(err)
        }
    }

    const contextValue: any = {
        user: data,
        executeBeforeClick,
        follow,
        unfollow,
    }

    return (
        <UserShowContext.Provider value={contextValue}>
            <View style={container}>{children}</View>
        </UserShowContext.Provider>
    )
}
