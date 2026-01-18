import React from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import PersistedContext from "@/contexts/Persisted"
import api from "@/api"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

export default function ExcludeAccountScreen() {
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)
    const [loading, setLoading] = React.useState(false)

    const confirmAndDelete = () => {
        Alert.alert(
            "Excluir conta",
            "Esta ação é permanente e irreversível. Todos os seus dados serão removidos. Deseja continuar?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: handleDelete },
            ],
        )
    }

    const handleDelete = async () => {
        const token = session?.account?.jwtToken
        if (!token) {
            Alert.alert("Erro", "Não foi possível autenticar sua sessão.")
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
                "Conta excluída",
                "Sua conta foi excluída com sucesso. Você será redirecionado.",
                [{ text: "OK", onPress: () => router.replace("/") }],
            )
        } catch (e: any) {
            const status = e?.response?.status
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Não foi possível excluir a conta. Tente novamente."
            console.log("❌ Erro ao excluir conta:", status, message)
            Alert.alert("Erro ao excluir conta", status ? `Status: ${status}\n${message}` : message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Excluir conta</Text>
            <Text style={styles.subtitle}>
                A exclusão da sua conta é permanente e irreversível. Todos os seus dados e conteúdo
                serão removidos. Caso deseje prosseguir, confirme a exclusão abaixo.
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Atenção</Text>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>Esta ação não pode ser desfeita.</Text>
                </View>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                        Você perderá acesso à sua conta e aos seus dados.
                    </Text>
                </View>
                <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                        Recomendamos que apenas saia e dê um tempo do Circle App — você poderá
                        voltar se mudar de ideia.
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
                        <Text style={styles.deleteButtonText}>Cancelar</Text>
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
                        <Text style={styles.deleteButtonText}>Excluir Conta</Text>
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
