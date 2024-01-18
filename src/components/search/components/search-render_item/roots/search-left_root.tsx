import React from "react"
import { View, Text } from "react-native"
import { useSearchContext } from "../../../search-context"
import { SearchLeftRootProps } from "../../../search-types"
import sizes from "../../../../../layout/constants/sizes"

export default function left_root ({children}: SearchLeftRootProps) {
    const { search } = useSearchContext()

    const container:any = {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingHorizontal: sizes.paddings["1md"],
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}