import React from "react"
import {
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native"
import PersistedContext from "@/contexts/Persisted"
import api from "@/api"
import { Directory, Paths } from "expo-file-system"
import sizes from "@/constants/sizes"
import ButtonStandart from "@/components/buttons/button-standart"
import * as Clipboard from "expo-clipboard"
import fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"

export default function PersonalData() {
    const { session } = React.useContext(PersistedContext)
    const [loading, setLoading] = React.useState(false)
    const [result, setResult] = React.useState<string | null>(null)
    const [jsonData, setJsonData] = React.useState<any | null>(null)

    const handleExport = async () => {
        const token = session?.account?.jwtToken
        if (!token) {
            Alert.alert("Erro", "Token não disponível para autenticação.")
            return
        }
        setLoading(true)
        setResult(null)
        try {
            console.log("⬆️ Requesting account data export: GET /account/data")
            const res = await api.get("/account/data", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const payloadStr =
                typeof res?.data === "string" ? res.data : JSON.stringify(res.data, null, 2)
            console.log("✅ Account data export success (length):", payloadStr.length)
            setJsonData(res.data)
            setResult(payloadStr)
        } catch (e: any) {
            const status = e?.response?.status
            let dataStr = ""
            try {
                dataStr = JSON.stringify(e?.response?.data)
            } catch {
                dataStr = String(e?.message ?? e)
            }
            console.log("❌ Account data export error:", status, dataStr)
            Alert.alert("Erro ao exportar dados", status ? `Status: ${status}` : dataStr)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!jsonData) {
            Alert.alert("Nada para baixar", "Faça a solicitação de exportação primeiro.")
            return
        }
        try {
            const username = session?.user?.username ?? "user"
            const usernameSafe = String(username).replace(/[^a-zA-Z0-9._-]/g, "_")
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
            const filename = `circleapp-@${usernameSafe}-${timestamp}.json`
            const dir = new Directory(Paths.document, "CircleApp")
            dir.create({ idempotent: true })
            const file = dir.createFile(filename, "application/json")
            // iOS: garantir criação explícita do arquivo antes de escrever
            file.create({ overwrite: true })
            const payload =
                typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData, null, 2)
            file.write(payload)
            const meta = file.info()
            console.log("⬇️ JSON salvo em documentos:", {
                uri: file.uri,
                exists: file.exists,
                size: meta?.size,
                created: meta?.creationTime,
            })
            Alert.alert("Arquivo salvo", `Arquivo salvo em:\n${file.uri}`)
        } catch (e: any) {
            console.log("❌ Falha ao salvar JSON:", e?.message ?? String(e))
            Alert.alert("Erro ao salvar JSON", e?.message ?? "Tente novamente")
        }
    }

    const handleCopy = async () => {
        if (!jsonData) {
            Alert.alert("Nada para copiar", "Faça a solicitação de exportação primeiro.")
            return
        }
        try {
            const payload =
                typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData, null, 2)
            await Clipboard.setStringAsync(payload)
            Alert.alert("Copiado", "JSON copiado para a área de transferência.")
        } catch (e: any) {
            console.log("❌ Falha ao copiar JSON:", e?.message ?? String(e))
            Alert.alert("Erro ao copiar JSON", e?.message ?? "Tente novamente")
        }
    }

    const handleSaveToFiles = async () => {
        if (!jsonData) {
            Alert.alert("Nada para salvar", "Faça a solicitação de exportação primeiro.")
            return
        }
        try {
            const pickedDir = await Directory.pickDirectoryAsync()
            if (!pickedDir) {
                Alert.alert("Cancelado", "Nenhuma pasta foi selecionada.")
                return
            }
            const username = session?.user?.username ?? "user"
            const usernameSafe = String(username).replace(/[^a-zA-Z0-9._-]/g, "_")
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
            const filename = `circleapp-@${usernameSafe}-${timestamp}.json`

            const file = pickedDir.createFile(filename, "application/json")
            const payload =
                typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData, null, 2)
            file.write(payload)
            console.log("⬇️ JSON salvo via Files app:", file.uri)
            Alert.alert("Arquivo salvo", `Arquivo salvo em:\n${file.uri}`)
        } catch (e: any) {
            console.log("❌ Falha ao salvar via Files app:", e?.message ?? String(e))
            Alert.alert("Erro ao salvar", e?.message ?? "Tente novamente")
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Exportar dados da conta</Text>
            <Text style={styles.explainer}>
                A exportação dos seus dados pessoais é um direito legal do usuário. Oferecemos este
                serviço para que você possa solicitar e baixar um arquivo JSON com as informações
                associadas à sua conta.
            </Text>

            {!jsonData && (
                <Text style={styles.explainer}>
                    Você ainda não exportou seus dados pessoais. Clique no botão abaixo para
                    solicitar a exportação.
                </Text>
            )}
            {!jsonData && (
                <ButtonStandart
                    bounciness={5}
                    animationScale={0.93}
                    borderRadius={50}
                    margins={false}
                    height={46}
                    action={() => {
                        if (!(loading || !!jsonData)) handleExport()
                    }}
                    style={{ marginTop: sizes.margins["1md"] }}
                    backgroundColor={"#fff"}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={[styles.buttonText, { color: colors.gray.black }]}>
                            Solicitar exportação
                        </Text>
                    )}
                </ButtonStandart>
            )}

            {result ? (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>
                        Dados da conta @{session?.user?.username ?? ""}
                    </Text>
                    <ScrollView
                        style={styles.resultScroll}
                        contentContainerStyle={styles.resultScrollContent}
                    >
                        <Text style={styles.resultText}>{result}</Text>
                    </ScrollView>
                </View>
            ) : null}

            {jsonData ? (
                <>
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
                                    if (!loading) handleDownload()
                                }}
                                backgroundColor={colors.gray.grey_07}
                            >
                                <Text style={styles.buttonText}>Baixar</Text>
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
                                    if (!loading && result) handleCopy()
                                }}
                                backgroundColor={colors.gray.grey_07}
                            >
                                <Text style={styles.buttonText}>Copiar</Text>
                            </ButtonStandart>
                        </View>
                    </View>

                    <Text style={styles.hint}>
                        No iPhone, os arquivos exportados são salvos automaticamente em: Arquivos
                        &gt; No Meu iPhone &gt; CircleApp.
                    </Text>
                </>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, alignItems: "center" },
    title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
    explainer: {
        color: "#aaa",
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        marginHorizontal: 10,
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
        fontSize: fonts.size.body * 1,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.white,
    },
    resultBox: {
        backgroundColor: "#141414",
        borderRadius: sizes.borderRadius["1md"],
        paddingVertical: sizes.paddings["1md"],
        paddingHorizontal: sizes.paddings["2md"],
        marginBottom: sizes.margins["1md"],
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2a2a2a",
        height: sizes.screens.height * 0.55,
    },
    resultTitle: { fontWeight: "600", marginBottom: 6, color: "#fff" },
    resultScroll: { flex: 1 },
    resultScrollContent: { paddingBottom: 8 },
    resultText: { color: "#ccc", fontFamily: "Menlo", fontSize: 12, lineHeight: 16 },
    hint: { color: "#888", fontSize: 12, marginTop: 8 },
    buttonsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        width: "100%",
    },
    halfLeft: { flex: 1, marginRight: 6 },
    halfRight: { flex: 1, marginLeft: 6 },
})
