import { useColorScheme } from "react-native"
import { View } from "../../../../../components/Themed"
import { Skeleton } from "../../../../../components/skeleton"
import { colors } from "../../../../../constants/colors"
import sizes from "../../../../../constants/sizes"

export function ListMemoriesAllSkeleton() {
    const isDarkMode = useColorScheme() === "dark"
    const container = {
        paddingTop: sizes.paddings["1sm"] * 0.5,
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "flex-start",
    }

    const memory = {
        width: sizes.moment.tiny.width * 0.8,
    }

    const header = {
        width: sizes.screens.width,
        height: sizes.headers.height * 0.6,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.margins["1md"],
    }
    return (
        <View style={container}>
            <View style={header}>
                <View style={{ flex: 1 }}>
                    <Skeleton.View style={{ width: 100, height: 16, borderRadius: 10 }} />
                </View>
                <Skeleton.View style={{ width: 40, height: 16, borderRadius: 10 }} />
            </View>
            <View
                style={{
                    flexDirection: "row",
                    width: sizes.screens.width,
                    paddingTop: sizes.paddings["1sm"],
                    paddingBottom: sizes.paddings["1lg"],
                    marginBottom: sizes.margins["1sm"],
                    borderBottomWidth: 1,
                    borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                }}
            >
                <View style={[memory, { marginLeft: sizes.margins["2sm"] }]}>
                    <Skeleton.View
                        style={{
                            width: sizes.moment.tiny.width * 0.8,
                            height: sizes.moment.tiny.height * 0.8,
                            borderRadius: sizes.moment.tiny.borderRadius * 0.8,
                        }}
                    />
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
                <View style={[memory, { marginLeft: sizes.margins["2sm"] }]}>
                    <Skeleton.View
                        style={{
                            width: sizes.moment.tiny.width * 0.8,
                            height: sizes.moment.tiny.height * 0.8,
                            borderRadius: sizes.moment.tiny.borderRadius * 0.8,
                        }}
                    />
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
                <View style={[memory, { marginLeft: sizes.margins["2sm"] }]}>
                    <Skeleton.View
                        style={{
                            width: sizes.moment.tiny.width * 0.8,
                            height: sizes.moment.tiny.height * 0.8,
                            borderRadius: sizes.moment.tiny.borderRadius * 0.8,
                        }}
                    />
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
