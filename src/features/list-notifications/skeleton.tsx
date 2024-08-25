import { View } from "../../components/Themed"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../layout/constants/sizes"

export function ListNotificationsSkeleton() {
    const container = {
        paddingLeft: sizes.paddings["1md"],
        width: sizes.screens.width,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    }

    const sectionContainer = {
        marginTop: sizes.paddings["1md"],
    }

    const itemContainer = {
        marginTop: sizes.margins["1md"],
        height: sizes.sizes["2lg"],
        flexDirection: "row",
        justifyContent: "center",
    }
    const itemContainerLeft = {
        width: sizes.sizes["1lg"] * 1.05,
    }

    const itemContainerRight = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <View style={sectionContainer}>
                <Skeleton.View style={{ width: 70, height: 15, borderRadius: 7.5 }} />
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View style={{ width: 55, height: 55, borderRadius: 50 }} />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["1sm"],
                            }}
                        />
                        <Skeleton.View style={{ width: 130, height: 14, borderRadius: 50 }} />
                    </View>
                </View>
            </View>
        </View>
    )
}
