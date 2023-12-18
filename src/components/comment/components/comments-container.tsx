import React from "react"
import { View, Text } from "react-native"
import { CommentsContainerProps } from "../comments-types"
import sizes from "../../../layout/constants/sizes"
import { useMomentContext } from "../../moment/moment-context"

export default function container ({children, focused}: CommentsContainerProps) {
    const {momentSizes} = useMomentContext()
    
    const container:any = {
        width: momentSizes.width,
    }

    if(focused) {
        return (
            <View style={container}>
                {children}
            </View>
        )           
    }
    else return null
    

}