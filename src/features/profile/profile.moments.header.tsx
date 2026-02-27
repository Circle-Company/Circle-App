import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import { useLocaleDateRelative, useLocaleDateRelative2 } from "@/lib/hooks/useLocaleDate"
import fonts from "@/constants/fonts"
type AccountMomentsHeaderProps = {
    totalMoments: number
    lastUpdateDate: Date
    isBlockedBy: boolean
    isBlocking: boolean
}

export function AccountMomentsHeader({
    totalMoments,
    lastUpdateDate,
    isBlockedBy,
    isBlocking,
}: AccountMomentsHeaderProps) {
    const { t } = React.useContext(LanguageContext)

    const relativeDate = useLocaleDateRelative2(String(lastUpdateDate)).toLowerCase()

    if (isBlocking) return null
    else if (isBlockedBy) return null
    else
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
        fontSize: fonts.size.body,
        fontWeight: "600",
    },
})
