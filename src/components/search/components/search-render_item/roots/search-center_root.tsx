import React from "react"
import { View } from "react-native"
import { useSearchContext } from "../../../search-context"
import { SearchCenterRootProps } from "../../../search-types"
import sizes from "../../../../../layout/constants/sizes"

export default function center_root({ children }: SearchCenterRootProps) {
    const { search } = useSearchContext()

    const container: any = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingHorizontal: sizes.paddings["1md"],
    }

    return <View style={container}>{children}</View>
}
