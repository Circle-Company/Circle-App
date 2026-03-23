import { ViewStyle } from "react-native"
import { Skeleton } from "../skeleton"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"

export function NotificationSkeleton({ opacity }: { opacity?: number }) {
    const container: ViewStyle = {
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: sizes.screens.height * 0.1,
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.5,
        opacity,
    }

    return <Skeleton.View style={container}></Skeleton.View>
}
