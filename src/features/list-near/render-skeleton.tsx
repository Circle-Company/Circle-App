import { ViewStyle, useColorScheme } from "react-native"

import { Skeleton } from "../../components/skeleton"
import { View } from "../../components/Themed"
import { colors } from "../../constants/colors"
import sizes from "../../constants/sizes"

export function ListNearToYouSkeleton() {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        width: sizes.screens.width,
        marginTop: sizes.margins["1lg"],
        alignItems: "center",
    }

    const itemContainer: ViewStyle = {
        marginBottom: sizes.margins["2sm"],
        borderRadius: sizes.borderRadius["1md"],
    }

    const titleSkeletonStyle: ViewStyle = {
        width: 180,
        height: 16,
        marginBottom: sizes.margins["1md"],
        borderRadius: sizes.borderRadius["1md"],
    }

    const userSkeletonStyle: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        height: 60,
        marginHorizontal: sizes.paddings["2sm"],
        borderRadius: 20,
    }

    const buttonSkeletonStyle: ViewStyle = {
        marginTop: sizes.margins["1md"],
        width: 180,
        height: 35,
        marginHorizontal: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"],
    }

    return (
        <View style={container}>
            <Skeleton.View
                backgroundColor={isDarkMode ? colors.gray.grey_01 + 80 : colors.gray.grey_09 + 80}
                duration={2000}
                style={titleSkeletonStyle}
            />

            {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={itemContainer}>
                    <Skeleton.View
                        backgroundColor={
                            isDarkMode ? colors.gray.grey_01 + 80 : colors.gray.grey_09 + 80
                        }
                        duration={2000}
                        style={userSkeletonStyle}
                    />
                </View>
            ))}
            <Skeleton.View
                backgroundColor={isDarkMode ? colors.gray.grey_01 + 80 : colors.gray.grey_09 + 80}
                duration={2000}
                style={buttonSkeletonStyle}
            />
        </View>
    )
}
