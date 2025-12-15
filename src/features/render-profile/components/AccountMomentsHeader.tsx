import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/Preferences/language"

type AccountMomentsHeaderProps = {
    totalMoments: number
    lastUpdateDate: Date
    dateFormatter: { toRelativeTime: (date: Date) => string }
}

export function AccountMomentsHeader({ totalMoments, lastUpdateDate     dateFormatter,
}: AccountMomentsHeaderProps) {
    
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
        paddingBottom: 8,
    },
    totalText: {
        color: colors.gray.grey_06,
        fontSize: 14,
        fontWeight: "600",
    },
})
