import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import { useLocaleDateRelative, useLocaleDateRelative2 } from "@/lib/hooks/useLocaleDate"

type AccountMomentsHeaderProps = {
    totalMoments: number
    lastUpdateDate: Date
}

export function AccountMomentsHeader({ totalMoments, lastUpdateDate }: AccountMomentsHeaderProps) {
    const { t } = React.useContext(LanguageContext)

    const relativeDate = useLocaleDateRelative2(String(lastUpdateDate)).toLowerCase()

    return (
        <View style={styles.headerContainer}>
            <Text style={styles.totalText}>
                {totalMoments} {totalMoments === 1 ? "Moment" : "Moments"}
                {","} {t("updated")} {relativeDate}
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
