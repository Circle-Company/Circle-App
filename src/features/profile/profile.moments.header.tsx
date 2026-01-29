import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import { useLocaleDateRelative } from "@/lib/hooks/useLocaleDate"

type AccountMomentsHeaderProps = {
    totalMoments: number
    lastUpdateDate: Date
}

export function AccountMomentsHeader({ totalMoments, lastUpdateDate }: AccountMomentsHeaderProps) {
    const { t } = React.useContext(LanguageContext)
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.totalText}>
                {totalMoments} {totalMoments === 1 ? "Moment" : "Moments"}
                {","} {t("updated")}{" "}
                {useLocaleDateRelative(lastUpdateDate.toISOString()).toLowerCase()}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    totalText: {
        color: colors.gray.grey_04,
        fontSize: 14,
        fontWeight: "600",
    },
})
