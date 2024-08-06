import { View } from "../../../components/Themed"
import { Memory } from "../../../components/memory"
import { Skeleton } from "../../../components/skeleton"
import sizes from "../../../layout/constants/sizes"

export function ListMemoriesPreviewSkeleton() {
    const container = {
        paddingTop: sizes.paddings["1md"],
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const memoriesContainer = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1sm"],
    }

    const memory = {
        width: sizes.moment.tiny.width,
        alignItems: "center",
        justifyContent: "center",
    }
    return (
        <View style={container}>
            <Memory.Header>
                <Memory.HeaderLeft>
                    <Skeleton.View style={{ width: 70, height: 20, borderRadius: 10 }} />
                </Memory.HeaderLeft>
                <Memory.HeaderRight>
                    <Skeleton.View style={{ width: 70, height: 20, borderRadius: 10 }} />
                </Memory.HeaderRight>
            </Memory.Header>

            <View style={memoriesContainer}>
                <View style={memory}>
                    <Skeleton.View style={sizes.moment.tiny} />
                    <Skeleton.View
                        style={{
                            alignSelf: "center",
                            width: 70,
                            height: 16,
                            borderRadius: 10,
                            marginTop: sizes.margins["2sm"],
                        }}
                    />
                </View>

                <View style={[memory, , { marginLeft: sizes.margins["3sm"] }]}>
                    <Skeleton.View style={sizes.moment.tiny} />
                    <Skeleton.View
                        style={{
                            alignSelf: "center",
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
