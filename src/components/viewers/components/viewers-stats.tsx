import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { useViewersContext } from "../viewers-context"

function formatCount(value: number): string {
    if (value < 1000) return String(value)
    if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
    return `${(value / 1_000_000).toFixed(1)}M`
}

/** `averageWatchSeconds` é `null` quando nenhuma view informou duração. */
function formatWatchTime(seconds: number | null): string {
    if (seconds == null) return "—"
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const rest = Math.round(seconds % 60)
    return `${minutes}m ${rest}s`
}

function Stat({ value, label }: { value: string; label: string }) {
    const valueStyle: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.title3,
        color: colors.gray.white,
    }
    const labelStyle: TextStyle = {
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 0.8,
        color: colors.gray.grey_04,
        marginTop: 2,
    }

    return (
        <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={valueStyle}>{value}</Text>
            <Text style={labelStyle} numberOfLines={1}>
                {label}
            </Text>
        </View>
    )
}

export default function Stats() {
    const { t } = React.useContext(LanguageContext)
    const { stats } = useViewersContext()

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1sm"],
        marginBottom: sizes.margins["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.2,
        backgroundColor: colors.gray.grey_09,
    }

    if (!stats) return null

    return (
        <View style={container}>
            <Stat value={formatCount(stats.totalViews)} label={t("Views")} />
            <Stat value={formatCount(stats.uniqueViewers)} label={t("Viewers")} />
            <Stat value={formatCount(stats.completedViews)} label={t("Completed")} />
            <Stat value={formatWatchTime(stats.averageWatchSeconds)} label={t("Avg. time")} />
        </View>
    )
}
