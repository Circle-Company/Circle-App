import React from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/language"
import api from "@/api"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

export default function ExcludeAccountScreen() {
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [loading, setLoading] = React.useState(false)

    const confirmAndDelete = () => {
        Alert.alert(
            t("Delete account"),
            t(
                "This action is permanent and irreversible. All your data will be removed. Do you want to continue?",
            ),
            [
                { text: t("Cancel"), style: "cancel" },
                { text: t("Delete"), style: "destructive", onPress: handleDelete },
            ],
        )
    }

    const handleDelete = async () => {
        const token = session?.account?.jwtToken
        if (!token) {
            Alert.alert(t("Error"), t("It was not possible to authenticate your session."))
            return
        }

        try {
            setLoading(true)

            // Solicitação de exclusão da conta
            const res = await api.delete("/account", {
                headers: { Authorization: `Bearer ${token}` },
            })

            // Limpeza local de sessão e dados persistidos
            try {
                session?.user?.remove?.()
                session?.account?.remove?.()
                session?.preferences?.remove?.()
                session?.metrics?.remove?.()
            } catch {}

            Alert.alert(
                t("Account deleted"),
                t("Your account has been successfully deleted. You will be redirected."),
                [{ text: t("Confirm"), onPress: () => router.replace("/") }],
            )
        } catch (e: any) {
            const status = e?.response?.status
            const message =
                e?.response?.data?.message ||
                e?.message ||
                t("It was not possible to delete the account. Please try again.")
            console.log("❌ Erro ao excluir conta:", status, message)
            Alert.alert(
                t("Error deleting account"),
                status ? `${t("Status")}: ${status}\n${message}` : message,
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t("Delete account")}</Text>
            <Text style={styles.subtitle}>
                {t(
                    "Deleting your account is permanent and irreversible. All your data and content will be removed. If you wish to proceed, confirm the deletion below.",
                )}
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("Attention")}</Text>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{t("This action cannot be undone.")}</Text>
                </View>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                        {t("You will lose access to your account and your data.")}
                    </Text>
                </View>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                        {t(
                            "We recommend you just sign out and take a break from Circle App — you can come back if you change your mind.",
                        )}
                    </Text>
                </View>
            </View>

            <View style={styles.buttonsRow}>
                <View style={styles.halfLeft}>
                    <ButtonStandart
                        bounciness={5}
                        animationScale={0.93}
                        borderRadius={50}
                        margins={false}
                        height={46}
                        width={"100%" as any}
                        action={() => {
                            if (!loading) router.back()
                        }}
                        backgroundColor={colors.red.red_05.toString()}
                    >
                        <Text style={styles.deleteButtonText}>{t("Cancel")}</Text>
                    </ButtonStandart>
                </View>
                <View style={styles.halfRight}>
                    <ButtonStandart
                        bounciness={5}
                        animationScale={0.93}
                        borderRadius={50}
                        margins={false}
                        height={46}
                        width={"100%" as any}
                        action={() => {
                            if (!loading) confirmAndDelete()
                        }}
                        backgroundColor={colors.gray.grey_08.toString()}
                    >
                        <Text style={styles.deleteButtonText}>{t("Delete Account")}</Text>
                    </ButtonStandart>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        color: "#aaa",
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#141414",
        borderRadius: sizes.borderRadius["1md"],
        paddingVertical: sizes.paddings["1md"],
        paddingHorizontal: sizes.paddings["2md"],
        marginBottom: sizes.margins["1md"],
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2a2a2a",
    },
    cardTitle: {
        color: "#ff5555",
        fontWeight: "700",
        marginBottom: 6,
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    bulletDot: {
        color: "#ff5555",
        marginRight: 8,
        lineHeight: 18,
        fontSize: 16,
    },
    bulletText: {
        color: "#ccc",
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },
    deleteButton: {
        backgroundColor: "#d32f2f",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteButtonDisabled: {
        opacity: 0.7,
    },
    deleteButtonText: {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.white,
    },
    cancelButton: {
        marginTop: 12,
        alignItems: "center",
        paddingVertical: 10,
    },
    cancelText: {
        color: "#888",
        textDecorationLine: "underline",
    },
    buttonsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    halfLeft: {
        flex: 1,
        marginRight: 5,
    },
    halfRight: {
        flex: 1,
        marginLeft: 5,
    },
})
