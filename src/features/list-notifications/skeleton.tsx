import { View } from "../../components/Themed"
import { Skeleton } from "../../components/skeleton"
import sizes from "../../constants/sizes"

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
        flexDirection: "row",
        justifyContent: "center",
    }
    const itemContainerLeft = {
        width: sizes.sizes["1lg"] * 1.05,
    }

    const itemContainerRight = {
        alignItems: "flex-start",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <View style={sectionContainer}>
                <Skeleton.View
                    duration={3000}
                    style={{ width: 70, height: 15, borderRadius: 7.5 }}
                />
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
            </View>
            <View style={sectionContainer}>
                <Skeleton.View
                    duration={3000}
                    style={{ width: 70, height: 15, borderRadius: 7.5 }}
                />
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
                <View style={itemContainer}>
                    <View style={itemContainerLeft}>
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 55, height: 55, borderRadius: 50 }}
                        />
                    </View>
                    <View style={itemContainerRight}>
                        <Skeleton.View
                            duration={3000}
                            style={{
                                width: 55,
                                height: 14,
                                borderRadius: 50,
                                marginBottom: sizes.margins["2sm"],
                            }}
                        />
                        <Skeleton.View
                            duration={3000}
                            style={{ width: 130, height: 14, borderRadius: 50 }}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}
