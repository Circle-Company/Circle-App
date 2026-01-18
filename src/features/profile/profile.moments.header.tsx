import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import sizes from "@/constants/sizes"

type AccountMomentsHeaderProps = {
    totalMoments: number
    lastUpdateDate: Date
    dateFormatter: { toRelativeTime: (date: Date) => string }
}

export function AccountMomentsHeader({
    totalMoments,
    lastUpdateDate,
    dateFormatter,
}: AccountMomentsHeaderProps) {
    const { t } = React.useContext(LanguageContext)
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.totalText}>
                {totalMoments} {totalMoments === 1 ? "Moment" : "Moments"}
                {","} {t("updated")} {dateFormatter.toRelativeTime(lastUpdateDate)}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 10,
        paddingTop: sizes.margins["1lg"],
        paddingBottom: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    totalText: {
        color: colors.gray.grey_04,
        fontSize: 14,
        fontWeight: "600",
    },
})
