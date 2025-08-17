import React from "react"
import { View, ViewStyle } from "react-native"
import { Skeleton } from "../../../../../components/skeleton"
import sizes from "../../../../../constants/sizes"

export function ListMemoriesPreviewSkeleton() {
    const container: ViewStyle = {
        paddingTop: sizes.paddings["1xl"],
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const memoriesContainer: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1xl"],
        marginTop: sizes.margins["1sm"],
    }

    const memory: ViewStyle = {
        width: sizes.moment.tiny.width,
        alignItems: "center",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <View style={memoriesContainer}>
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                        <Skeleton.View
                            style={[
                                sizes.moment.tiny,
                                {
                                    height: sizes.moment.tiny.height * 0.95,
                                    width: sizes.moment.tiny.width * 0.95,
                                },
                            ]}
                        />
                        <Skeleton.View
                            style={[
                                sizes.moment.tiny,
                                {
                                    marginLeft: 0,
                                    height: sizes.moment.tiny.height * 0.7,
                                    width: sizes.moment.tiny.width * 0.1,
                                },
                            ]}
                        />
                    </View>
                    <Skeleton.View
                        style={{
                            marginLeft: sizes.moment.tiny.width / 2 - 70 / 2,
                            alignSelf: "flex-start",
                            width: 70,
                            height: 16,
                            borderRadius: 10,
                            marginTop: sizes.margins["2sm"],
                        }}
                    />
                </View>
                <View style={[memory, { marginLeft: 10 }]}>
                    <Skeleton.View
                        style={[
                            sizes.moment.tiny,
                            {
                                height: sizes.moment.tiny.height * 0.95,
                                width: sizes.moment.tiny.width * 0.95,
                            },
                        ]}
                    />
                    <Skeleton.View
                        style={{
                            marginLeft: sizes.moment.tiny.width / 2 - 70 / 2,
                            alignSelf: "flex-start",
                            width: 70,
                            height: 16,
                            borderRadius: 10,
                            marginTop: sizes.margins["2sm"],
                        }}
                    />
                </View>
            </View>
        </View>
    )
}
