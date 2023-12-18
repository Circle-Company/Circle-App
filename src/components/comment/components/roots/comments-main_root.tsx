import React from "react"
import { View, Text } from "react-native"
import { CommentsMainRootProps } from "../../comments-types"
import CommentContext from "../../comments-context"

export default function main_root ({children, data}: CommentsMainRootProps) {

    const container: any = {
    }
    return (
        <CommentContext.Provider value={{comment: data}}>
            <View style={container}>
                {children}
            </View>     
                 
        </CommentContext.Provider>

    )
}