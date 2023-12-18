import React from "react"
import { View } from "react-native"
import { Text } from "../../Themed"
import { UserRootProps } from "../user_show-types"
import UserShowContext from "../user_show-context"

export default function root ({children, data}: UserRootProps) {

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    
    }
    return (
        <UserShowContext.Provider value={{user: data}}>
            <View style={container}>
                {children}
            </View>            
        </UserShowContext.Provider>

    )
}