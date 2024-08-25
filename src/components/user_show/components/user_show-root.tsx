import ProfileContext from "@/contexts/profile"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { View } from "react-native"
import PersistedContext from "../../../contexts/Persisted"
import api, { apiRoutes } from "../../../services/Api"
import UserShowContext from "../user_show-context"
import { UserRootProps } from "../user_show-types"

export default function root({ children, data }: UserRootProps) {
    const { session } = React.useContext(PersistedContext)
    const { setCurrentUser } = React.useContext(ProfileContext)

    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const follow = async (followed_user_id: number) => {
        try {
            const response = await api
                .post("/user/follow", {
                    user_id: session.user.id,
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
    const unfollow = async (followed_user_id: number) => {
        try {
            const response = await api
                .post("/user/unfollow", {
                    user_id: session.user.id,
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

    const view_profile = async (id: string) => {
        console.log("view_profile")
        const { data, isSuccess, isError } = useQuery({
            queryKey: [""],
            queryFn: async () =>
                await apiRoutes.user.getByPk({
                    userId: session.user.id,
                    findedUserPk: Number(id),
                }),
        })
        console.log(data)
        if (isSuccess) setCurrentUser(data)
    }

    const contextValue = {
        user: data,
        follow,
        unfollow,
        view_profile,
    }

    return (
        <UserShowContext.Provider value={contextValue}>
            <View style={container}>{children}</View>
        </UserShowContext.Provider>
    )
}
