import React from "react"
import { Dimensions } from "react-native"
import sizes from "../../layout/constants/sizes"

const MIN_POST_HEIGHT = sizes.moment.standart.height

export function useInitialNumToRender(minItemHeight: number = MIN_POST_HEIGHT) {
    return React.useMemo(() => {
        const screenHeight = Dimensions.get("window").height
        return Math.ceil(screenHeight / minItemHeight) + 1
    }, [minItemHeight])
}
