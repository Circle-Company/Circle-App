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
import AppleLogo from "@/assets/icons/svgs/apple-logo.svg"
import LanguageContext from "@/contexts/language"

export default function PersonalData() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [loading, setLoading] = React.useState(false)
    const [result, setResult] = React.useState<string | null>(null)
    const [jsonData, setJsonData] = React.useState<any | null>(null)

    const handleExport = async () => {
        const token = session?.account?.jwtToken
        if (!token) {
            Alert.alert(t("Error"), t("Token not available for authentication."))
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
            Alert.alert(t("Error exporting data"), status ? `${t("Status")}: ${status}` : dataStr)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!jsonData) {
            Alert.alert(t("Nothing to download"), t("Please request the export first."))
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
            Alert.alert(t("File saved"), `${t("File saved at")}:\n${file.uri}`)
        } catch (e: any) {
            console.log("❌ Falha ao salvar JSON:", e?.message ?? String(e))
            Alert.alert(t("Error saving JSON"), e?.message ?? t("Try again"))
        }
    }

    const handleCopy = async () => {
        if (!jsonData) {
            Alert.alert(t("Nothing to copy"), t("Please request the export first."))
            return
        }
        try {
            const payload =
                typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData, null, 2)
            await Clipboard.setStringAsync(payload)
            Alert.alert(t("Copied"), t("JSON copied to clipboard."))
        } catch (e: any) {
            console.log("❌ Falha ao copiar JSON:", e?.message ?? String(e))
            Alert.alert(t("Error copying JSON"), e?.message ?? t("Try again"))
        }
    }

    const handleSaveToFiles = async () => {
        if (!jsonData) {
            Alert.alert(t("Nothing to save"), t("Please request the export first."))
            return
        }
        try {
            const pickedDir = await Directory.pickDirectoryAsync()
            if (!pickedDir) {
                Alert.alert(t("Canceled"), t("No folder was selected."))
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
            Alert.alert(t("File saved"), `${t("File saved at")}:\n${file.uri}`)
        } catch (e: any) {
            console.log("❌ Falha ao salvar via Files app:", e?.message ?? String(e))
            Alert.alert(t("Error saving"), e?.message ?? t("Try again"))
        }
    }

    return (
        <View style={styles.container}>
            {/**
            <View style={styles.appleCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <AppleLogo width={18} height={18} fill={colors.gray.white.toString()} />
                    <Text style={styles.appleCardTitle}>Apple ID</Text>
                </View>
                <View style={styles.appleRow}>
                    <Text style={styles.appleRowLabel}>ID</Text>
                    <View style={styles.appleChip}>
                        <Text style={styles.appleRowValue}>—</Text>
                    </View>
                </View>
                <View style={[styles.appleRow, { marginTop: 6 }]}>
                    <Text style={styles.appleRowLabel}>Email</Text>
                    <View style={styles.appleChip}>
                        <Text style={styles.appleRowValue}>—</Text>
                    </View>
                </View>
            </View>
            */}
            <Text style={styles.title}>{t("Export account data")}</Text>
            <Text style={styles.explainer}>{t("Personal data export explainer")}</Text>

            {!jsonData && (
                <Text style={styles.explainer}>
                    {t(
                        "You haven't exported your personal data yet. Click the button below to request the export.",
                    )}
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
                            {t("Request export")}
                        </Text>
                    )}
                </ButtonStandart>
            )}

            {result ? (
                <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>
                        {t("Account data")} @{session?.user?.username ?? ""}
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
                                <Text style={styles.buttonText}>{t("Download")}</Text>
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
                                <Text style={styles.buttonText}>{t("Copy")}</Text>
                            </ButtonStandart>
                        </View>
                    </View>
                </>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, alignItems: "center" },
    title: {
        width: "100%",
        fontSize: fonts.size.title3 * 0.8,
        fontFamily: fonts.family.Semibold,
        marginBottom: 12,
        textAlign: "left",
        color: "#FFF",
    },
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
    buttonsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        width: "100%",
    },
    halfLeft: { flex: 1, marginRight: 6 },
    halfRight: { flex: 1, marginLeft: 6 },
    appleCard: {
        width: "100%",
        backgroundColor: "#141414",
        borderRadius: sizes.borderRadius["1md"],
        paddingVertical: sizes.paddings["1md"],
        paddingHorizontal: sizes.paddings["2md"],
        marginTop: sizes.margins["1md"],
        marginBottom: sizes.margins["1md"],
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2a2a2a",
    },
    appleCardTitle: {
        marginLeft: 8,
        color: colors.gray.white,
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.1,
    },
    appleRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    appleRowLabel: {
        color: colors.gray.grey_04,
        fontFamily: fonts.family.Medium,
        fontSize: 12,
    },
    appleRowValue: {
        color: colors.gray.white,
        fontFamily: fonts.family.Semibold,
        fontSize: 12,
    },
    appleChip: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: "#1c1c1c",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2a2a2a",
    },
})
